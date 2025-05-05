const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const quizController = require('../controllers/quizController');
const { check } = require('express-validator');

// Quiz validation rules
const quizValidation = [
  check('title')
    .trim()
    .notEmpty().withMessage('Tittel er påkrevd')
    .isLength({ min: 3 }).withMessage('Tittel må være minst 3 tegn'),
  
  check('description')
    .trim()
    .notEmpty().withMessage('Beskrivelse er påkrevd'),
  
  check('category')
    .trim()
    .notEmpty().withMessage('Kategori er påkrevd'),
  
  check('difficulty')
    .trim()
    .notEmpty().withMessage('Vanskelighetsgrad er påkrevd')
];

const questionValidation = [
  check('questionText')
    .trim()
    .notEmpty().withMessage('Spørsmålstekst er påkrevd'),
  
  check('questionType')
    .trim()
    .notEmpty().withMessage('Spørsmålstype er påkrevd')
];

// Apply isLoggedIn middleware to all routes
router.use(authMiddleware.isLoggedIn);

// Public quiz routes
router.get('/', quizController.getAllQuizzes);

// Move these routes BEFORE the /:id routes
router.get('/create', authMiddleware.protect, quizController.getCreateQuizForm);
router.post('/create', authMiddleware.protect, quizValidation, quizController.createQuiz);

// Then put the parameter routes after
router.get('/category/:category', quizController.getQuizzesByCategory);
router.get('/:id', quizController.getQuizDetails);
router.get('/:id/play', quizController.getPlayQuiz);
router.get('/:id/questions/create', authMiddleware.protect, quizController.getCreateQuestionForm);
// ... other routes with :id parameter

// Protected quiz routes
router.post('/:id/questions/create', authMiddleware.protect, questionValidation, quizController.createQuestion);
router.post('/:id/delete', authMiddleware.protect, quizController.deleteQuiz);
router.post('/:id/like', authMiddleware.protect, quizController.likeQuiz);
// Add review route
router.get('/:id/review', authMiddleware.protect, quizController.reviewQuiz);

module.exports = router;