const pool = require('../../config/db');

async function payments(branch, search = '') {
  const conditions = []; const params = [];
  if (branch) { conditions.push('b.name = ?'); params.push(branch); }
  if (search) { conditions.push('(p.receipt_no LIKE ? OR se.admission_number LIKE ? OR s.first_name LIKE ? OR s.last_name LIKE ?)'); const term = `%${search}%`; params.push(term, term, term, term); }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const [rows] = await pool.query(`SELECT p.id,p.receipt_no,p.amount,p.payment_method,p.status,DATE_FORMAT(p.payment_date,'%Y-%m-%d') payment_date,se.admission_number,CONCAT_WS(' ',s.first_name,s.middle_name,s.last_name) student_name,b.name branch FROM payments p JOIN students s ON s.id=p.student_id JOIN student_enrollments se ON se.student_id=s.id JOIN branches b ON b.id=se.branch_id ${where} ORDER BY p.payment_date DESC,p.id DESC LIMIT 200`, params);
  return rows;
}

async function summary(branch) {
  const [rows] = await pool.query(`SELECT COUNT(*) payment_count,COALESCE(SUM(CASE WHEN p.status='Success' THEN p.amount ELSE 0 END),0) collected FROM payments p JOIN student_enrollments se ON se.student_id=p.student_id JOIN branches b ON b.id=se.branch_id ${branch ? 'WHERE b.name = ?' : ''}`, branch ? [branch] : []);
  return rows[0];
}
module.exports = { payments, summary };
