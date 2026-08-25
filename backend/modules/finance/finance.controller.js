const model = require('./finance.model');
async function list(request, response) { try { response.json({ payments: await model.payments(request.query.branch, String(request.query.search || '').trim()) }); } catch (error) { console.error(error); response.status(500).json({ message: 'Unable to load payments.' }); } }
async function summary(request, response) { try { response.json({ summary: await model.summary(request.query.branch) }); } catch (error) { console.error(error); response.status(500).json({ message: 'Unable to load summary.' }); } }
module.exports = { list, summary };
