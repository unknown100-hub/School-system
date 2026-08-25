const pool = require('./db');

async function runMigration() {
  let connection;
  try {
    connection = await pool.getConnection();
    console.log('Running M-Pesa migration...');

    // 1. Add status column
    try {
      await connection.query("ALTER TABLE payments ADD COLUMN status ENUM('Pending', 'Success', 'Failed') DEFAULT 'Success'");
      console.log('Added status column to payments table.');
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') console.log('status column already exists.');
      else throw e;
    }

    // 2. Add mpesa_receipt_number column
    try {
      await connection.query("ALTER TABLE payments ADD COLUMN mpesa_receipt_number VARCHAR(255) NULL");
      console.log('Added mpesa_receipt_number column to payments table.');
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') console.log('mpesa_receipt_number column already exists.');
      else throw e;
    }

    // 3. Add checkout_request_id column
    try {
      await connection.query("ALTER TABLE payments ADD COLUMN checkout_request_id VARCHAR(255) NULL");
      console.log('Added checkout_request_id column to payments table.');
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') console.log('checkout_request_id column already exists.');
      else throw e;
    }

    // 4. Also update init_schema.sql so future setups have it
    // Keep the M-Pesa receipt unique so C2B confirmation retries are idempotent.
    try {
      await connection.query('ALTER TABLE payments ADD UNIQUE KEY uq_payments_mpesa_receipt (mpesa_receipt_number)');
      console.log('Added unique M-Pesa receipt constraint.');
    } catch (e) {
      if (e.code === 'ER_DUP_KEYNAME') console.log('M-Pesa receipt constraint already exists.');
      else if (e.code === 'ER_DUP_ENTRY') console.warn('Could not add M-Pesa receipt constraint: duplicate receipt data exists.');
      else throw e;
    }

    console.log('Migration completed successfully.');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    if (connection) connection.release();
    process.exit(0);
  }
}

runMigration();
