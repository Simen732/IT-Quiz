const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');

// Apply isLoggedIn middleware to all routes
router.use(authMiddleware.isLoggedIn);

// Home page
router.get('/', (req, res) => {
  res.render('index', {
    title: 'Home'
  });
});

// Protected dashboard route
router.get('/dashboard', authMiddleware.protect, (req, res) => {
  res.render('dashboard', {
    title: 'Dashboard'
  });
});

module.exports = router;
