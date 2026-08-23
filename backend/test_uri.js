const mysql = require('mysql2/promise');
console.log(typeof mysql.createPool({ uri: 'mysql://root:pass@localhost:3306/db', waitForConnections: true }).query);
