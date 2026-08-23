const pool = require('./config/db');
const { getBranchSlug, ensureStudentsTableExists, ensureFeesTableExists } = require('./utils/tableManager');

async function migrate() {
  try {
    console.log('Starting migration...');
    // 1. Get all unique branches from students table
    const [branches] = await pool.query('SELECT DISTINCT branch FROM students WHERE branch IS NOT NULL');
    
    for (const { branch } of branches) {
      if (!branch) continue;
      const slug = getBranchSlug(branch);
      const tableName = await ensureStudentsTableExists(slug);
      console.log(`Migrating students for ${branch} to ${tableName}...`);
      
      // Insert existing data
      await pool.query(`
        INSERT IGNORE INTO \`${tableName}\` 
        SELECT * FROM students WHERE branch = ?
      `, [branch]);
    }

    // 2. Get all unique branches from fees table
    const [feeBranches] = await pool.query('SELECT DISTINCT branch FROM fees WHERE branch IS NOT NULL');
    
    for (const { branch } of feeBranches) {
      if (!branch) continue;
      const slug = getBranchSlug(branch);
      const tableName = await ensureFeesTableExists(slug);
      console.log(`Migrating fees for ${branch} to ${tableName}...`);
      
      // Insert existing data
      await pool.query(`
        INSERT IGNORE INTO \`${tableName}\` 
        SELECT * FROM fees WHERE branch = ?
      `, [branch]);
    }
    
    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();
