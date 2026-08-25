const axios = require('axios');

// Configure these in your .env file
const CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY || 'PLACEHOLDER_KEY';
const CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET || 'PLACEHOLDER_SECRET';
const SHORTCODE = process.env.MPESA_SHORTCODE || '174379'; // Sandbox default
const BASE_URL = process.env.MPESA_ENV === 'production'
  ? 'https://api.safaricom.co.ke'
  : 'https://sandbox.safaricom.co.ke';

function configured(value) {
  return value && !/^PLACEHOLDER_|^your_/i.test(value);
}

/**
 * Generate OAuth access token from Safaricom API
 */
async function getOAuthToken() {
  if (!configured(CONSUMER_KEY) || !configured(CONSUMER_SECRET)) {
    throw new Error('Set MPESA_CONSUMER_KEY and MPESA_CONSUMER_SECRET to credentials from the same Daraja app.');
  }
  const auth = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64');
  try {
    const response = await axios.get(`${BASE_URL}/oauth/v1/generate?grant_type=client_credentials`, {
      headers: {
        Authorization: `Basic ${auth}`,
      },
    });
    return response.data.access_token;
  } catch (error) {
    const status = error.response?.status;
    console.error('Failed to get M-Pesa OAuth token:', status || error.message);
    if (status === 400 || status === 401) {
      throw new Error(`Daraja rejected the ${process.env.MPESA_ENV === 'production' ? 'production' : 'sandbox'} consumer key/secret. Use an active credential pair from the same Daraja app for this environment.`);
    }
    throw new Error('M-Pesa Authentication Failed');
  }
}

/** Register the public HTTPS endpoints used for parent-initiated PayBill payments. */
async function registerC2BUrls() {
  const validationUrl = process.env.MPESA_C2B_VALIDATION_URL;
  const confirmationUrl = process.env.MPESA_C2B_CONFIRMATION_URL;
  if (!validationUrl || !confirmationUrl) {
    throw new Error('MPESA_C2B_VALIDATION_URL and MPESA_C2B_CONFIRMATION_URL are required.');
  }

  const token = await getOAuthToken();
  try {
    const response = await axios.post(`${BASE_URL}/mpesa/c2b/v1/registerurl`, {
      ShortCode: process.env.MPESA_PAYBILL_NUMBER || SHORTCODE,
      ResponseType: 'Completed',
      ConfirmationURL: confirmationUrl,
      ValidationURL: validationUrl,
    }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    const detail = error.response?.data?.errorMessage || error.response?.data?.ResponseDescription || error.message;
    throw new Error(`C2B URL registration failed (${error.response?.status || 'network error'}): ${detail}`);
  }
}

module.exports = {
  getOAuthToken,
  registerC2BUrls,
};
