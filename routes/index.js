const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const profileController = require('../controllers/profileController');
const uploadMiddleware = require('../middlewares/uploadMiddleware');
const { check } = require('express-validator');
const Quiz = require('../models/Quiz');

// Apply isLoggedIn middleware to all routes
router.use(authMiddleware.isLoggedIn);

// Home page
router.get('/', (req, res) => {
  res.render('index', {
    title: 'Home'
  });
});

// Protected dashboard route
router.get('/dashboard', authMiddleware.protect, async (req, res) => {
  try {
    // Get user's quizzes
    const userQuizzes = await Quiz.find({ createdBy: req.user._id })
      .sort({ createdAt: -1 });
    
    // Get popular quizzes
    const popularQuizzes = await Quiz.find({ isPublic: true })
      .sort({ timesPlayed: -1 })
      .limit(5)
      .populate('createdBy', 'username');
    
    res.render('dashboard', {
      title: 'Dashboard',
      userQuizzes,
      popularQuizzes
    });
  } catch (err) {
    console.error(err);
    res.render('dashboard', {
      title: 'Dashboard',
      error: 'Kunne ikke hente quizdata'
    });
  }
});

// Profile routes
router.get('/profile', authMiddleware.protect, profileController.getProfile);

// Add FAQ route
router.get('/faq', (req, res) => {
  res.render('faq', {
    title: 'FAQ'
  });
});

// Password validation rules
const passwordChangeValidation = [
  check('currentPassword')
    .trim()
    .notEmpty().withMessage('Current password is required'),
  
  check('newPassword')
    .trim()
    .notEmpty().withMessage('New password is required')
    .isLength({ min: 8 }).withMessage('New password must be at least 8 characters long'),
  
  check('confirmNewPassword')
    .trim()
    .notEmpty().withMessage('Please confirm your new password')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('New passwords do not match');
      }
      return true;
    })
];

// Profile update routes
router.post(
  '/profile/upload-avatar',
  authMiddleware.protect,
  uploadMiddleware.single('profileImage'),
  profileController.updateProfilePicture
);

router.post(
  '/profile/change-password',
  authMiddleware.protect,
  passwordChangeValidation,
  profileController.changePassword
);

// Add API endpoint for popular quizzes
router.get('/api/quizzes/popular', async (req, res) => {
  try {
    const popularQuizzes = await Quiz.find({ isPublic: true })
      .sort({ timesPlayed: -1 })
      .limit(3)
      .populate('createdBy', 'username')
      .lean();
    
    res.json({ success: true, quizzes: popularQuizzes });
  } catch (err) {
    console.error('Error fetching popular quizzes:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
