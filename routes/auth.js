const express = require('express');
const router = express.Router();
const userService = require('../services/userService');
const userDetailsService = require('../services/userDetailsService');

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Unified Auth Endpoint: POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email } = req.body;

  // 1. Validate email input
  if (!email || typeof email !== 'string') {
    return res.status(400).json({
      status: 'error',
      success: false,
      message: 'Email address is required.'
    });
  }

  const trimmedEmail = email.trim().toLowerCase();

  if (!EMAIL_REGEX.test(trimmedEmail)) {
    return res.status(400).json({
      status: 'error',
      success: false,
      message: 'Please enter a valid email address.'
    });
  }

  try {
    // 2. Lookup existing user
    const existingUser = await userService.getUserByEmail(trimmedEmail);

    if (existingUser) {
      // Check if user has completed their profile details
      const details = await userDetailsService.getUserDetailsByUserId(existingUser.id);
      const isProfileComplete = !!details;

      // 3. User exists: Log them in
      return res.status(200).json({
        status: 'success',
        success: true,
        action: 'login',
        message: 'Welcome back! Logged in successfully.',
        user: existingUser,
        isNewUser: false,
        profileComplete: isProfileComplete
      });
    }

    // 4. User does not exist: Automatically create new account
    try {
      const newUserId = await userService.createUser(trimmedEmail);
      const newUser = await userService.getUserById(newUserId);

      return res.status(201).json({
        status: 'success',
        success: true,
        action: 'signup',
        message: 'Account created! Logged in successfully.',
        user: newUser || { id: newUserId, email: trimmedEmail, created_at: new Date().toISOString() },
        isNewUser: true,
        profileComplete: false
      });
    } catch (insertErr) {
      // Handle concurrent signup race conditions
      if (insertErr.message.includes('UNIQUE constraint failed')) {
        const retryUser = await userService.getUserByEmail(trimmedEmail);
        if (retryUser) {
          const details = await userDetailsService.getUserDetailsByUserId(retryUser.id);
          const isProfileComplete = !!details;

          return res.status(200).json({
            status: 'success',
            success: true,
            action: 'login',
            message: 'Welcome back! Logged in successfully.',
            user: retryUser,
            isNewUser: false,
            profileComplete: isProfileComplete
          });
        }
      }
      throw insertErr;
    }
  } catch (err) {
    console.error('Authentication transaction error:', err.message);
    return res.status(500).json({
      status: 'error',
      success: false,
      message: 'Internal server error during authentication.'
    });
  }
});

module.exports = router;
