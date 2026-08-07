const pool = require('../config/db');

async function getFees(request, response) {
  try {
    const feeCode = request.query.feeCode;
    let query = `
      SELECT id, receipt_no, student_id, parent_name, fee_code, amount, payment_method, payment_date, term, remarks, created_at
      FROM fees
    `;
    const params = [];

    if (feeCode) {
      query += ` WHERE fee_code = ?`;
      params.push(feeCode);
    }

    query += ` ORDER BY created_at DESC LIMIT 50`;

    const [rows] = await pool.query(query, params);
    response.json({ fees: rows });
  } catch (error) {
    console.error('Unable to retrieve fees:', error.message);
    response.status(500).json({ fees: [], message: 'Unable to retrieve fees' });
  }
}

async function createFee(request, response) {
  try {
    const { receipt_no, student_id, parent_name, fee_code, amount, payment_method, payment_date, term, remarks } = request.body;

    if (!receipt_no || !student_id || !fee_code || !amount || !payment_method || !payment_date || !term) {
      return response.status(400).json({ message: 'Missing required fields for fee payment.' });
    }

    const [result] = await pool.query(
      `INSERT INTO fees
        (receipt_no, student_id, parent_name, fee_code, amount, payment_method, payment_date, term, remarks)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [receipt_no, student_id, parent_name, fee_code, amount, payment_method, payment_date, term, remarks]
    );

    response.status(201).json({
      fee: {
        id: result.insertId,
        receipt_no,
        student_id,
        parent_name,
        fee_code,
        amount,
        payment_method,
        payment_date,
        term,
        remarks
      },
    });
  } catch (error) {
    console.error('Unable to create fee record:', error.message);
    if (error.code === 'ER_DUP_ENTRY') {
      return response.status(409).json({ message: 'Receipt number already exists.' });
    }
    response.status(500).json({ message: 'Unable to save fee record.' });
  }
}

module.exports = { getFees, createFee };
