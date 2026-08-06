const express =require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { getStudentCount, createStudent, getStudents, updateStudent, deleteStudent } = require('../controllers/DashboardController');

dotenv.config();

const app= express();

app.use(cors());
app.use(express.json());

app.get('/api/dashboard/students/count', getStudentCount);
app.post('/api/dashboard/students', createStudent);
app.get('/api/dashboard/students', getStudents);
app.put('/api/dashboard/students/:admissionNumber', updateStudent);
app.delete('/api/dashboard/students/:admissionNumber', deleteStudent);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
