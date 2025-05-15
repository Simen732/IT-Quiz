const Quiz = require('../models/Quiz');
const Question = require('../models/Question');
const { validationResult } = require('express-validator');

// Get all quizzes with pagination
exports.getAllQuizzes = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 9;
    const skip = (page - 1) * limit;
    
    const quizzes = await Quiz.find({ isPublic: true })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('createdBy', 'username profileImage');
    
    const total = await Quiz.countDocuments({ isPublic: true });
    
    res.render('quizzes/index', {
      title: 'Alle Quizzer',
      quizzes,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalQuizzes: total
    });
  } catch (err) {
    console.error(err);
    res.status(500).render('error', { message: 'Noe gikk galt ved henting av quizzer.' });
  }
};

// Get quizzes by category
exports.getQuizzesByCategory = async (req, res) => {
  try {
    const category = req.params.category;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 9;
    const skip = (page - 1) * limit;
    
    const quizzes = await Quiz.find({ isPublic: true, category })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('createdBy', 'username profileImage');
    
    const total = await Quiz.countDocuments({ isPublic: true, category });
    
    res.render('quizzes/category', {
      title: `${category} Quizzer`,
      quizzes,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalQuizzes: total,
      category
    });
  } catch (err) {
    console.error(err);
    res.status(500).render('error', { message: 'Noe gikk galt ved henting av quizzer.' });
  }
};

// Get quiz creation form
exports.getCreateQuizForm = (req, res) => {
  // Define the categories and difficulty levels based on your Quiz model
  const categories = ['Programmering', 'Databasesystemer', 'Nettverk', 'IT-sikkerhet', 'Annet'];
  const difficulties = ['Lett', 'Middels', 'Vanskelig'];
  
  res.render('quizzes/create', {
    title: 'Lag ny quiz',
    categories,
    difficulties
  });
};

// Create new quiz
exports.createQuiz = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).render('quizzes/create', {
      title: 'Opprett Quiz',
      errors: errors.array(),
      formData: req.body
    });
  }

  try {
    const { title, description, category, difficulty } = req.body;
    
    const quiz = new Quiz({
      title,
      description,
      category,
      difficulty,
      createdBy: req.user._id
    });
    
    await quiz.save();
    
    // Redirect to question creation for this quiz
    res.redirect(`/quizzes/${quiz._id}/questions/create`);
  } catch (err) {
    console.error(err);
    res.status(500).render('quizzes/create', {
      title: 'Opprett Quiz',
      message: 'Noe gikk galt ved opprettelse av quiz.',
      formData: req.body
    });
  }
};

// Get quiz detail page
exports.getQuizDetails = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id)
      .populate('createdBy', 'username profileImage')
      .populate('questions');
    
    if (!quiz) {
      return res.status(404).render('error', { message: 'Quiz ble ikke funnet.' });
    }
    
    res.render('quizzes/detail', {
      title: quiz.title,
      quiz
    });
  } catch (err) {
    console.error(err);
    res.status(500).render('error', { message: 'Noe gikk galt ved henting av quiz.' });
  }
};

// Get quiz play page
exports.getPlayQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id)
      .populate('questions');
    
    if (!quiz) {
      return res.status(404).render('error', { message: 'Quiz ble ikke funnet.' });
    }
    
    // Increment times played
    quiz.timesPlayed += 1;
    await quiz.save();
    
    res.render('quizzes/play', {
      title: `Spill: ${quiz.title}`,
      quiz,
      // Convert questions to JSON for frontend JavaScript
      quizData: JSON.stringify({
        id: quiz._id,
        title: quiz.title,
        questions: quiz.questions
      })
    });
  } catch (err) {
    console.error(err);
    res.status(500).render('error', { message: 'Noe gikk galt ved start av quiz.' });
  }
};

// Get question creation form
exports.getCreateQuestionForm = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    
    if (!quiz) {
      return res.status(404).render('error', { message: 'Quiz ble ikke funnet.' });
    }
    
    if (quiz.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).render('error', { message: 'Du har ikke tillatelse til å redigere denne quizen.' });
    }
    
    res.render('quizzes/create-question', {
      title: 'Legg til spørsmål',
      quiz
    });
  } catch (err) {
    console.error(err);
    res.status(500).render('error', { message: 'Noe gikk galt ved henting av quiz.' });
  }
};

// Create new question
exports.createQuestion = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).render('quizzes/create-question', {
      title: 'Legg til spørsmål',
      errors: errors.array(),
      formData: req.body
    });
  }

  try {
    const { questionText, questionType, timeLimit, points, explanation } = req.body;
    const quizId = req.params.id;
    
    // Get the quiz
    const quiz = await Quiz.findById(quizId);
    
    if (!quiz) {
      return res.status(404).render('error', { message: 'Quiz ble ikke funnet.' });
    }
    
    if (quiz.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).render('error', { message: 'Du har ikke tillatelse til å redigere denne quizen.' });
    }
    
    // Create question based on question type
    const question = new Question({
      quizId,
      questionText,
      questionType,
      timeLimit,
      points,
      explanation
    });
    
    // Handle different question types
    if (questionType === 'multiple-choice' || questionType === 'true-false') {
      const options = [];
      const optionCount = parseInt(req.body.optionCount || 0);
      
      for (let i = 0; i < optionCount; i++) {
        options.push({
          text: req.body[`option${i}`],
          isCorrect: req.body[`correct`] === `${i}`
        });
      }
      
      question.options = options;
    } else if (questionType === 'fill-in-blank') {
      question.correctAnswer = req.body.correctAnswer;
    } else if (questionType === 'matching') {
      const matchingPairs = [];
      const pairCount = parseInt(req.body.pairCount || 0);
      
      for (let i = 0; i < pairCount; i++) {
        matchingPairs.push({
          left: req.body[`left${i}`],
          right: req.body[`right${i}`]
        });
      }
      
      question.matchingPairs = matchingPairs;
    }
    
    await question.save();
    
    // Add question to quiz
    quiz.questions.push(question._id);
    await quiz.save();
    
    // Check if there are more questions to add
    if (req.body.addAnother === 'true') {
      res.redirect(`/quizzes/${quizId}/questions/create`);
    } else {
      res.redirect(`/quizzes/${quizId}/review`);  // Redirect to review instead
    }
  } catch (err) {
    console.error(err);
    res.status(500).render('quizzes/create-question', {
      title: 'Legg til spørsmål',
      message: 'Noe gikk galt ved opprettelse av spørsmål.',
      formData: req.body
    });
  }
};

// Delete quiz
exports.deleteQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    
    if (!quiz) {
      return res.status(404).render('error', { message: 'Quiz ble ikke funnet.' });
    }
    
    // Check if user is owner or admin
    if (quiz.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).render('error', { message: 'Du har ikke tillatelse til å slette denne quizen.' });
    }
    
    // Delete all questions associated with the quiz
    await Question.deleteMany({ quizId: quiz._id });
    
    // Delete the quiz
    await Quiz.findByIdAndDelete(req.params.id);
    
    // Redirect based on user role
    if (req.user.role === 'admin') {
      res.redirect('/admin/quizzes');
    } else {
      res.redirect('/dashboard');
    }
  } catch (err) {
    console.error(err);
    res.status(500).render('error', { message: 'Noe gikk galt ved sletting av quiz.' });
  }
};

// Like quiz
exports.likeQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz ble ikke funnet.' });
    }
    
    quiz.likes += 1;
    await quiz.save();
    
    res.json({ success: true, likes: quiz.likes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Noe gikk galt.' });
  }
};

// Add review quiz function
exports.reviewQuiz = async (req, res) => {
  try {
    const quizId = req.params.id;
    const quiz = await Quiz.findById(quizId)
      .populate('questions');
    
    if (!quiz) {
      return res.status(404).render('error', { message: 'Quiz ble ikke funnet.' });
    }
    
    // Check if user is owner
    if (quiz.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).render('error', { message: 'Du har ikke tillatelse til å redigere denne quizen.' });
    }
    
    res.render('quizzes/review', {
      title: 'Sjekk og publiser quiz',
      quiz
    });
  } catch (err) {
    console.error(err);
    res.status(500).render('error', { message: 'Noe gikk galt ved visning av quiz.' });
  }
};

// Host multiplayer quiz
exports.hostQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id)
      .populate('questions')
      .populate('createdBy', 'username');
    
    if (!quiz) {
      return res.status(404).render('error', { message: 'Quiz ble ikke funnet.' });
    }
    
    res.render('quizzes/host', {
      title: `Host: ${quiz.title}`,
      quiz,
      // Convert questions to JSON for frontend JavaScript
      quizData: JSON.stringify({
        id: quiz._id,
        title: quiz.title,
        questions: quiz.questions
      })
    });
  } catch (err) {
    console.error(err);
    res.status(500).render('error', { message: 'Noe gikk galt ved start av multiplayer quiz.' });
  }
};

// Join quiz form
exports.joinQuizForm = (req, res) => {
  res.render('quizzes/join', {
    title: 'Bli med på quiz'
  });
};

// Join quiz
exports.joinQuiz = (req, res) => {
  const { gameCode, playerName } = req.body;
  
  if (!gameCode || !playerName) {
    return res.render('quizzes/join', {
      title: 'Bli med på quiz',
      error: 'Både spillkode og navn er påkrevd'
    });
  }
  
  res.render('quizzes/play-multiplayer', {
    title: 'Multiplayer Quiz',
    gameCode,
    playerName
  });
};