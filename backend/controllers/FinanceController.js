const pool = require('../config/db');

const PAYBILL_NUMBER = process.env.MPESA_PAYBILL_NUMBER || process.env.MPESA_SHORTCODE || '';
const CURRENT_SCHOOL_TERM = process.env.CURRENT_SCHOOL_TERM || 'T1-2026';

function parseMpesaDate(value) {
  const input = String(value || '');
  const match = input.match(/^(\d{4})(\d{2})(\d{2})/);
  if (!match) return new Date().toISOString().slice(0, 10);
  return `${match[1]}-${match[2]}-${match[3]}`;
}

function paybillResponse(resultCode, resultDesc) {
  return { ResultCode: resultCode, ResultDesc: resultDesc };
}

function normalizeReference(value) {
  return String(value || '').trim().replace(/\s+/g, ' ').toLowerCase();
}

/**
 * A PayBill account reference can be either the admission number or the
 * learner's full name. Full names must resolve to exactly one learner.
 */
async function findEnrollmentByReference(connection, reference) {
  const normalizedReference = normalizeReference(reference);
  const [rows] = await connection.query(`
    SELECT se.student_id, se.admission_number, se.class_name,
      CONCAT_WS(' ', s.first_name, s.middle_name, s.last_name) AS student_name
    FROM student_enrollments se
    JOIN students s ON s.id = se.student_id
  `);
  const admissionMatches = rows.filter((row) => normalizeReference(row.admission_number) === normalizedReference);
  if (admissionMatches.length === 1) return { enrollment: admissionMatches[0] };
  const nameMatches = rows.filter((row) => normalizeReference(row.student_name) === normalizedReference);
  if (nameMatches.length === 1) return { enrollment: nameMatches[0] };
  return { ambiguous: nameMatches.length > 1 };
}

function classGroup(className) {
  const normalized = String(className || '').toLowerCase().replace(/\s+/g, ' ').trim();
  if (normalized === 'playgroup') return 'Playgroup';
  if (normalized === 'pp1' || normalized === 'pp 1') return 'PP1';
  if (normalized === 'pp2' || normalized === 'pp 2') return 'PP2';
  const grade = normalized.match(/^grade\s*(\d+)$/);
  if (!grade) return null;
  const number = Number(grade[1]);
  if (number >= 1 && number <= 3) return 'Grade 1-3';
  if (number >= 4 && number <= 5) return 'Grade 4-5';
  if (number === 6) return 'Grade 6';
  if (number >= 7 && number <= 8) return 'Grade 7-8';
  if (number === 9) return 'Grade 9';
  return null;
}

async function getStudentBalance(request, response) {
  try {
    const admissionNumber = String(request.query.admissionNumber || '').trim();
    const term = String(request.query.term || '').trim();
    if (!admissionNumber || !term) return response.status(400).json({ message: 'Admission number and term are required.' });

    const [enrollments] = await pool.query('SELECT student_id, class_name FROM student_enrollments WHERE admission_number = ?', [admissionNumber]);
    if (!enrollments.length) return response.status(404).json({ message: 'Student not found.' });
    const group = classGroup(enrollments[0].class_name);
    if (!group) return response.status(400).json({ message: `No fee structure is configured for ${enrollments[0].class_name}.` });

    const [[structure]] = await pool.query('SELECT amount FROM tuition_fee_structure WHERE class_group = ? AND term = ?', [group, term]);
    if (!structure) return response.status(404).json({ message: `No fee structure is configured for ${group} in ${term}.` });
    const [[payment]] = await pool.query("SELECT COALESCE(SUM(amount), 0) AS paid FROM payments WHERE student_id = ? AND term = ? AND status = 'Success'", [enrollments[0].student_id, term]);
    const feeAmount = Number(structure.amount);
    const paid = Number(payment.paid);
    response.json({ class_group: group, term, fee_amount: feeAmount, paid, balance: Math.max(0, feeAmount - paid), credit: Math.max(0, paid - feeAmount) });
  } catch (error) {
    console.error('Unable to retrieve student balance:', error);
    response.status(500).json({ message: 'Unable to retrieve student balance.' });
  }
}

async function getFees(request, response) {
  try {
    const branchName = request.query.branch;
    let query = `
      SELECT 
        p.id, 
        p.receipt_no, 
        se.admission_number AS student_id, 
        s.parent_guardian AS parent_name, 
        COALESCE(fc.code, 'Various') AS fee_code,
        p.amount, 
        p.payment_method, 
        DATE_FORMAT(p.payment_date, '%Y-%m-%d') AS payment_date, 
        COALESCE(p.term, 'Various') AS term,
        p.remarks,
        p.status,
        p.mpesa_receipt_number,
        p.payment_date AS created_at, 
        b.name AS branch
      FROM payments p
      JOIN students s ON p.student_id = s.id
      JOIN student_enrollments se ON s.id = se.student_id
      JOIN branches b ON se.branch_id = b.id
      LEFT JOIN fee_categories fc ON fc.id = p.fee_category_id
    `;
    const params = [];

    const conditions = [];
    if (branchName) {
      conditions.push('b.name = ?');
      params.push(branchName);
    }
    if (request.query.feeCode) {
      conditions.push('fc.code = ?');
      params.push(String(request.query.feeCode).trim());
    }
    if (conditions.length) query += ` WHERE ${conditions.join(' AND ')}`;
    
    query += ` ORDER BY p.id DESC LIMIT 100`;

    const [rows] = await pool.query(query, params);
    response.json({ fees: rows });
  } catch (error) {
    console.error('Unable to retrieve fees:', error);
    response.status(500).json({ fees: [], message: 'Unable to retrieve fees' });
  }
}

async function createFee(request, response) {
  let connection;
  try {
    connection = await pool.getConnection();
    const { receipt_no, student_id: admission_number, parent_name, fee_code, amount, payment_method, payment_date, term, remarks, branch } = request.body;

    if (!receipt_no || !admission_number || !amount || !payment_method || !payment_date) {
      return response.status(400).json({ message: 'Missing required fields for fee payment.' });
    }

    await connection.beginTransaction();

    // Find student ID
    const [enrollments] = await connection.query('SELECT student_id FROM student_enrollments WHERE admission_number = ?', [admission_number]);
    if (enrollments.length === 0) {
       await connection.rollback();
       return response.status(404).json({ message: 'Student not found.' });
    }
    const studentId = enrollments[0].student_id;

    const [feeCategories] = await connection.query('SELECT id FROM fee_categories WHERE code = ?', [fee_code]);
    if (!feeCategories.length) {
      await connection.rollback();
      return response.status(400).json({ message: 'Unknown fee category.' });
    }
    const feeCategoryId = feeCategories[0].id;

    // Create payment
    const fullRemarks = `Term: ${term} | Fee: ${fee_code} | ${remarks || ''}`;
    let paymentStatus = 'Success';
    const [result] = await connection.query(
      `INSERT INTO payments (student_id, receipt_no, amount, payment_method, payment_date, fee_category_id, term, remarks, status, checkout_request_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [studentId, receipt_no, amount, payment_method, payment_date, feeCategoryId, term, fullRemarks, paymentStatus, null]
    );

    // Keep the invoice item linked to the same structured category as the payment.
    const [invResult] = await connection.query(
      `INSERT INTO invoices (student_id, invoice_date, due_date, total_amount, status) VALUES (?, ?, ?, ?, ?)`,
      [studentId, payment_date, payment_date, amount, paymentStatus === 'Success' ? 'Paid' : 'Unpaid']
    );
    await connection.query(
      `INSERT INTO invoice_items (invoice_id, fee_category_id, amount) VALUES (?, ?, ?)`,
      [invResult.insertId, feeCategoryId, amount]
    );

    await connection.commit();

    response.status(201).json({
      fee: {
        id: result.insertId,
        receipt_no,
        student_id: admission_number,
        parent_name,
        fee_code,
        amount,
        payment_method,
        payment_date,
        term,
        remarks,
        branch,
        status: paymentStatus
      },
    });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Unable to create fee record:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return response.status(409).json({ message: 'Receipt number already exists.' });
    }
    response.status(500).json({ message: 'Unable to save fee record.' });
  } finally {
    if (connection) connection.release();
  }
}

/**
 * Safaricom calls this before completing a C2B PayBill transaction. The
 * parent's account reference must be the learner's full name or admission number.
 */
async function paybillValidation(request, response) {
  try {
    const reference = String(request.body.BillRefNumber || '').trim();
    if (!reference) {
      return response.json(paybillResponse('C2B00012', 'Student name is required.'));
    }
    const result = await findEnrollmentByReference(pool, reference);
    if (!result.enrollment) {
      return response.json(paybillResponse('C2B00012', result.ambiguous
        ? 'More than one student has this name. Use the admission number.'
        : 'Student name was not found.'));
    }

    response.json(paybillResponse(0, 'Accepted'));
  } catch (error) {
    console.error('Error validating M-Pesa PayBill transaction:', error);
    // Do not accept a transaction when the school cannot verify its reference.
    response.json(paybillResponse('C2B00012', 'Unable to validate payment reference.'));
  }
}

/**
 * Safaricom posts completed C2B PayBill transactions here. A transaction ID
 * is unique, so retries from Safaricom cannot create duplicate fee payments.
 */
async function paybillConfirmation(request, response) {
  let connection;
  try {
    const transaction = request.body || {};
    const transactionId = String(transaction.TransID || '').trim();
    const reference = String(transaction.BillRefNumber || '').trim();
    const amount = Number(transaction.TransAmount);

    if (!transactionId || !reference || !Number.isFinite(amount) || amount <= 0) {
      console.error('Invalid M-Pesa PayBill confirmation:', transaction);
      return response.json(paybillResponse('C2B00012', 'Invalid payment confirmation.'));
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [existing] = await connection.query(
      'SELECT id FROM payments WHERE mpesa_receipt_number = ?',
      [transactionId]
    );
    if (existing.length) {
      await connection.commit();
      return response.json(paybillResponse(0, 'Already received.'));
    }

    const match = await findEnrollmentByReference(connection, reference);
    if (!match.enrollment) {
      await connection.rollback();
      console.error(`PayBill confirmation has no matching learner: ${reference}`);
      return response.json(paybillResponse('C2B00012', match.ambiguous
        ? 'More than one student has this name. Use the admission number.'
        : 'Student name was not found.'));
    }
    const enrollment = match.enrollment;
    const [feeCategories] = await connection.query("SELECT id FROM fee_categories WHERE code = 'TUI'");
    const feeCategoryId = feeCategories[0]?.id || null;

    const payer = [transaction.FirstName, transaction.MiddleName, transaction.LastName]
      .filter(Boolean)
      .join(' ');
    const remarks = [
      'Source: M-Pesa PayBill',
      `Account: ${reference}`,
      transaction.MSISDN ? `Phone: ${transaction.MSISDN}` : '',
      payer ? `Payer: ${payer}` : ''
    ].filter(Boolean).join(' | ');

    await connection.query(
      `INSERT INTO payments
        (student_id, receipt_no, amount, payment_method, payment_date, fee_category_id, term, remarks, status, mpesa_receipt_number)
       VALUES (?, ?, ?, 'M-Pesa PayBill', ?, ?, ?, ?, 'Success', ?)`,
      [enrollment.student_id, `MPESA-${transactionId}`, amount, parseMpesaDate(transaction.TransTime), feeCategoryId, CURRENT_SCHOOL_TERM, remarks, transactionId]
    );

    await connection.commit();
    response.json(paybillResponse(0, 'Payment recorded.'));
  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Error recording M-Pesa PayBill payment:', error);
    response.json(paybillResponse('C2B00012', 'Unable to record payment.'));
  } finally {
    if (connection) connection.release();
  }
}

function getPaybillDetails(request, response) {
  response.json({
    paybill_number: PAYBILL_NUMBER || null,
    account_reference_label: 'Student full name'
  });
}

async function checkPaymentStatus(request, response) {
  try {
    const receipt_no = request.params.receipt_no;
    const [rows] = await pool.query(
      'SELECT status, mpesa_receipt_number FROM payments WHERE receipt_no = ?',
      [receipt_no]
    );

    if (rows.length === 0) {
      return response.status(404).json({ message: 'Payment not found' });
    }

    response.json({
      status: rows[0].status,
      mpesa_receipt_number: rows[0].mpesa_receipt_number
    });
  } catch (error) {
    console.error('Error checking payment status:', error);
    response.status(500).json({ message: 'Error checking payment status' });
  }
}

module.exports = {
  getFees,
  getStudentBalance,
  createFee,
  paybillValidation,
  paybillConfirmation,
  getPaybillDetails,
  checkPaymentStatus
};
