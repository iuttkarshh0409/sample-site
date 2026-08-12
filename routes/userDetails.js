const express = require('express');
const router = express.Router();
const userDetailsService = require('../services/userDetailsService');
const userService = require('../services/userService');

// Regex patterns for validation
const NAME_REGEX = /^[A-Za-z ]{2,100}$/;
const DESIGNATION_REGEX = /^[A-Za-z .&-]{2,100}$/;
const ADDRESS_REGEX = /^[A-Za-z0-9\s,.\-#/()]{5,250}$/;
const MOBILE_REGEX = /^[6-9]\d{9}$/;
const BANK_NAME_REGEX = /^[A-Za-z0-9\s.,&'-]{2,100}$/;
const BANK_ACCOUNT_REGEX = /^\d{9,18}$/;
const IFSC_REGEX = /^[A-Za-z]{4}0[A-Za-z0-9]{6}$/i;
const AADHAR_REGEX = /^\d{12}$/;

// Helper to mask sensitive fields in response
function maskDetails(details) {
  if (!details) return null;
  const masked = { ...details };
  if (masked.aadhar_number) {
    masked.aadhar_number = 'XXXX-XXXX-' + masked.aadhar_number.slice(-4);
  }
  if (masked.bank_account_number) {
    masked.bank_account_number = '********' + masked.bank_account_number.slice(-4);
  }
  return masked;
}

// Validation helper
function validateDetailsBody(body) {
  const errors = [];
  const {
    name, designation, permanent_address, mobile_number,
    bank_name, bank_address, bank_account_number, ifsc_code, aadhar_number
  } = body;

  if (!name || !NAME_REGEX.test(name.trim())) {
    errors.push('Name must contain only alphabetic characters and spaces (2-100 characters).');
  }
  if (!designation || !DESIGNATION_REGEX.test(designation.trim())) {
    errors.push('Designation must contain only letters, spaces, periods, ampersands, or hyphens (2-100 characters).');
  }
  if (!permanent_address || !ADDRESS_REGEX.test(permanent_address.trim())) {
    errors.push('Permanent address contains invalid characters or is too short/long (5-250 characters).');
  }
  if (!mobile_number || !MOBILE_REGEX.test(mobile_number.trim())) {
    errors.push('Mobile number must be a valid 10-digit Indian phone number.');
  }
  if (!bank_name || !BANK_NAME_REGEX.test(bank_name.trim())) {
    errors.push('Bank name contains invalid characters (2-100 characters).');
  }
  if (!bank_address || !ADDRESS_REGEX.test(bank_address.trim())) {
    errors.push('Bank address contains invalid characters or is too short/long (5-250 characters).');
  }
  if (!bank_account_number || !BANK_ACCOUNT_REGEX.test(bank_account_number.trim())) {
    errors.push('Bank account number must be between 9 and 18 digits.');
  }
  if (!ifsc_code || !IFSC_REGEX.test(ifsc_code.trim())) {
    errors.push('IFSC code must be in standard Indian IFSC format (e.g. SBIN0001234).');
  }
  if (!aadhar_number || !AADHAR_REGEX.test(aadhar_number.trim())) {
    errors.push('Aadhar number must be exactly 12 digits.');
  }

  return errors;
}

// 1. GET /api/user-details - Retrieve all user details (masked)
router.get('/', async (req, res) => {
  try {
    const list = await userDetailsService.getAllUserDetails();
    const maskedList = list.map(item => maskDetails(item));
    return res.status(200).json({
      status: 'success',
      data: maskedList
    });
  } catch (err) {
    console.error('Error fetching details directory:', err.message);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve details directory.'
    });
  }
});

// 2. GET /api/user-details/:id - Retrieve specific details by ID (masked)
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const row = await userDetailsService.getUserDetailsById(id);
    if (!row) {
      return res.status(404).json({
        status: 'error',
        message: `Profile details not found for ID ${id}.`
      });
    }
    return res.status(200).json({
      status: 'success',
      data: maskDetails(row)
    });
  } catch (err) {
    console.error(`Error fetching details ID ${id}:`, err.message);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve details profile.'
    });
  }
});

// 3. GET /api/user-details/user/:userId - Retrieve details by user ID (masked)
router.get('/user/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const row = await userDetailsService.getUserDetailsByUserId(userId);
    if (!row) {
      return res.status(404).json({
        status: 'error',
        message: `No profile details found for User ID ${userId}.`
      });
    }
    return res.status(200).json({
      status: 'success',
      data: maskDetails(row)
    });
  } catch (err) {
    console.error(`Error querying user ID ${userId} details:`, err.message);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve user profile details.'
    });
  }
});

// 4. POST /api/user-details - Create user details (first-time submission)
router.post('/', async (req, res) => {
  const { user_id } = req.body;

  if (!user_id) {
    return res.status(400).json({
      status: 'error',
      message: 'User ID is required.'
    });
  }

  // Verify that the referenced user exists
  try {
    const userExist = await userService.getUserById(user_id);
    if (!userExist) {
      return res.status(404).json({
        status: 'error',
        message: `User with ID ${user_id} does not exist.`
      });
    }
  } catch (err) {
    return res.status(500).json({
      status: 'error',
      message: 'Error verifying user existence.'
    });
  }

  // Check if profile details already exist for this user (one-to-one constraint)
  try {
    const existing = await userDetailsService.getUserDetailsByUserId(user_id);
    if (existing) {
      return res.status(409).json({
        status: 'error',
        message: 'Details already completed for this user.'
      });
    }
  } catch (err) {
    return res.status(500).json({
      status: 'error',
      message: 'Database error checking profile duplication.'
    });
  }

  // Validate fields server-side
  const validationErrors = validateDetailsBody(req.body);
  if (validationErrors.length > 0) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed.',
      errors: validationErrors
    });
  }

  try {
    const newDetailsId = await userDetailsService.createUserDetails(req.body);
    const createdRecord = await userDetailsService.getUserDetailsById(newDetailsId);
    
    return res.status(201).json({
      status: 'success',
      message: 'Profile details saved successfully.',
      data: maskDetails(createdRecord)
    });
  } catch (err) {
    if (err.message.includes('UNIQUE constraint failed')) {
      return res.status(409).json({
        status: 'error',
        message: 'Profile details already exist for this user.'
      });
    }
    console.error('Error saving user details:', err.message);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to save profile details.'
    });
  }
});

// 5. PUT /api/user-details/:id - Update user details
router.put('/:id', async (req, res) => {
  const { id } = req.params;

  // Validate fields server-side
  const validationErrors = validateDetailsBody(req.body);
  if (validationErrors.length > 0) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed.',
      errors: validationErrors
    });
  }

  try {
    const affected = await userDetailsService.updateUserDetails(id, req.body);
    if (affected === 0) {
      return res.status(404).json({
        status: 'error',
        message: `Profile details ID ${id} not found.`
      });
    }
    
    const updatedRecord = await userDetailsService.getUserDetailsById(id);
    return res.status(200).json({
      status: 'success',
      message: 'Profile details updated successfully.',
      data: maskDetails(updatedRecord)
    });
  } catch (err) {
    console.error(`Error updating details ID ${id}:`, err.message);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to update profile details.'
    });
  }
});

// 6. DELETE /api/user-details/:id - Delete details record
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const affected = await userDetailsService.deleteUserDetails(id);
    if (affected === 0) {
      return res.status(404).json({
        status: 'error',
        message: `Profile details ID ${id} not found.`
      });
    }
    return res.status(200).json({
      status: 'success',
      message: `Profile details ID ${id} deleted successfully.`
    });
  } catch (err) {
    console.error(`Error deleting details ID ${id}:`, err.message);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to delete profile details.'
    });
  }
});

module.exports = router;
