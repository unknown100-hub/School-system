const pool = require('../config/db');

function normalizeStudentPayload(payload = {}) {
  const nameParts = String(payload.name || '').trim().split(/\s+/).filter(Boolean);

  return {
    firstName: String(payload.First_Name || nameParts[0] || '').trim(),
    middleName: String(payload.Middle_Name || (nameParts.length > 2 ? nameParts.slice(1, -1).join(' ') : '')).trim(),
    lastName: String(payload.Last_Name || (nameParts.length > 1 ? nameParts[nameParts.length - 1] : '')).trim(),
    guardian: String(payload.parent_guardian || payload.parentName || '').trim(),
    className: String(payload.class || '').trim(),
    dateOfBirth: String(payload.Date_of_birth || '').trim(),
    admissionNumber: String(payload.Admission_Number || payload.admNumber || '').trim(),
    branch: String(payload.branch || 'Githurai Branch').trim(),
  };
}

async function getStudentCount(request, response) {
  try {
    const branchName = request.query.branch;
    if (branchName) {
      const [rows] = await pool.query(
        `SELECT COUNT(se.id) AS studentCount 
         FROM student_enrollments se 
         JOIN branches b ON se.branch_id = b.id 
         WHERE b.name = ?`, [branchName]
      );
      response.json({ studentCount: rows[0].studentCount });
    } else {
      const [rows] = await pool.query(`SELECT COUNT(id) AS studentCount FROM student_enrollments`);
      response.json({ studentCount: rows[0].studentCount });
    }
  } catch (error) {
    console.error('Unable to retrieve student count:', error);
    response.status(200).json({ studentCount: 0, message: 'No student count available.' });
  }
}

async function createStudent(request, response) {
  let connection;
  try {
    connection = await pool.getConnection();
    const { firstName, middleName, lastName, guardian, className, dateOfBirth, admissionNumber, branch } = normalizeStudentPayload(request.body);

    if (!firstName || !className || !admissionNumber) {
      return response.status(400).json({ message: 'First name, class and admission number are required.' });
    }

    await connection.beginTransaction();

    // 1. Get branch ID
    let [branchRows] = await connection.query('SELECT id FROM branches WHERE name = ?', [branch]);
    if (branchRows.length === 0) {
      const [newBranch] = await connection.query('INSERT INTO branches (name) VALUES (?)', [branch]);
      branchRows = [{ id: newBranch.insertId }];
    }
    const branchId = branchRows[0].id;

    // 3. Insert Student
    const dobValue = dateOfBirth ? dateOfBirth : null;
    const [studentResult] = await connection.query(
      `INSERT INTO students (first_name, middle_name, last_name, parent_guardian, date_of_birth)
       VALUES (?, ?, ?, ?, ?)`,
      [firstName, middleName, lastName, guardian, dobValue]
    );
    const studentId = studentResult.insertId;

    // 4. Insert Enrollment
    const enrollmentDate = new Date().toISOString().slice(0, 10);
    await connection.query(
      `INSERT INTO student_enrollments (student_id, branch_id, class_name, admission_number, enrollment_date)
       VALUES (?, ?, ?, ?, ?)`,
      [studentId, branchId, className, admissionNumber, enrollmentDate]
    );

    await connection.commit();

    response.status(201).json({
      student: {
        Admission_Number: admissionNumber,
        First_Name: firstName,
        Middle_Name: middleName,
        Last_Name: lastName,
        parent_guardian: guardian,
        Date_of_birth: dateOfBirth,
        class: className,
        branch: branch,
      },
    });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Unable to create student:', error);
    if (error.code === 'ER_DUP_ENTRY') {
       return response.status(409).json({ message: 'Admission number already exists.' });
    }
    response.status(500).json({ message: 'Unable to save student.' });
  } finally {
    if (connection) connection.release();
  }
}

async function getStudents(request, response) {
  try {
    const branchName = request.query.branch;
    
    let query = `
      SELECT 
        se.admission_number AS Admission_Number, 
        s.first_name AS First_Name, 
        s.middle_name AS Middle_Name, 
        s.last_name AS Last_Name, 
        s.parent_guardian, 
        DATE_FORMAT(s.date_of_birth, '%Y-%m-%d') AS Date_of_birth, 
        se.class_name AS class, 
        b.name AS branch
      FROM students s
      JOIN student_enrollments se ON s.id = se.student_id
      JOIN branches b ON se.branch_id = b.id
    `;
    let params = [];

    if (branchName) {
      query += ` WHERE b.name = ?`;
      params.push(branchName);
    }
    
    query += ` ORDER BY se.id DESC LIMIT 100`;

    const [rows] = await pool.query(query, params);
    response.json({ students: rows });
  } catch (error) {
    console.error('Unable to retrieve student list:', error);
    response.status(200).json({ students: [] });
  }
}

async function updateStudent(request, response) {
  let connection;
  try {
    connection = await pool.getConnection();
    const currentAdmissionNumber = String(request.params.admissionNumber || '').trim();
    const { firstName, middleName, lastName, guardian, className, dateOfBirth, branch } = normalizeStudentPayload(request.body);

    if (!currentAdmissionNumber || !firstName || !className) {
      return response.status(400).json({ message: 'Admission number, first name and class are required.' });
    }

    await connection.beginTransaction();

    // Find student enrollment
    const [enrollments] = await connection.query('SELECT student_id, branch_id FROM student_enrollments WHERE admission_number = ?', [currentAdmissionNumber]);
    
    if (enrollments.length === 0) {
      await connection.rollback();
      return response.status(404).json({ message: 'Student not found.' });
    }
    
    const studentId = enrollments[0].student_id;
    let branchId = enrollments[0].branch_id;

    // Update branch if necessary
    if (branch) {
      const [branchRows] = await connection.query('SELECT id FROM branches WHERE name = ?', [branch]);
      if (branchRows.length > 0) branchId = branchRows[0].id;
    }

    // Update student details
    const dobValue = dateOfBirth ? dateOfBirth : null;
    await connection.query(
      `UPDATE students 
       SET first_name = ?, middle_name = ?, last_name = ?, parent_guardian = ?, date_of_birth = ? 
       WHERE id = ?`,
      [firstName, middleName, lastName, guardian, dobValue, studentId]
    );

    // Update enrollment details
    await connection.query(
      `UPDATE student_enrollments 
       SET class_name = ?, branch_id = ? 
       WHERE admission_number = ?`,
      [className, branchId, currentAdmissionNumber]
    );

    await connection.commit();

    response.json({
      student: {
        Admission_Number: currentAdmissionNumber,
        First_Name: firstName,
        Middle_Name: middleName,
        Last_Name: lastName,
        parent_guardian: guardian,
        Date_of_birth: dateOfBirth,
        class: className,
        branch: branch
      },
    });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Unable to update student:', error);
    response.status(500).json({ message: 'Unable to update student.' });
  } finally {
    if (connection) connection.release();
  }
}

async function deleteStudent(request, response) {
  try {
    const admissionNumber = String(request.params.admissionNumber || '').trim();

    if (!admissionNumber) {
      return response.status(400).json({ message: 'Admission number is required.' });
    }

    const [enrollments] = await pool.query('SELECT student_id FROM student_enrollments WHERE admission_number = ?', [admissionNumber]);
    if (enrollments.length === 0) {
      return response.status(404).json({ message: 'Student not found.' });
    }
    const studentId = enrollments[0].student_id;

    // Due to ON DELETE CASCADE on student_enrollments, deleting the student deletes the enrollment
    const [result] = await pool.query(`DELETE FROM students WHERE id = ?`, [studentId]);

    response.json({ message: 'Student deleted successfully.' });
  } catch (error) {
    console.error('Unable to delete student:', error);
    response.status(500).json({ message: 'Unable to delete student.' });
  }
}

module.exports = { getStudentCount, createStudent, getStudents, updateStudent, deleteStudent };
