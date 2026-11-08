require('dotenv').config();
const fs = require('fs');
const path = require('path');
const pool = require('../src/config/db');

(async () => {
  try {
    const sql = fs.readFileSync(path.join(__dirname, '../db/migrations/001_init.sql'), 'utf8');
    await pool.query(sql);
    console.log('Migration done');
  } catch (e) { console.error(e); process.exitCode = 1; }
  finally { await pool.end(); }
})();