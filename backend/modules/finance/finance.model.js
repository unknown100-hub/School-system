const pool = require('../../config/db');

async function payments(branch, search = '') {
  const conditions = []; const params = [];
  if (branch) { conditions.push('b.name = ?'); params.push(branch); }
  if (search) { conditions.push('(p.receipt_no LIKE ? OR se.admission_number LIKE ? OR s.first_name LIKE ? OR s.last_name LIKE ?)'); const term = `%${search}%`; params.push(term, term, term, term); }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const [rows] = await pool.query(`SELECT
    p.id, p.receipt_no, p.amount, p.payment_method, p.status,
    DATE_FORMAT(p.payment_date, '%Y-%m-%d') payment_date, p.term,
    se.admission_number, CONCAT_WS(' ', s.first_name, s.middle_name, s.last_name) student_name,
    b.name branch, tfs.amount AS term_fee,
    CASE WHEN tfs.amount IS NULL THEN NULL ELSE GREATEST(tfs.amount - COALESCE((
      SELECT SUM(previous_payment.amount)
      FROM payments previous_payment
      WHERE previous_payment.student_id = p.student_id
        AND previous_payment.term = p.term
        AND previous_payment.status = 'Success'
    ), 0), 0) END AS outstanding_balance
    FROM payments p
    JOIN students s ON s.id = p.student_id
    JOIN student_enrollments se ON se.student_id = s.id
    JOIN branches b ON b.id = se.branch_id
    LEFT JOIN tuition_fee_structure tfs ON tfs.term = p.term AND tfs.class_group = CASE
      WHEN LOWER(TRIM(se.class_name)) = 'playgroup' THEN 'Playgroup'
      WHEN LOWER(REPLACE(TRIM(se.class_name), ' ', '')) = 'pp1' THEN 'PP1'
      WHEN LOWER(REPLACE(TRIM(se.class_name), ' ', '')) = 'pp2' THEN 'PP2'
      WHEN LOWER(TRIM(se.class_name)) REGEXP '^grade[[:space:]]*[1-3]$' THEN 'Grade 1-3'
      WHEN LOWER(TRIM(se.class_name)) REGEXP '^grade[[:space:]]*[4-5]$' THEN 'Grade 4-5'
      WHEN LOWER(TRIM(se.class_name)) REGEXP '^grade[[:space:]]*6$' THEN 'Grade 6'
      WHEN LOWER(TRIM(se.class_name)) REGEXP '^grade[[:space:]]*[7-8]$' THEN 'Grade 7-8'
      WHEN LOWER(TRIM(se.class_name)) REGEXP '^grade[[:space:]]*9$' THEN 'Grade 9'
      ELSE NULL
    END
    ${where} ORDER BY p.payment_date DESC, p.id DESC LIMIT 200`, params);
  return rows;
}

async function summary(branch) {
  const [rows] = await pool.query(`SELECT COUNT(*) payment_count,COALESCE(SUM(CASE WHEN p.status='Success' THEN p.amount ELSE 0 END),0) collected FROM payments p JOIN student_enrollments se ON se.student_id=p.student_id JOIN branches b ON b.id=se.branch_id ${branch ? 'WHERE b.name = ?' : ''}`, branch ? [branch] : []);
  return rows[0];
}
module.exports = { payments, summary };
