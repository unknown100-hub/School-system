const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

// mpesaAuth reads its configuration while loading, so load .env first.
const { registerC2BUrls } = require('../utils/mpesaAuth');

async function registerUrls() {
  try {
    const result = await registerC2BUrls();
    console.log('M-Pesa C2B URLs registered:', result);
  } catch (error) {
    console.error('Could not register M-Pesa C2B URLs:', error.message);
    process.exitCode = 1;
  }
}

registerUrls();
