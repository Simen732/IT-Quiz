const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, isAdmin } = require('../middlewares/authMiddleware');

// Protect all admin routes
router.use(protect, isAdmin);

// Admin dashboard
router.get('/dashboard', adminController.getDashboard);

// User management
router.patch('/users/:id/make-admin', adminController.makeAdmin);
router.patch('/users/:id/remove-admin', adminController.removeAdmin);

// Quiz management
router.delete('/quizzes/:id', adminController.deleteQuiz);

module.exports = router;