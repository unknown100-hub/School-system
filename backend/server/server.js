const path = require('path');
const express =require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Always load the backend environment file, even when the server is started
// from the repository root or a process manager.
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const { getStudentCount, createStudent, getStudents, updateStudent, deleteStudent } = require('../controllers/DashboardController');
const {
  getFees,
  createFee,
  paybillValidation,
  paybillConfirmation,
  getPaybillDetails,
  checkPaymentStatus
} = require('../controllers/FinanceController');
const pool = require('../config/db');
const { connectMongo } = require('../config/mongo');
const { register, login, optionalAuth } = require('../controllers/AuthController');
const financeRoutes = require('../modules/finance/finance.routes');

const app= express();

app.use(cors());
app.use(express.json());
app.post('/api/auth/register', optionalAuth, register);
app.post('/api/auth/login', login);

app.get('/api/health', async (request, response) => {
  try {
    await pool.query('SELECT 1');
    response.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    console.error('Health check database failure:', error.message);
    response.status(503).json({ status: 'degraded', database: 'unavailable' });
  }
});

app.get('/api/dashboard/students/count', getStudentCount);
app.post('/api/dashboard/students', createStudent);
app.get('/api/dashboard/students', getStudents);
app.put('/api/dashboard/students/:admissionNumber', updateStudent);
app.delete('/api/dashboard/students/:admissionNumber', deleteStudent);

// Finance Routes
app.use('/api/finance', financeRoutes);
app.get('/api/finance/mpesa/paybill', getPaybillDetails);
// Daraja rejects callback URLs containing "mpesa", so use these public paths.
app.post('/api/finance/paybill/validation', paybillValidation);
app.post('/api/finance/paybill/confirmation', paybillConfirmation);
// Keep the original paths available for existing integrations.
app.post('/api/finance/mpesa/paybill/validation', paybillValidation);
app.post('/api/finance/mpesa/paybill/confirmation', paybillConfirmation);
app.get('/api/finance/payments/:receipt_no/status', checkPaymentStatus);

const PORT = process.env.PORT || 5000;

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../../frontend/dist')));

// Handle React routing, return all requests to React app
app.get(/(.*)/, (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/dist/index.html'));
});

connectMongo().catch((error) => {
  console.error(`MongoDB authentication is unavailable: ${error.message}`);
});

const server = app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
server.on('error', (error) => {
  console.error(`Unable to start server: ${error.code === 'EADDRINUSE' ? `Port ${PORT} is already in use.` : error.message}`);
  process.exitCode = 1;
});
