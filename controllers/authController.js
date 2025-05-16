const User = require('../models/User');
const argon2 = require('argon2');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const crypto = require('crypto');
const sendEmail = require('../utils/emailService');

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

// Register a new user
exports.register = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render('auth/register', {
        title: 'Register',
        errors: errors.array(),
        formData: req.body  // Changed from user: req.body
      });
    }

    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });
    
    if (existingUser) {
      return res.status(400).render('auth/register', {
        title: 'Register',
        error: 'User with that email or username already exists',
        user: req.body
      });
    }

    // Hash the password
    const hashedPassword = await argon2.hash(password);

    // Create a new user
    await User.create({
      username,
      email,
      password: hashedPassword
    });

    // Redirect to login page
    res.redirect('/auth/login');
  } catch (err) {
    console.error(err);
    res.status(500).render('auth/register', {
      title: 'Register',
      error: 'An error occurred during registration',
      user: req.body
    });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render('auth/login', {
        title: 'Login',
        errors: errors.array(),
        user: req.body
      });
    }

    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email }).select('+password');

    console.log('Login attempt for:', email);
    console.log('User found in DB:', !!user);
    if (user) {
      console.log('User has password:', !!user.password);
      console.log('Password from DB:', user.password);  // Be careful with this in production
      console.log('Password from form:', password);  // Be careful with this in production
      
      try {
        // Verify password
        const isPasswordValid = await argon2.verify(user.password, password);
        console.log('Password verification result:', isPasswordValid);
        
        if (!isPasswordValid) {
          return res.status(401).render('auth/login', {
            title: 'Login',
            error: 'Invalid credentials',
            user: req.body
          });
        }
        
        // Generate JWT token
        const token = generateToken(user._id);

        // Set JWT as HTTP-only cookie
        res.cookie('jwt', token, {
          expires: new Date(
            Date.now() + parseInt(process.env.JWT_EXPIRES_IN) * 24 * 60 * 60 * 1000
          ),
          httpOnly: true,
          secure: false  // Change to false for HTTP
        });

        // Redirect to home page
        res.redirect('/');
        
      } catch (err) {
        console.error('Password verification error:', err);
        return res.status(401).render('auth/login', {
          title: 'Login',
          error: 'Authentication error occurred',
          user: req.body
        });
      }
    }
  } catch (err) {
    console.error(err);
    res.status(500).render('auth/login', {
      title: 'Login',
      error: 'An error occurred during login',
      user: req.body
    });
  }
};

// Logout user
exports.logout = (req, res) => {
  // Clear JWT cookie
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  
  // Check if the user is authenticated with Passport (Google login)
  if (req.isAuthenticated()) {
    // Modern versions of Passport require a callback
    req.logout(function(err) {
      if (err) {
        console.error('Error during logout:', err);
      }
      // Redirect after logout is complete
      res.redirect('/');
    });
  } else {
    // Regular JWT user, just redirect
    res.redirect('/');
  }
};

// Render register page
exports.getRegisterPage = (req, res) => {
  res.render('auth/register', {
    title: 'Register',
    formData: {},  // Change variable name to formData
    errors: []
  });
};

// Render login page
exports.getLoginPage = (req, res) => {
  res.render('auth/login', {
    title: 'Login',
    formData: {},  // Change variable name to formData
    errors: []
  });
};

// Render forgot password page
exports.getForgotPasswordPage = (req, res) => {
  res.render('auth/forgot-password', {
    title: 'Forgot Password',
    errors: []
  });
};

// Handle forgot password request
exports.forgotPassword = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render('auth/forgot-password', {
        title: 'Forgot Password',
        errors: errors.array()
      });
    }

    const { email } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.render('auth/forgot-password', {
        title: 'Forgot Password',
        message: 'Please check to see if you have put a valid email in the input field',
        messageType: 'success'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Hash token and set to resetPasswordToken field
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
      
    // Set expiry time - 10 minutes
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000;
    
    // Save the user with the reset token info
    await user.save();

    // Create reset URL
    const resetURL = `${process.env.APP_URL}/auth/reset-password/${resetToken}`;
    
    // Create email content
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Password Reset Request</h2>
        <p>You requested to reset your password. Click the button below to set a new password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetURL}" style="background-color: #007bff; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Reset Your Password</a>
        </div>
        <p>This link is only valid for 10 minutes.</p>
        <p>If you didn't request this, please ignore this email and your password will remain unchanged.</p>
        <p>Thanks,<br/>The ${process.env.APP_NAME} Team</p>
      </div>
    `;

    try {
      // Send email with better error handling
      await sendEmail({
        email: user.email,
        subject: `${process.env.APP_NAME} - Password Reset Request`,
        html
      });
      
      // Render success message
      res.render('auth/forgot-password', {
        title: 'Forgot Password',
        message: 'If an account with that email exists, a password reset link has been sent.',
        messageType: 'success'
      });
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
      res.status(500).render('auth/forgot-password', {
        title: 'Forgot Password',
        error: 'Failed to send reset email. Please try again later.'
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).render('auth/forgot-password', {
      title: 'Forgot Password',
      error: 'An error occurred while processing your request'
    });
  }
};

// Render reset password page
exports.getResetPasswordPage = async (req, res) => {
  try {
    const { token } = req.params;
    
    // Hash the token from URL
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');
    
    // Find user with the token that hasn't expired
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).render('error', {
        title: 'Error',
        message: 'Password reset token is invalid or has expired'
      });
    }
    
    // Render the reset password page
    res.render('auth/reset-password', {
      title: 'Reset Password',
      token,
      errors: []
    });
  } catch (err) {
    console.error(err);
    res.status(500).render('error', {
      title: 'Error',
      message: 'An error occurred. Please try the password reset process again.'
    });
  }
};

// Handle password reset
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render('auth/reset-password', {
        title: 'Reset Password',
        token,
        errors: errors.array()
      });
    }
    
    // Hash the token from URL
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');
    
    // Find user with the token that hasn't expired
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).render('error', {
        title: 'Error',
        message: 'Password reset token is invalid or has expired'
      });
    }
    
    // Hash the new password
    const hashedPassword = await argon2.hash(password);
    
    // Update user password and clear reset token fields
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    
    // Render success message
    res.render('auth/login', {
      title: 'Login',
      message: 'Your password has been successfully updated. You can now log in with your new password.',
      messageType: 'success',
      user: { email: user.email }
    });
  } catch (err) {
    console.error(err);
    res.status(500).render('error', {
      title: 'Error',
      message: 'An error occurred while resetting your password. Please try again.'
    });
  }
};

// Google OAuth callback handler
exports.googleCallback = (req, res) => {
  try {
    // Generate JWT token for the user
    const token = generateToken(req.user._id);

    // Set JWT as HTTP-only cookie
    res.cookie('jwt', token, {
      expires: new Date(
        Date.now() + parseInt(process.env.JWT_EXPIRES_IN) * 24 * 60 * 60 * 1000
      ),
      httpOnly: true,
      secure: false  // Change to false for HTTP
    });

    // Redirect to home page
    res.redirect('/');
  } catch (err) {
    console.error('Error in Google auth callback:', err);
    res.redirect('/auth/login');
  }
};
