const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Import database to trigger initialization
require('./database/database');

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Mount API routers
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/user-details', require('./routes/userDetails'));

// Page Routing
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/users', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'users.html'));
});

app.get('/user-details', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'user-details.html'));
});

app.get('/profile/setup', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'profile-setup.html'));
});

// Default redirection to /login
app.get('/', (req, res) => {
  res.redirect('/login');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
