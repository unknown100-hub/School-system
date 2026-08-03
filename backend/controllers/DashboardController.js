const pool = require('../config/db');

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
    const { name, parentName, class: studentClass, admNumber } = request.body || {};

    if (!name || !studentClass || !admNumber) {
      return response.status(400).json({ message: 'Name, class and admission number are required.' });
    }

    const [result] = await pool.query(
      'INSERT INTO students (name, parents, class, ADM_Number) VALUES (?, ?, ?, ?)',
      [name, parentName || '', studentClass, admNumber]
    );

    response.status(201).json({
      student: {
        id: result.insertId,
        name,
        parentName: parentName || '—',
        class: studentClass,
        admNumber,
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
      'SELECT id, name, parents AS parentName, class, ADM_Number AS admNumber FROM students ORDER BY id DESC LIMIT 10'
    );

    response.json({
      students: rows.map((student) => ({
        id: student.id,
        name: student.name,
        parentName: student.parentName ?? '—',
        class: student.class,
        admNumber: student.admNumber ?? '—',
      })),
    });
  } catch (error) {
    console.error('Unable to retrieve student list:', error.message);
    response.status(200).json({ students: [] });
  }
}

module.exports = { getStudentCount, createStudent, getStudents };
