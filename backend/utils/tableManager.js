const pool = require('../config/db');

function getBranchSlug(branchName) {
  if (!branchName) return 'githurai_branch';
  return branchName.toLowerCase().replace(/[^a-z0-9]+/g, '_');
}

async function ensureStudentsTableExists(branchSlug) {
  const tableName = `${branchSlug}_students`;
  await pool.query(`
    CREATE TABLE IF NOT EXISTS \`${tableName}\` (
      \`Admission_Number\` varchar(255) NOT NULL,
      \`First_Name\` varchar(255) NOT NULL,
      \`Middle_Name\` varchar(255) DEFAULT NULL,
      \`Last_Name\` varchar(255) NOT NULL,
      \`parent_guardian\` varchar(255) DEFAULT NULL,
      \`Date_of_birth\` varchar(255) DEFAULT NULL,
      \`class\` varchar(255) NOT NULL,
      \`branch\` varchar(255) DEFAULT NULL,
      PRIMARY KEY (\`Admission_Number\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
  `);
  return tableName;
}

async function ensureFeesTableExists(branchSlug) {
  const tableName = `${branchSlug}_fees`;
  await pool.query(`
    CREATE TABLE IF NOT EXISTS \`${tableName}\` (
      \`id\` int NOT NULL AUTO_INCREMENT,
      \`receipt_no\` varchar(255) NOT NULL,
      \`student_id\` varchar(255) NOT NULL,
      \`parent_name\` varchar(255) DEFAULT NULL,
      \`fee_code\` varchar(255) NOT NULL,
      \`amount\` decimal(10,2) NOT NULL,
      \`payment_method\` varchar(255) NOT NULL,
      \`payment_date\` date NOT NULL,
      \`term\` varchar(255) NOT NULL,
      \`remarks\` text,
      \`created_at\` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
      \`branch\` varchar(255) DEFAULT NULL,
      PRIMARY KEY (\`id\`),
      UNIQUE KEY \`receipt_no\` (\`receipt_no\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
  `);
  return tableName;
}

module.exports = {
  getBranchSlug,
  ensureStudentsTableExists,
  ensureFeesTableExists
};
