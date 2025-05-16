const User = require('../models/User');
const Quiz = require('../models/Quiz');
const Question = require('../models/Question');

// Admin dashboard
exports.getAdminDashboard = async (req, res) => {
  try {
    // Get counts for dashboard stats
    const userCount = await User.countDocuments();
    const quizCount = await Quiz.countDocuments();
    const questionCount = await Question.countDocuments();
    
    // Get recent registrations
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5);
    
    // Get popular quizzes
    const popularQuizzes = await Quiz.find()
      .sort({ timesPlayed: -1 })
      .limit(5)
      .populate('createdBy', 'username');
    
    res.render('admin/dashboard', {
      title: 'Admin Dashboard',
      stats: {
        userCount,
        quizCount,
        questionCount
      },
      recentUsers,
      popularQuizzes
    });
  } catch (err) {
    console.error(err);
    res.status(500).render('error', { message: 'Noe gikk galt ved lasting av admin dashboard.' });
  }
};

exports.getDashboard = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    const quizzes = await Quiz.find().sort({ createdAt: -1 });
    
    res.render('admin/dashboard', {
      title: 'Admin Dashboard',
      users,
      quizzes
    });
  } catch (err) {
    console.error(err);
    res.status(500).render('error', { message: 'Server error' });
  }
};

// User management
exports.getUsersList = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const users = await User.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await User.countDocuments();
    
    res.render('admin/users', {
      title: 'Administrer Brukere',
      users,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalUsers: total
    });
  } catch (err) {
    console.error(err);
    res.status(500).render('error', { message: 'Noe gikk galt ved henting av brukere.' });
  }
};

// Toggle user admin status
exports.toggleAdminStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).render('error', { message: 'Bruker ble ikke funnet.' });
    }
    
    // Cannot change your own admin status
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(403).render('error', { message: 'Du kan ikke endre din egen admin-status.' });
    }
    
    // Toggle role
    user.role = user.role === 'admin' ? 'user' : 'admin';
    await user.save();
    
    res.redirect('/admin/users');
  } catch (err) {
    console.error(err);
    res.status(500).render('error', { message: 'Noe gikk galt ved endring av bruker-status.' });
  }
};

exports.makeAdmin = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ status: 'error', message: 'User not found' });
    
    user.role = 'admin';
    await user.save();
    
    res.status(200).json({ status: 'success', message: 'User updated to admin' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
};

exports.removeAdmin = async (req, res) => {
  try {
    // Prevent removing the default admin
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ status: 'error', message: 'User not found' });
    
    if (user.username === 'Simen' && user.email === 'simenwaerstad2@gmail.com') {
      return res.status(403).json({ status: 'error', message: 'Cannot remove admin status from default admin' });
    }
    
    user.role = 'user';
    await user.save();
    
    res.status(200).json({ status: 'success', message: 'Admin status removed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).render('error', { message: 'Bruker ble ikke funnet.' });
    }
    
    // Cannot delete yourself
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(403).render('error', { message: 'Du kan ikke slette din egen bruker.' });
    }
    
    // First delete all quizzes and questions by this user
    const userQuizzes = await Quiz.find({ createdBy: user._id });
    
    for (const quiz of userQuizzes) {
      await Question.deleteMany({ quizId: quiz._id });
    }
    
    await Quiz.deleteMany({ createdBy: user._id });
    
    // Delete the user
    await User.findByIdAndDelete(req.params.id);
    
    res.redirect('/admin/users');
  } catch (err) {
    console.error(err);
    res.status(500).render('error', { message: 'Noe gikk galt ved sletting av bruker.' });
  }
};

// Quiz management
exports.getQuizzesList = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const quizzes = await Quiz.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('createdBy', 'username email');
    
    const total = await Quiz.countDocuments();
    
    res.render('admin/quizzes', {
      title: 'Administrer Quizzer',
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

exports.deleteQuiz = async (req, res) => {
  try {
    await Quiz.findByIdAndDelete(req.params.id);
    res.status(200).json({ status: 'success', message: 'Quiz deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
};

// Update quiz visibility
exports.toggleQuizVisibility = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    
    if (!quiz) {
      return res.status(404).render('error', { message: 'Quiz ble ikke funnet.' });
    }
    
    // Toggle public status
    quiz.isPublic = !quiz.isPublic;
    await quiz.save();
    
    res.redirect('/admin/quizzes');
  } catch (err) {
    console.error(err);
    res.status(500).render('error', { message: 'Noe gikk galt ved endring av quiz-synlighet.' });
  }
};