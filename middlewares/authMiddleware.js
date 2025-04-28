const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - only authenticated users can access
exports.protect = async (req, res, next) => {
  try {
    // Check if user is authenticated by Passport
    if (req.isAuthenticated()) {
      res.locals.user = req.user;
      return next();
    }

    // Get token from cookies
    const token = req.cookies.jwt;

    if (!token) {
      return res.redirect('/auth/login');
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return res.redirect('/auth/login');
    }

    // Grant access to protected route
    req.user = currentUser;
    res.locals.user = currentUser;
    next();
  } catch (err) {
    res.redirect('/auth/login');
  }
};

// Check if user is logged in for views
exports.isLoggedIn = async (req, res, next) => {
  try {
    // Check if user is authenticated by Passport
    if (req.isAuthenticated()) {
      res.locals.user = req.user;
      return next();
    }

    if (req.cookies.jwt) {
      // Verify token
      const decoded = jwt.verify(req.cookies.jwt, process.env.JWT_SECRET);

      // Check if user still exists
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
      }

      // User is logged in
      res.locals.user = currentUser;
      return next();
    }
  } catch (err) {
    // No logged-in user
  }
  next();
};

// Redirect if already authenticated
exports.redirectIfAuthenticated = async (req, res, next) => {
  // Check if user is authenticated by Passport
  if (req.isAuthenticated()) {
    return res.redirect('/');
  }

  if (req.cookies.jwt) {
    try {
      // Verify token
      const decoded = jwt.verify(req.cookies.jwt, process.env.JWT_SECRET);
      
      // Check if user exists
      const currentUser = await User.findById(decoded.id);
      if (currentUser) {
        return res.redirect('/');
      }
    } catch (err) {
      // Invalid token, continue
    }
  }
  next();
};
