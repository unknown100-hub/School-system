const express =require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { getStudentCount, createStudent, getStudents } = require('../controllers/DashboardController');

dotenv.config();

const app= express();

app.use(cors());
app.use(express.json());

app.get('/api/dashboard/students/count', getStudentCount);
app.post('/api/dashboard/students', createStudent);
app.get('/api/dashboard/students', getStudents);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
