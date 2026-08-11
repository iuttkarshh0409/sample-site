const express = require('express');
const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = process.env.PORT || 3000;

// Ensure database directory exists
const dbDir = path.join(__dirname, 'database');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'database.sqlite');
console.log(`Connecting to database at: ${dbPath}`);

// Connect to SQLite Database
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    process.exit(1);
  }
  console.log('Connected to the SQLite database.');
  
  // Initialize users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (tableErr) => {
    if (tableErr) {
      console.error('Error creating users table:', tableErr.message);
      process.exit(1);
    }
    console.log('Users table initialized.');
  });
});

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Email validation regex (standard RFC 5322)
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Unified Auth Endpoint
app.post('/api/auth/login', (req, res) => {
  const { email } = req.body;

  // 1. Validate email presence and format
  if (!email || typeof email !== 'string') {
    return res.status(400).json({
      status: 'error',
      message: 'Email address is required.'
    });
  }

  const trimmedEmail = email.trim().toLowerCase();

  if (!EMAIL_REGEX.test(trimmedEmail)) {
    return res.status(400).json({
      status: 'error',
      message: 'Please enter a valid email address.'
    });
  }

  // 2. Search database for the email (parameterized query)
  db.get('SELECT id, email, created_at FROM users WHERE email = ?', [trimmedEmail], (err, existingUser) => {
    if (err) {
      console.error('Database query error:', err.message);
      return res.status(500).json({
        status: 'error',
        message: 'Internal server error during user lookup.'
      });
    }

    if (existingUser) {
      // 3. User exists: Authenticate them
      return res.status(200).json({
        status: 'success',
        action: 'login',
        message: 'Welcome back! Logged in successfully.',
        user: existingUser
      });
    } else {
      // 4. User does not exist: Create new user (parameterized query)
      db.run('INSERT INTO users (email) VALUES (?)', [trimmedEmail], function (insertErr) {
        if (insertErr) {
          // Handle potential race conditions or unique constraints
          if (insertErr.message.includes('UNIQUE constraint failed')) {
            // Retrieve user in case they were created between lookup and insertion
            db.get('SELECT id, email, created_at FROM users WHERE email = ?', [trimmedEmail], (retryErr, retryUser) => {
              if (retryErr || !retryUser) {
                return res.status(500).json({
                  status: 'error',
                  message: 'Database error resolving user conflict.'
                });
              }
              return res.status(200).json({
                status: 'success',
                action: 'login',
                message: 'Welcome back! Logged in successfully.',
                user: retryUser
              });
            });
          } else {
            console.error('Database insert error:', insertErr.message);
            return res.status(500).json({
              status: 'error',
              message: 'Failed to create new user.'
            });
          }
        } else {
          const newUserId = this.lastID;
          // Retrieve the newly inserted user to return full details
          db.get('SELECT id, email, created_at FROM users WHERE id = ?', [newUserId], (fetchErr, newUser) => {
            if (fetchErr || !newUser) {
              // Return standard fallback if fetch fails but insert succeeded
              return res.status(201).json({
                status: 'success',
                action: 'signup',
                message: 'Account created! Logged in successfully.',
                user: { id: newUserId, email: trimmedEmail, created_at: new Date().toISOString() }
              });
            }

            return res.status(201).json({
              status: 'success',
              action: 'signup',
              message: 'Account created! Logged in successfully.',
              user: newUser
            });
          });
        }
      });
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
