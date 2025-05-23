const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const path = require('path');
const passport = require('passport');
const session = require('express-session');
const authMiddleware = require('./middlewares/authMiddleware');
const http = require('http');
const socketIo = require('socket.io');

dotenv.config();

// Initialize passport config
require('./config/passport')(passport);

// Initialize express app
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));

// Set up session
app.use(session({
  secret: process.env.JWT_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,  // Change this to false to always use HTTP
    maxAge: 24 * 60 * 60 * 1000 // 1 day
  }
}));

// Initialize passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Apply the isLoggedIn middleware globally (before route handlers)
app.use(authMiddleware.isLoggedIn);

// Set up EJS as view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Connect to MongoDB with more options
mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 30000,
  connectTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  family: 4  // Force IPv4
})
.then(() => console.log('MongoDB connected successfully'))
.catch((err) => {
  console.error('MongoDB connection error details:', {
    message: err.message,
    code: err.code,
    name: err.name
  });
});

// Import routes
const indexRoutes = require('./routes/index');
const authRoutes = require('./routes/auth');
const quizRoutes = require('./routes/quiz');
const adminRoutes = require('./routes/admin');

// Use routes
app.use('/', indexRoutes);
app.use('/auth', authRoutes);
app.use('/quizzes', quizRoutes);
app.use('/admin', adminRoutes);
 
// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', { 
    title: 'Error',
    message: 'Something went wrong!'
  });
});

app.get("*", (req, res) => {
    res.render("error", {message: "Siden finnes ikke"});
}); 

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const io = socketIo(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? "http://quiz.jackal.ikt-fag.no" 
      : ["http://localhost:3000", "http://localhost:6000"],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Set up Socket.IO connection handling
require('./sockets/quizSocket')(io);

// Replace app.listen with server.listen
const PORT = process.env.PORT || 6000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
