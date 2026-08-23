const pool = require('../config/db');

async function getFees(request, response) {
  try {
    const branchName = request.query.branch;
    let query = `
      SELECT 
        p.id, 
        p.receipt_no, 
        se.admission_number AS student_id, 
        s.parent_guardian AS parent_name, 
        'Various' AS fee_code, 
        p.amount, 
        p.payment_method, 
        DATE_FORMAT(p.payment_date, '%Y-%m-%d') AS payment_date, 
        'Various' AS term, 
        p.remarks, 
        p.payment_date AS created_at, 
        b.name AS branch
      FROM payments p
      JOIN students s ON p.student_id = s.id
      JOIN student_enrollments se ON s.id = se.student_id
      JOIN branches b ON se.branch_id = b.id
    `;
    const params = [];

    if (branchName) {
      query += ` WHERE b.name = ?`;
      params.push(branchName);
    }
    
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

    // Create payment
    const fullRemarks = `Term: ${term} | Fee: ${fee_code} | ${remarks || ''}`;
    const [result] = await connection.query(
      `INSERT INTO payments (student_id, receipt_no, amount, payment_method, payment_date, remarks)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [studentId, receipt_no, amount, payment_method, payment_date, fullRemarks]
    );

    // Create Invoice (Optional, to link it to the schema)
    const [feeCats] = await connection.query('SELECT id FROM fee_categories WHERE code = ?', [fee_code]);
    if (feeCats.length > 0) {
        const feeCatId = feeCats[0].id;
        const [invResult] = await connection.query(
            `INSERT INTO invoices (student_id, invoice_date, due_date, total_amount, status) VALUES (?, ?, ?, ?, 'Paid')`,
            [studentId, payment_date, payment_date, amount]
        );
        await connection.query(
            `INSERT INTO invoice_items (invoice_id, fee_category_id, amount) VALUES (?, ?, ?)`,
            [invResult.insertId, feeCatId, amount]
        );
    }

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
        branch
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

module.exports = { getFees, createFee };
