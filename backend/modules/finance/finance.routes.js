const router = require('express').Router();
const controller = require('./finance.controller');
const legacy = require('../../controllers/FinanceController');
router.get('/summary', controller.summary);
router.get('/payments', controller.list);
router.get('/fees', legacy.getFees);
router.get('/balance', legacy.getStudentBalance);
router.post('/fees', legacy.createFee);
module.exports = router;
