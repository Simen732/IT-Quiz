const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true
  },
  questionText: {
    type: String,
    required: [true, 'Question text is required'],
    trim: true
  },
  questionType: {
    type: String,
    required: [true, 'Question type is required'],
    enum: ['multiple-choice', 'true-false', 'fill-in-blank', 'matching']
  },
  timeLimit: {
    type: Number,
    default: 30 // seconds
  },
  points: {
    type: Number,
    default: 10
  },
  // For multiple choice and true-false questions
  options: [{
    text: String,
    isCorrect: Boolean
  }],
  // For fill-in-blank questions
  correctAnswer: {
    type: String
  },
  // For matching questions
  matchingPairs: [{
    left: String,
    right: String
  }],
  explanation: {
    type: String,
    trim: true
  }
});

module.exports = mongoose.model('Question', questionSchema);