const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbDir = __dirname;
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'database.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    process.exit(1);
  }
  console.log('Database connection established.');

  // Enable foreign key constraints in SQLite
  db.run('PRAGMA foreign_keys = ON;', (pragmaErr) => {
    if (pragmaErr) {
      console.error('Failed to enable foreign key support:', pragmaErr.message);
    } else {
      console.log('Foreign key constraints enabled.');
    }
  });

  // Initialize users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (tableErr) => {
    if (tableErr) {
      console.error('Error initializing users table:', tableErr.message);
      process.exit(1);
    }
    console.log('Users table ready.');

    // Initialize user_details table (one-to-one relationship with users)
    db.run(`
      CREATE TABLE IF NOT EXISTS user_details (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL UNIQUE,
        name TEXT NOT NULL,
        designation TEXT NOT NULL,
        permanent_address TEXT NOT NULL,
        mobile_number TEXT NOT NULL,
        bank_name TEXT NOT NULL,
        bank_address TEXT NOT NULL,
        bank_account_number TEXT NOT NULL,
        ifsc_code TEXT NOT NULL,
        aadhar_number TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `, (detailsErr) => {
      if (detailsErr) {
        console.error('Error initializing user_details table:', detailsErr.message);
        process.exit(1);
      }
      console.log('User details table ready.');
    });
  });
});

module.exports = db;
