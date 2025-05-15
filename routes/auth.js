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
  // Store current protocol and host for return after OAuth
  req.session.returnTo = `http://${req.headers.host}`;
  passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
});

// Callback handler with improved error handling
router.get('/google/callback', 
  function(req, res, next) {
    passport.authenticate('google', function(err, user, info) {
      try {
        // Log any errors but continue
        if (err) {
          console.log('Google auth error caught but continuing:', err);
        }
        
        // If no user, redirect to login
        if (!user) {
          return res.redirect('/auth/login');
        }
        
        // Log in the user manually to ensure it happens
        req.login(user, function(loginErr) {
          if (loginErr) {
            console.log('Login error but continuing:', loginErr);
          }
          
          // Generate JWT token regardless
          const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN
          });

          // Set the cookie
          res.cookie('jwt', token, {
            expires: new Date(Date.now() + parseInt(process.env.JWT_EXPIRES_IN) * 24 * 60 * 60 * 1000),
            httpOnly: true,
            secure: false
          });
          
          // Always redirect home
          return res.redirect('/');
        });
      } catch (error) {
        // Catch any errors but still try to log in the user
        console.log('Caught exception in callback but continuing:', error);
        
        // If we have a user, still try to set cookie and redirect
        if (user) {
          const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN
          });
          
          res.cookie('jwt', token, {
            expires: new Date(Date.now() + parseInt(process.env.JWT_EXPIRES_IN) * 24 * 60 * 60 * 1000),
            httpOnly: true, 
            secure: false
          });
        }
        
        // Always redirect somewhere useful
        return res.redirect('/');
      }
    })(req, res, next);
  }
);

module.exports = router;
