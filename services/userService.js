const db = require('../database/database');

const userService = {
  /**
   * Retrieves all users from the database, sorted descending by ID.
   * @returns {Promise<Array>}
   */
  getAllUsers() {
    return new Promise((resolve, reject) => {
      db.all('SELECT id, email, created_at FROM users ORDER BY id DESC', [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows || []);
        }
      });
    });
  },

  /**
   * Retrieves a single user by their ID.
   * @param {number|string} id 
   * @returns {Promise<Object|null>}
   */
  getUserById(id) {
    return new Promise((resolve, reject) => {
      db.get('SELECT id, email, created_at FROM users WHERE id = ?', [id], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row || null);
        }
      });
    });
  },

  /**
   * Retrieves a single user by their email address.
   * @param {string} email 
   * @returns {Promise<Object|null>}
   */
  getUserByEmail(email) {
    return new Promise((resolve, reject) => {
      const normalizedEmail = email.trim().toLowerCase();
      db.get('SELECT id, email, created_at FROM users WHERE email = ?', [normalizedEmail], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row || null);
        }
      });
    });
  },

  /**
   * Creates a new user.
   * @param {string} email 
   * @returns {Promise<number>} Returns the newly generated user ID.
   */
  createUser(email) {
    return new Promise((resolve, reject) => {
      const normalizedEmail = email.trim().toLowerCase();
      db.run('INSERT INTO users (email) VALUES (?)', [normalizedEmail], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.lastID);
        }
      });
    });
  },

  /**
   * Updates a user's email address.
   * @param {number|string} id 
   * @param {string} email 
   * @returns {Promise<number>} Returns the number of affected rows.
   */
  updateUser(id, email) {
    return new Promise((resolve, reject) => {
      const normalizedEmail = email.trim().toLowerCase();
      db.run('UPDATE users SET email = ? WHERE id = ?', [normalizedEmail, id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes);
        }
      });
    });
  },

  /**
   * Deletes a user.
   * @param {number|string} id 
   * @returns {Promise<number>} Returns the number of affected rows.
   */
  deleteUser(id) {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM users WHERE id = ?', [id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes);
        }
      });
    });
  }
};

module.exports = userService;
