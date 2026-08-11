const express = require('express');
const router = express.Router();
const userService = require('../services/userService');

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Helper for validating email format
function validateEmail(email) {
  if (!email || typeof email !== 'string') return false;
  return EMAIL_REGEX.test(email.trim().toLowerCase());
}

// 1. GET /api/users - Retrieve all users
router.get('/', async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    return res.status(200).json({
      status: 'success',
      data: users
    });
  } catch (err) {
    console.error('Error fetching all users:', err.message);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve users.'
    });
  }
});

// 2. GET /api/users/email/:email - Retrieve a user by email
router.get('/email/:email', async (req, res) => {
  const { email } = req.params;

  if (!validateEmail(email)) {
    return res.status(400).json({
      status: 'error',
      message: 'Please provide a valid email address.'
    });
  }

  try {
    const user = await userService.getUserByEmail(email);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: `User with email '${email}' not found.`
      });
    }

    return res.status(200).json({
      status: 'success',
      data: user
    });
  } catch (err) {
    console.error('Error fetching user by email:', err.message);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to query user.'
    });
  }
});

// 3. GET /api/users/:id - Retrieve a user by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const user = await userService.getUserById(id);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: `User with ID ${id} not found.`
      });
    }

    return res.status(200).json({
      status: 'success',
      data: user
    });
  } catch (err) {
    console.error(`Error fetching user ID ${id}:`, err.message);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve user.'
    });
  }
});

// 4. POST /api/users - Create a new user manually
router.post('/', async (req, res) => {
  const { email } = req.body;

  if (!validateEmail(email)) {
    return res.status(400).json({
      status: 'error',
      message: 'Please enter a valid email address.'
    });
  }

  try {
    const newUserId = await userService.createUser(email);
    const createdUser = await userService.getUserById(newUserId);
    
    return res.status(201).json({
      status: 'success',
      message: 'User created successfully.',
      data: createdUser
    });
  } catch (err) {
    if (err.message.includes('UNIQUE constraint failed')) {
      return res.status(409).json({
        status: 'error',
        message: 'A user with this email address already exists.'
      });
    }

    console.error('Error creating user:', err.message);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to create user.'
    });
  }
});

// 5. PUT /api/users/:id - Update a user's details
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { email } = req.body;

  if (!validateEmail(email)) {
    return res.status(400).json({
      status: 'error',
      message: 'Please enter a valid email address.'
    });
  }

  try {
    const affectedRows = await userService.updateUser(id, email);
    if (affectedRows === 0) {
      return res.status(404).json({
        status: 'error',
        message: `User with ID ${id} not found.`
      });
    }

    const updatedUser = await userService.getUserById(id);
    return res.status(200).json({
      status: 'success',
      message: 'User updated successfully.',
      data: updatedUser
    });
  } catch (err) {
    if (err.message.includes('UNIQUE constraint failed')) {
      return res.status(409).json({
        status: 'error',
        message: 'This email address is already in use by another user.'
      });
    }

    console.error(`Error updating user ID ${id}:`, err.message);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to update user.'
    });
  }
});

// 6. DELETE /api/users/:id - Delete a user
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const affectedRows = await userService.deleteUser(id);
    if (affectedRows === 0) {
      return res.status(404).json({
        status: 'error',
        message: `User with ID ${id} not found.`
      });
    }

    return res.status(200).json({
      status: 'success',
      message: `User with ID ${id} deleted successfully.`
    });
  } catch (err) {
    console.error(`Error deleting user ID ${id}:`, err.message);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to delete user.'
    });
  }
});

module.exports = router;
