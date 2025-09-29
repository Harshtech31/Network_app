const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/mongodb/User');
const { body, validationResult } = require('express-validator');
const { uploadMiddleware } = require('../config/aws');
const emailService = require('../services/emailService');

const router = express.Router();

// POST /api/auth/register
router.post('/register', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation Error',
        details: errors.array() 
      });
    }

    const { email, password, firstName, lastName, username, department, year } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({ 
        error: 'User already exists',
        message: existingUser.email === email ? 'Email already registered' : 'Username already taken'
      });
    }

    // Create new user
    const user = new User({
      email,
      password,
      firstName,
      lastName,
      username,
      department: department || '',
      year: year || null
    });

    // Generate and save registration OTP
    const otp = emailService.generateOTP();
    user.registrationOTP = otp;
    user.registrationOTPExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    user.isEmailVerified = false; // Will be verified after OTP

    await user.save();

    // Send OTP email
    try {
      await emailService.sendRegistrationOTP(user, otp);
      console.log(`📧 Registration OTP sent to ${user.email}: ${otp}`);
    } catch (emailError) {
      console.error('Failed to send registration OTP email:', emailError);
      // Continue with registration even if email fails
    }

    res.status(201).json({
      message: 'User registered successfully. Please check your email for verification code.',
      requiresOTP: true,
      email: user.email,
      userId: user._id
    });

  } catch (error) {
    console.error('Registration error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({ 
        error: 'Duplicate field',
        message: 'Email or username already exists'
      });
    }
    
    res.status(500).json({ 
      error: 'Registration failed',
      message: 'Internal server error'
    });
  }
});

// POST /api/auth/login
router.post('/login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation Error',
        details: errors.array() 
      });
    }

    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ 
        error: 'Invalid credentials',
        message: 'Email or password is incorrect'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({ 
        error: 'Account deactivated',
        message: 'Your account has been deactivated. Please contact support.'
      });
    }

    // Validate password
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({ 
        error: 'Invalid credentials',
        message: 'Email or password is incorrect'
      });
    }

    // Check if user needs email verification (registration OTP)
    if (!user.isEmailVerified) {
      return res.status(403).json({
        error: 'Email verification required',
        message: 'Please verify your email address first',
        requiresRegistrationOTP: true,
        userId: user._id
      });
    }

    // Check if user needs one-time login verification
    if (!user.isLoginVerified) {
      // Generate and save login OTP
      const otp = emailService.generateOTP();
      user.loginOTP = otp;
      user.loginOTPExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
      await user.save();

      // Send login OTP email
      try {
        await emailService.sendLoginOTP(user, otp);
        console.log(`📧 Login OTP sent to ${user.email}: ${otp}`);
      } catch (emailError) {
        console.error('Failed to send login OTP email:', emailError);
      }

      return res.status(200).json({
        message: 'Login verification required. Please check your email for verification code.',
        requiresLoginOTP: true,
        email: user.email,
        userId: user._id
      });
    }

    // Update last seen
    await user.updateLastSeen();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: user.toJSON()
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      error: 'Login failed',
      message: 'Internal server error'
    });
  }
});

// POST /api/auth/upload-profile-image - Upload profile image
router.post('/upload-profile-image', uploadMiddleware.profileImage, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        error: 'No file uploaded',
        message: 'Please select an image file'
      });
    }

    const imageUrl = req.file.location;

    res.json({
      message: 'Profile image uploaded successfully',
      imageUrl
    });

  } catch (error) {
    console.error('Profile image upload error:', error);
    res.status(500).json({ 
      error: 'Upload failed',
      message: 'Failed to upload profile image'
    });
  }
});

// POST /api/auth/forgot-password - Forgot password
router.post('/forgot-password', [
  body('email').isEmail().withMessage('Valid email is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation Error',
        details: errors.array() 
      });
    }

    const { email } = req.body;
    const user = await User.findOne({ email });

    // Always return success for security (don't reveal if email exists)
    res.json({
      message: 'If an account with that email exists, a password reset link has been sent.'
    });

    if (user) {
      // Generate reset token (implement email sending logic here)
      const resetToken = Math.random().toString(36).substring(2, 15);
      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour
      await user.save();
      
      // TODO: Send email with reset link
      console.log(`Password reset token for ${email}: ${resetToken}`);
    }

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ 
      error: 'Request failed',
      message: 'Internal server error'
    });
  }
});

// POST /api/auth/reset-password - Reset password
router.post('/reset-password', [
  body('token').notEmpty().withMessage('Reset token is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation Error',
        details: errors.array() 
      });
    }

    const { token, password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ 
        error: 'Invalid token',
        message: 'Password reset token is invalid or has expired'
      });
    }

    // Update password
    user.password = password;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.json({
      message: 'Password reset successful'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ 
      error: 'Reset failed',
      message: 'Internal server error'
    });
  }
});

// POST /api/auth/verify-registration-otp
router.post('/verify-registration-otp', [
  body('userId').notEmpty().withMessage('User ID is required'),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation Error',
        details: errors.array() 
      });
    }

    const { userId, otp } = req.body;

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        error: 'User not found',
        message: 'Invalid user ID'
      });
    }

    // Check if OTP is valid and not expired
    if (!user.registrationOTP || user.registrationOTP !== otp) {
      return res.status(400).json({ 
        error: 'Invalid OTP',
        message: 'The verification code is incorrect'
      });
    }

    if (!user.registrationOTPExpires || user.registrationOTPExpires < new Date()) {
      return res.status(400).json({ 
        error: 'OTP expired',
        message: 'The verification code has expired. Please request a new one.'
      });
    }

    // Verify user email
    user.isEmailVerified = true;
    user.registrationOTP = null;
    user.registrationOTPExpires = null;
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Email verified successfully',
      token,
      user: user.toJSON()
    });

  } catch (error) {
    console.error('Registration OTP verification error:', error);
    res.status(500).json({ 
      error: 'Verification failed',
      message: 'Internal server error'
    });
  }
});

// POST /api/auth/verify-login-otp
router.post('/verify-login-otp', [
  body('userId').notEmpty().withMessage('User ID is required'),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation Error',
        details: errors.array() 
      });
    }

    const { userId, otp } = req.body;

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        error: 'User not found',
        message: 'Invalid user ID'
      });
    }

    // Check if OTP is valid and not expired
    if (!user.loginOTP || user.loginOTP !== otp) {
      return res.status(400).json({ 
        error: 'Invalid OTP',
        message: 'The verification code is incorrect'
      });
    }

    if (!user.loginOTPExpires || user.loginOTPExpires < new Date()) {
      return res.status(400).json({ 
        error: 'OTP expired',
        message: 'The verification code has expired. Please request a new one.'
      });
    }

    // Mark login as verified (one-time only)
    user.isLoginVerified = true;
    user.loginOTP = null;
    user.loginOTPExpires = null;
    await user.updateLastSeen();
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login verification successful',
      token,
      user: user.toJSON()
    });

  } catch (error) {
    console.error('Login OTP verification error:', error);
    res.status(500).json({ 
      error: 'Verification failed',
      message: 'Internal server error'
    });
  }
});

// POST /api/auth/resend-registration-otp
router.post('/resend-registration-otp', [
  body('userId').notEmpty().withMessage('User ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation Error',
        details: errors.array() 
      });
    }

    const { userId } = req.body;

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        error: 'User not found',
        message: 'Invalid user ID'
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ 
        error: 'Already verified',
        message: 'Email is already verified'
      });
    }

    // Generate new OTP
    const otp = emailService.generateOTP();
    user.registrationOTP = otp;
    user.registrationOTPExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await user.save();

    // Send OTP email
    try {
      await emailService.sendRegistrationOTP(user, otp);
      console.log(`📧 Registration OTP resent to ${user.email}: ${otp}`);
    } catch (emailError) {
      console.error('Failed to resend registration OTP email:', emailError);
      return res.status(500).json({ 
        error: 'Email sending failed',
        message: 'Failed to send verification email'
      });
    }

    res.json({
      message: 'Verification code sent successfully',
      email: user.email
    });

  } catch (error) {
    console.error('Resend registration OTP error:', error);
    res.status(500).json({ 
      error: 'Resend failed',
      message: 'Internal server error'
    });
  }
});

module.exports = router;
