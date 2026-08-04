const pool = require('../config/db');

function normalizeStudentPayload(payload = {}) {
  const nameParts = String(payload.name || '').trim().split(/\s+/).filter(Boolean);

  return {
    firstName: String(payload.First_Name || nameParts[0] || '').trim(),
    middleName: String(payload.Middle_Name || (nameParts.length > 2 ? nameParts.slice(1, -1).join(' ') : '')).trim(),
    lastName: String(payload.Last_Name || (nameParts.length > 1 ? nameParts[nameParts.length - 1] : '')).trim(),
    guardian: String(payload.parent_guardian || payload.parentName || '').trim(),
    className: String(payload.class || '').trim(),
    dateOfBirth: Number(payload.Date_of_birth || 0),
    admissionNumber: String(payload.Admission_Number || payload.admNumber || '').trim(),
  };
}

async function getStudentCount(request, response) {
  try {
    const [rows] = await pool.query('SELECT COUNT(*) AS studentCount FROM students');
    response.json({ studentCount: rows[0].studentCount });
  } catch (error) {
    console.error('Unable to retrieve student count:', error.message);
    response.status(200).json({ studentCount: 0, message: 'No student count available.' });
  }
}

async function createStudent(request, response) {
  try {
    const { firstName, middleName, lastName, guardian, className, dateOfBirth, admissionNumber } = normalizeStudentPayload(request.body);

    if (!firstName || !lastName || !className || !admissionNumber) {
      return response.status(400).json({ message: 'First name, last name, class and admission number are required.' });
    }

    const [result] = await pool.query(
      `INSERT INTO students
        (Admission_Number, First_Name, Middle_Name, Last_Name, parent_guardian, Date_of_birth, class)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [admissionNumber, firstName, middleName, lastName, guardian, dateOfBirth, className]
    );

    response.status(201).json({
      student: {
        Admission_Number: result.insertId || admissionNumber,
        First_Name: firstName,
        Middle_Name: middleName,
        Last_Name: lastName,
        parent_guardian: guardian,
        Date_of_birth: dateOfBirth,
        class: className,
      },
    });
  } catch (error) {
    console.error('Unable to create student:', error.message);
    response.status(500).json({ message: 'Unable to save student.' });
  }
}

async function getStudents(request, response) {
  try {
    const [rows] = await pool.query(
      `SELECT Admission_Number, First_Name, Middle_Name, Last_Name, parent_guardian, Date_of_birth, class
       FROM students
       ORDER BY Admission_Number DESC
       LIMIT 10`
    );

    response.json({ students: rows });
  } catch (error) {
    console.error('Unable to retrieve student list:', error.message);
    response.status(200).json({ students: [] });
  }
}

async function updateStudent(request, response) {
  try {
    const currentAdmissionNumber = String(request.params.admissionNumber || '').trim();
    const { firstName, middleName, lastName, guardian, className, dateOfBirth } = normalizeStudentPayload(request.body);

    if (!currentAdmissionNumber || !firstName || !lastName || !className) {
      return response.status(400).json({ message: 'Admission number, first name, last name and class are required.' });
    }

    const [result] = await pool.query(
      `UPDATE students
       SET First_Name = ?, Middle_Name = ?, Last_Name = ?, parent_guardian = ?, Date_of_birth = ?, class = ?
       WHERE Admission_Number = ?`,
      [firstName, middleName, lastName, guardian, dateOfBirth, className, currentAdmissionNumber]
    );

    if (result.affectedRows === 0) {
      return response.status(404).json({ message: 'Student not found.' });
    }

    response.json({
      student: {
        Admission_Number: currentAdmissionNumber,
        First_Name: firstName,
        Middle_Name: middleName,
        Last_Name: lastName,
        parent_guardian: guardian,
        Date_of_birth: dateOfBirth,
        class: className,
      },
    });
  } catch (error) {
    console.error('Unable to update student:', error.message);
    response.status(500).json({ message: 'Unable to update student.' });
  }
}

async function deleteStudent(request, response) {
  try {
    const admissionNumber = String(request.params.admissionNumber || '').trim();

    if (!admissionNumber) {
      return response.status(400).json({ message: 'Admission number is required.' });
    }

    const [result] = await pool.query('DELETE FROM students WHERE Admission_Number = ?', [admissionNumber]);

    if (result.affectedRows === 0) {
      return response.status(404).json({ message: 'Student not found.' });
    }

    response.json({ message: 'Student deleted successfully.' });
  } catch (error) {
    console.error('Unable to delete student:', error.message);
    response.status(500).json({ message: 'Unable to delete student.' });
  }
}

module.exports = { getStudentCount, createStudent, getStudents, updateStudent, deleteStudent };
