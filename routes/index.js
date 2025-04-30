const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const profileController = require('../controllers/profileController');
const uploadMiddleware = require('../middlewares/uploadMiddleware');
const { check } = require('express-validator');

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

// Profile routes
router.get('/profile', authMiddleware.protect, profileController.getProfile);

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

module.exports = router;
