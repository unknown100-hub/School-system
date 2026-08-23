const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function setupDatabase() {
  console.log('Connecting to database...');
  
  let connection;
  try {
    // Create a dedicated connection with multipleStatements enabled
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || process.env.MYSQLHOST || 'localhost',
      user: process.env.DB_USER || process.env.MYSQLUSER || 'root',
      password: process.env.DB_PASSWORD || process.env.MYSQLPASSWORD || '',
      database: process.env.DB_NAME || process.env.MYSQLDATABASE || 'schoolManagement',
      port: process.env.DB_PORT || process.env.MYSQLPORT || 3306,
      multipleStatements: true // Required to run SQL files with multiple commands
    });
    const schemaPath = path.resolve(__dirname, 'init_schema.sql');
    console.log(`Reading schema from ${schemaPath}...`);
    const sql = fs.readFileSync(schemaPath, 'utf8');

    console.log('Executing schema script on the database. This might take a few seconds...');
    await connection.query(sql);

    console.log('✅ Database tables and seed data have been successfully deployed!');
  } catch (error) {
    console.error('❌ Failed to deploy database schema:', error);
  } finally {
    if (connection) await connection.end();
  }
}

setupDatabase();
