const mysql = require('mysql2/promise');

const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'arun4122003',
  database: 'genworx'
});

db.getConnection()
  .then(() => console.log('✅ MySQL connected successfully!'))
  .catch(err => console.error('❌ MySQL connection failed:', err.message));

module.exports = db;
