const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Check if user is logged in (for all routes)
exports.isLoggedIn = async (req, res, next) => {
  // First check if user is authenticated via Passport (Google OAuth)
  if (req.isAuthenticated()) {
    res.locals.isAuthenticated = true;
    res.locals.currentUser = req.user;
    return next();
  }
  
  // If not authenticated via Passport, check JWT
  try {
    const token = req.cookies.jwt;
    
    if (token && token !== 'loggedout') {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Check if user still exists
      const currentUser = await User.findById(decoded.id);
      if (currentUser) {
        // User is logged in via JWT
        res.locals.isAuthenticated = true;
        res.locals.currentUser = currentUser;
        req.user = currentUser; // Make user available on req object
        return next();
      }
    }
  } catch (err) {
    console.error('JWT verification error:', err);
  }

  // Not authenticated via either method
  res.locals.isAuthenticated = false;
  res.locals.currentUser = null;
  next();
};

// Protect routes from unauthenticated access
exports.protect = async (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  
  try {
    const token = req.cookies.jwt;
    
    if (!token || token === 'loggedout') {
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
    next();
  } catch (err) {
    return res.redirect('/auth/login');
  }
};

// Check for admin role
exports.isAdmin = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.redirect('/auth/login');
  }
  
  if (req.user.role !== 'admin') {
    return res.status(403).render('error', { 
      message: 'Du har ikke tilgang til denne siden. Kun administratorer har tilgang.' 
    });
  }
  
  next();
};

// Redirect if already authenticated
exports.redirectIfAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return res.redirect('/dashboard');
  }
  next();
};
