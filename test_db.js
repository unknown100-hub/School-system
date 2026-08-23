const mysql = require('mysql2/promise');
async function test() {
  try {
    const pool = mysql.createPool({ host: 'localhost', user: 'root', port: 9999, database: 'test' });
    await pool.query('SELECT 1');
  } catch (err) {
    console.error('Error:', err.message);
  }
}
test();
