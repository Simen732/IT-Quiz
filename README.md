# IT-Quiz Platform

A comprehensive web application for creating, sharing, and participating in IT-related quizzes. This platform supports various quiz types, user management, and administrator features in a modern, interactive interface.

![IT Quiz Platform](public/img/IT-quiz.png)

## Features

### User Management
- User registration with email verification
- Login with username/password and Google OAuth integration
- Password reset functionality
- User profiles with customizable avatars
- Role-based access (regular users and administrators)

### Quiz Features
- Create, edit, and delete quizzes
- Various question types:
  - Multiple choice
  - True/false
  - Fill-in-the-blank
  - Matching pairs
- Quiz categorization:
  - Programmering (Programming)
  - Databasesystemer (Database Systems)
  - Nettverk (Networking)
  - IT-sikkerhet (IT Security)
  - Annet (Other)
- Difficulty levels (Lett/Easy, Middels/Medium, Vanskelig/Hard)
- Public and private quiz options
- Quiz statistics (times played, likes)

### Gameplay
- Single-player quiz mode with score tracking
- Multiplayer mode for competitive quizzing
- Timed questions with progress bars
- Detailed explanations for answers
- Quiz results and leaderboards

### Administrative Features
- User management dashboard
- Quiz moderation capabilities
- Usage statistics and analytics
- User role management

## Technology Stack

- **Frontend**:
  - HTML/CSS/JavaScript
  - Bootstrap 5 for responsive design
  - EJS (Embedded JavaScript) for templating

- **Backend**:
  - Node.js
  - Express.js framework
  - MongoDB with Mongoose ODM
  - Passport.js for authentication

- **Additional Libraries**:
  - Socket.io for real-time multiplayer functionality
  - Express-session for session management
  - Multer for file uploads
  - Dotenv for environment variable management

## Project Structure

```
IT-Quiz/
├── controllers/        # Route controllers
├── middlewares/        # Custom middleware functions
├── models/             # Mongoose data models
├── public/             # Static files (CSS, JS, images)
├── routes/             # Express routes
├── scripts/            # Utility scripts
├── views/              # EJS templates
│   ├── admin/          # Admin dashboard views
│   ├── auth/           # Authentication views
│   ├── partials/       # Reusable template parts
│   ├── quizzes/        # Quiz-related views
├── .env                # Environment configuration
├── app.js              # Express app setup
└── package.json        # Project dependencies
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd IT-Quiz
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   NODE_ENV=development
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/it-quiz
   SESSION_SECRET=your_session_secret
   
   # For email functionality
   EMAIL_HOST=smtp.example.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@example.com
   EMAIL_PASS=your_email_password
   
   # For Google OAuth (if using)
   GOOGLE_CLIENT_ID=your_client_id
   GOOGLE_CLIENT_SECRET=your_client_secret
   GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback
   ```

4. Start the development server:
   ```
   npm run dev
   ```

5. Access the application at `http://localhost:3000`

### Setting Up an Admin User

Before running the sample quiz script, create an admin user:

1. Register a new user through the application
2. Connect to your MongoDB database using MongoDB Compass or the mongo shell
3. Update the user's role to 'admin':
   ```javascript
   db.users.updateOne({email: "your@email.com"}, {$set: {role: "admin"}})
   ```

## Adding Sample Quizzes

The project includes a script to populate the database with sample quizzes:

1. Ensure you have an admin user in the database
2. Run the quiz creation script:
   ```
   node scripts/add-quizzes.js
   ```

This will add three sample quizzes:
- Grunnleggende Webutvikling (Basic Web Development)
- Oppsett av Ubuntu VM (Ubuntu VM Setup)
- Kundeservice Grunnleggende (Basic Customer Support)

## Quiz Types and Formats

The platform supports several question types:

1. **Multiple Choice**: Questions with several options where one is correct
2. **True/False**: Simple binary choice questions
3. **Fill in the Blank**: Questions requiring a text answer
4. **Matching Pairs**: Questions where items on the left must be matched with items on the right

Each question can include:
- Time limits for answering
- Point values
- Detailed explanations shown after answering

## Deployment

For production deployment:

1. Set appropriate environment variables for production
2. Build any frontend assets if needed:
   ```
   npm run build
   ```
3. Start the application in production mode:
   ```
   npm start
   ```

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## License

[Your License Here] - See the LICENSE file for details.