const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { check } = require('express-validator');
const authMiddleware = require('../middlewares/authMiddleware');
const passport = require('passport');
const crypto = require('crypto');

// Validation rules
const registerValidation = [
  check('username')
    .trim()
    .notEmpty().withMessage('Username is required')
    .isLength({ min: 3 }).withMessage('Username must be at least 3 characters long'),
  
  check('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address'),
  
  check('password')
    .trim()
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
  
  check('confirmPassword')
    .trim()
    .notEmpty().withMessage('Please confirm your password')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    })
];

const loginValidation = [
  check('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address'),
  
  check('password')
    .trim()
    .notEmpty().withMessage('Password is required')
];

const forgotPasswordValidation = [
  check('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address')
];

const resetPasswordValidation = [
  check('password')
    .trim()
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
  
  check('confirmPassword')
    .trim()
    .notEmpty().withMessage('Please confirm your password')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    })
];

// Auth routes
router.get('/register', authMiddleware.redirectIfAuthenticated, authController.getRegisterPage);
router.post('/register', registerValidation, authController.register);

router.get('/login', authMiddleware.redirectIfAuthenticated, authController.getLoginPage);
router.post('/login', loginValidation, authController.login);

router.get('/logout', authController.logout);

// Password reset routes
router.get('/forgot-password', authController.getForgotPasswordPage);
router.post('/forgot-password', forgotPasswordValidation, authController.forgotPassword);
router.get('/reset-password/:token', authController.getResetPasswordPage);
router.post('/reset-password/:token', resetPasswordValidation, authController.resetPassword);

// Google OAuth routes
router.get('/google', (req, res, next) => {
  const deviceId = crypto.createHash('md5').update('template-app-vm').digest('hex');
  
  const authOptions = { 
    scope: ['profile', 'email'],
    state: JSON.stringify({
      deviceId: deviceId,
      deviceName: 'Template VM'
    })
  };
  
  passport.authenticate('google', authOptions)(req, res, next);
});

router.get('/google/callback', 
  passport.authenticate('google', { 
    failureRedirect: '/auth/login' 
  }),
  authController.googleCallback
);

module.exports = router;
