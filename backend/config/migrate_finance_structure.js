const pool = require('./db');

async function addColumn(connection, definition, name) {
  try {
    await connection.query(`ALTER TABLE payments ADD COLUMN ${definition}`);
    console.log(`Added ${name} column.`);
  } catch (error) {
    if (error.code === 'ER_DUP_FIELDNAME') console.log(`${name} column already exists.`);
    else throw error;
  }
}

async function runMigration() {
  let connection;
  try {
    connection = await pool.getConnection();
    console.log('Running finance structure migration...');
    await addColumn(connection, 'fee_category_id INT NULL AFTER payment_date', 'fee_category_id');
    await addColumn(connection, 'term VARCHAR(32) NULL AFTER fee_category_id', 'term');
    await connection.query(`CREATE TABLE IF NOT EXISTS tuition_fee_structure (
      class_group VARCHAR(50) NOT NULL,
      term VARCHAR(32) NOT NULL,
      amount DECIMAL(10,2) NOT NULL,
      PRIMARY KEY (class_group, term)
    )`);
    await connection.query(`INSERT IGNORE INTO tuition_fee_structure (class_group, term, amount) VALUES
      ('Playgroup', 'T1-2026', 10800.00), ('Playgroup', 'T2-2026', 9000.00), ('Playgroup', 'T3-2026', 8500.00),
      ('PP1', 'T1-2026', 11500.00), ('PP1', 'T2-2026', 10700.00), ('PP1', 'T3-2026', 10200.00),
      ('PP2', 'T1-2026', 11500.00), ('PP2', 'T2-2026', 10700.00), ('PP2', 'T3-2026', 12200.00),
      ('Grade 1-3', 'T1-2026', 12800.00), ('Grade 1-3', 'T2-2026', 12000.00), ('Grade 1-3', 'T3-2026', 11500.00),
      ('Grade 4-5', 'T1-2026', 16300.00), ('Grade 4-5', 'T2-2026', 15000.00), ('Grade 4-5', 'T3-2026', 14500.00),
      ('Grade 6', 'T1-2026', 17800.00), ('Grade 6', 'T2-2026', 16500.00), ('Grade 6', 'T3-2026', 18000.00),
      ('Grade 7-8', 'T1-2026', 19500.00), ('Grade 7-8', 'T2-2026', 19000.00), ('Grade 7-8', 'T3-2026', 18500.00),
      ('Grade 9', 'T1-2026', 19500.00), ('Grade 9', 'T2-2026', 19000.00), ('Grade 9', 'T3-2026', 21500.00)`);
    try {
      await connection.query('ALTER TABLE payments ADD CONSTRAINT fk_payments_fee_category FOREIGN KEY (fee_category_id) REFERENCES fee_categories(id) ON DELETE SET NULL');
      console.log('Added fee category relationship.');
    } catch (error) {
      if (error.code === 'ER_DUP_KEYNAME' || error.code === 'ER_FK_DUP_NAME' || error.errno === 121) console.log('Fee category relationship already exists.');
      else throw error;
    }
    console.log('Finance structure migration completed successfully.');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exitCode = 1;
  } finally {
    if (connection) connection.release();
    await pool.end();
  }
}

runMigration();
