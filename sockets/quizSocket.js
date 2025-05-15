const { v4: uuidv4 } = require('uuid');

// Store active game sessions - IMPORTANT: keep this outside the module exports
// so it persists across socket connections
const gameSessions = new Map();

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);
    
    // Host creates a new game
    socket.on('create-game', (quizData) => {
      // Generate a game code (6 characters)
      const gameCode = Math.floor(100000 + Math.random() * 900000).toString();
      
      console.log(`Creating new game with code: ${gameCode}, host: ${socket.id}`);
      
      // Store game session data
      gameSessions.set(gameCode, {
        host: socket.id,
        quiz: quizData,
        players: [],
        active: false,
        currentQuestion: 0,
        scores: {}
      });
      
      // Join the room
      socket.join(gameCode);
      
      // Send game code back to host
      socket.emit('game-created', { gameCode });
    });
    
    // Player joins a game
    socket.on('join-game', ({ gameCode, playerName }) => {
      console.log(`Player ${playerName} trying to join game ${gameCode}`);
      
      const session = gameSessions.get(gameCode);
      
      if (!session) {
        console.log(`Game ${gameCode} not found`);
        socket.emit('join-error', { message: 'Ugyldig spillkode' });
        return;
      }
      
      if (session.active) {
        console.log(`Game ${gameCode} already active`);
        socket.emit('join-error', { message: 'Spillet har allerede startet' });
        return;
      }
      
      // Generate unique player ID
      const playerId = uuidv4();
      
      // Add player to session
      session.players.push({
        id: playerId,
        name: playerName,
        socketId: socket.id
      });
      
      // Initialize player score
      session.scores[playerId] = 0;
      
      // Join the game room
      socket.join(gameCode);
      
      console.log(`Player ${playerName} (${playerId}) joined game ${gameCode}. Total players: ${session.players.length}`);
      
      // Send player list to everyone in the room
      io.to(gameCode).emit('player-joined', {
        players: session.players
      });
      
      // Send confirmation to the player
      socket.emit('join-success', {
        playerId,
        gameCode
      });
    });
    
    // Host kicks a player
    socket.on('kick-player', ({ gameCode, playerId }) => {
      const session = gameSessions.get(gameCode);
      
      if (!session || session.host !== socket.id) return;
      
      // Find player
      const playerIndex = session.players.findIndex(p => p.id === playerId);
      
      if (playerIndex !== -1) {
        const playerSocketId = session.players[playerIndex].socketId;
        
        // Remove player from session
        session.players.splice(playerIndex, 1);
        delete session.scores[playerId];
        
        // Notify player they were kicked
        io.to(playerSocketId).emit('kicked');
        
        // Update player list for everyone
        io.to(gameCode).emit('player-joined', {
          players: session.players
        });
      }
    });
    
    // Host starts the game
    socket.on('start-game', ({ gameCode }) => {
      const session = gameSessions.get(gameCode);
      
      if (!session || session.host !== socket.id) return;
      
      session.active = true;
      session.currentQuestion = 0;
      
      console.log(`Game ${gameCode} started with ${session.players.length} players`);
      
      // Notify all players that game is starting
      io.to(gameCode).emit('game-started');
      
      // Send the first question
      const question = session.quiz.questions[0];
      io.to(gameCode).emit('new-question', {
        question,
        questionNumber: 1,
        totalQuestions: session.quiz.questions.length
      });
    });
    
    // Player submits an answer
    socket.on('submit-answer', ({ gameCode, playerId, answer, timeRemaining }) => {
      const session = gameSessions.get(gameCode);
      
      if (!session || !session.active) return;
      
      const currentQuestion = session.quiz.questions[session.currentQuestion];
      let correct = false;
      let earnedPoints = 0;
      
      // Initialize score if it doesn't exist
      if (!session.scores[playerId]) {
        session.scores[playerId] = 0;
      }
      
      // Calculate score based on question type and correctness
      switch (currentQuestion.questionType) {
        case 'multiple-choice':
        case 'true-false':
          correct = currentQuestion.options[answer].isCorrect;
          if (correct) {
            // Time bonus - the faster they answer, the more points they get
            const timeBonus = Math.round((timeRemaining / currentQuestion.timeLimit) * 50);
            earnedPoints = currentQuestion.points + timeBonus;
            session.scores[playerId] += earnedPoints;
            console.log(`Player ${playerId} got answer correct, earned ${earnedPoints} points, total: ${session.scores[playerId]}`);
          }
          break;
        case 'fill-in-blank':
          correct = currentQuestion.correctAnswer.toLowerCase() === answer.toLowerCase();
          if (correct) {
            const timeBonus = Math.round((timeRemaining / currentQuestion.timeLimit) * 50);
            earnedPoints = currentQuestion.points + timeBonus;
            session.scores[playerId] += earnedPoints;
            console.log(`Player ${playerId} got answer correct, earned ${earnedPoints} points, total: ${session.scores[playerId]}`);
          }
          break;
        case 'matching':
          // Calculate percentage of correct matches
          const totalPairs = currentQuestion.matchingPairs.length;
          const correctMatches = answer.filter(a => a.leftIndex === a.rightIndex).length;
          const percentageCorrect = correctMatches / totalPairs;
          
          // Add partial points
          if (percentageCorrect > 0) {
            earnedPoints = Math.round(currentQuestion.points * percentageCorrect);
            session.scores[playerId] += earnedPoints;
            console.log(`Player ${playerId} got ${correctMatches}/${totalPairs} matches, earned ${earnedPoints} points, total: ${session.scores[playerId]}`);
          }
          break;
      }
      
      // Notify host about this answer
      socket.to(session.host).emit('player-answered', {
        playerId,
        name: session.players.find(p => p.id === playerId).name,
        correct,
        score: session.scores[playerId]
      });
      
      // Also notify the player about their result
      socket.emit('answer-result', {
        correct,
        earnedPoints,
        totalScore: session.scores[playerId]
      });
    });
    
    // Host advances to next question
    socket.on('next-question', ({ gameCode }) => {
      const session = gameSessions.get(gameCode);
      
      if (!session || session.host !== socket.id) return;
      
      session.currentQuestion++;
      
      if (session.currentQuestion < session.quiz.questions.length) {
        // Send next question
        const question = session.quiz.questions[session.currentQuestion];
        io.to(gameCode).emit('new-question', {
          question,
          questionNumber: session.currentQuestion + 1,
          totalQuestions: session.quiz.questions.length
        });
      } else {
        // End the game and show final scores
        io.to(gameCode).emit('game-over', {
          scores: calculateFinalScores(session)
        });
        
        // Clean up the session after some time
        setTimeout(() => {
          gameSessions.delete(gameCode);
        }, 3600000); // Remove after 1 hour
      }
    });
    
    // Host shows scoreboard
    socket.on('show-scoreboard', ({ gameCode }) => {
      const session = gameSessions.get(gameCode);
      
      if (!session || session.host !== socket.id) return;
      
      io.to(gameCode).emit('scoreboard', {
        scores: calculateFinalScores(session),
        final: session.currentQuestion >= session.quiz.questions.length - 1
      });
    });
    
    // Player disconnects
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
      
      // Check if disconnected client was a host or player
      for (const [gameCode, session] of gameSessions.entries()) {
        if (session.host === socket.id) {
          // Host disconnected, end the game
          console.log(`Host of game ${gameCode} disconnected, ending game`);
          io.to(gameCode).emit('host-disconnected');
          gameSessions.delete(gameCode);
        } else {
          // Check if disconnected client was a player
          const playerIndex = session.players.findIndex(p => p.socketId === socket.id);
          
          if (playerIndex !== -1) {
            const playerId = session.players[playerIndex].id;
            const playerName = session.players[playerIndex].name;
            
            console.log(`Player ${playerName} (${playerId}) disconnected from game ${gameCode}`);
            
            // Remove player from session
            session.players.splice(playerIndex, 1);
            delete session.scores[playerId];
            
            // Update player list for everyone
            io.to(gameCode).emit('player-joined', {
              players: session.players
            });
          }
        }
      }
    });
  });
  
  // Helper function to calculate final scores
  function calculateFinalScores(session) {
    return session.players.map(player => ({
      id: player.id,
      name: player.name,
      score: session.scores[player.id] || 0
    })).sort((a, b) => b.score - a.score); // Sort by score descending
  }
};