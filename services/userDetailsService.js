const db = require('../database/database');

const userDetailsService = {
  /**
   * Retrieves all user details rows.
   * @returns {Promise<Array>}
   */
  getAllUserDetails() {
    return new Promise((resolve, reject) => {
      db.all(`
        SELECT id, user_id, name, designation, permanent_address, 
               mobile_number, bank_name, bank_address, bank_account_number, 
               ifsc_code, aadhar_number, created_at, updated_at 
        FROM user_details ORDER BY id DESC
      `, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  },

  /**
   * Retrieves user details by details row ID.
   * @param {number|string} id 
   * @returns {Promise<Object|null>}
   */
  getUserDetailsById(id) {
    return new Promise((resolve, reject) => {
      db.get(`
        SELECT id, user_id, name, designation, permanent_address, 
               mobile_number, bank_name, bank_address, bank_account_number, 
               ifsc_code, aadhar_number, created_at, updated_at 
        FROM user_details WHERE id = ?
      `, [id], (err, row) => {
        if (err) reject(err);
        else resolve(row || null);
      });
    });
  },

  /**
   * Retrieves user details by the user's ID.
   * @param {number|string} userId 
   * @returns {Promise<Object|null>}
   */
  getUserDetailsByUserId(userId) {
    return new Promise((resolve, reject) => {
      db.get(`
        SELECT id, user_id, name, designation, permanent_address, 
               mobile_number, bank_name, bank_address, bank_account_number, 
               ifsc_code, aadhar_number, created_at, updated_at 
        FROM user_details WHERE user_id = ?
      `, [userId], (err, row) => {
        if (err) reject(err);
        else resolve(row || null);
      });
    });
  },

  /**
   * Creates a new user details record.
   * @param {Object} details 
   * @returns {Promise<number>} Returns the newly inserted record ID.
   */
  createUserDetails(details) {
    return new Promise((resolve, reject) => {
      const {
        user_id, name, designation, permanent_address, mobile_number,
        bank_name, bank_address, bank_account_number, ifsc_code, aadhar_number
      } = details;

      db.run(`
        INSERT INTO user_details (
          user_id, name, designation, permanent_address, mobile_number,
          bank_name, bank_address, bank_account_number, ifsc_code, aadhar_number
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        user_id, name.trim(), designation.trim(), permanent_address.trim(), mobile_number.trim(),
        bank_name.trim(), bank_address.trim(), bank_account_number.trim(), ifsc_code.trim().toUpperCase(), aadhar_number.trim()
      ], function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
    });
  },

  /**
   * Updates an existing user details record.
   * @param {number|string} id 
   * @param {Object} details 
   * @returns {Promise<number>} Returns the number of affected rows.
   */
  updateUserDetails(id, details) {
    return new Promise((resolve, reject) => {
      const {
        name, designation, permanent_address, mobile_number,
        bank_name, bank_address, bank_account_number, ifsc_code, aadhar_number
      } = details;

      db.run(`
        UPDATE user_details 
        SET name = ?, 
            designation = ?, 
            permanent_address = ?, 
            mobile_number = ?, 
            bank_name = ?, 
            bank_address = ?, 
            bank_account_number = ?, 
            ifsc_code = ?, 
            aadhar_number = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [
        name.trim(), designation.trim(), permanent_address.trim(), mobile_number.trim(),
        bank_name.trim(), bank_address.trim(), bank_account_number.trim(), ifsc_code.trim().toUpperCase(), aadhar_number.trim(),
        id
      ], function(err) {
        if (err) reject(err);
        else resolve(this.changes);
      });
    });
  },

  /**
   * Deletes a user details record by details ID.
   * @param {number|string} id 
   * @returns {Promise<number>} Returns the number of affected rows.
   */
  deleteUserDetails(id) {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM user_details WHERE id = ?', [id], function(err) {
        if (err) reject(err);
        else resolve(this.changes);
      });
    });
  }
};

module.exports = userDetailsService;
