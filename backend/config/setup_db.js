const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function setupDatabase() {
  console.log('Connecting to database...');
  
  let connection;
  try {
    // Support MYSQL_URL or DATABASE_URL which Railway natively provides
    const connectionUri = process.env.MYSQL_URL || process.env.DATABASE_URL;
    
    const dbConfig = connectionUri 
      ? { uri: connectionUri, multipleStatements: true }
      : {
          host: process.env.DB_HOST || process.env.MYSQLHOST || 'localhost',
          user: process.env.DB_USER || process.env.MYSQLUSER || 'root',
          password: process.env.DB_PASSWORD || process.env.MYSQLPASSWORD || '',
          database: process.env.DB_NAME || process.env.MYSQLDATABASE || 'schoolManagement',
          port: process.env.DB_PORT || process.env.MYSQLPORT || 3306,
          multipleStatements: true
        };

    connection = await mysql.createConnection(dbConfig);
    const schemaPath = path.resolve(__dirname, 'init_schema.sql');
    console.log(`Reading schema from ${schemaPath}...`);
    const sql = fs.readFileSync(schemaPath, 'utf8');

    console.log('Executing schema script on the database. This might take a few seconds...');
    await connection.query(sql);

    console.log('✅ Database tables and seed data have been successfully deployed!');
  } catch (error) {
    console.error('❌ Failed to deploy database schema:', error);
    process.exitCode = 1;
  } finally {
    if (connection) await connection.end();
  }
}

setupDatabase();
