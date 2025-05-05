const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const adminController = require('../controllers/adminController');

// Apply admin middleware to all routes
router.use(authMiddleware.isAdmin);

// Admin dashboard
router.get('/', adminController.getAdminDashboard);

// User management
router.get('/users', adminController.getUsersList);
router.post('/users/:id/toggle-admin', adminController.toggleAdminStatus);
router.post('/users/:id/delete', adminController.deleteUser);

// Quiz management
router.get('/quizzes', adminController.getQuizzesList);
router.post('/quizzes/:id/toggle-visibility', adminController.toggleQuizVisibility);

module.exports = router;