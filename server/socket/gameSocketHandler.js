const GameSession = require('../models/GameSession');

// In-memory active timers map: gameId -> { timerTimeout, timerInterval }
const activeTimers = new Map();

const setupSocketHandlers = (io) => {
  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // ==========================================
    // 1. HOST EVENTS
    // ==========================================

    // Host joins game room as host
    socket.on('host:joinRoom', async ({ gameId, roomCode }) => {
      try {
        const game = await GameSession.findById(gameId).populate('quizId');
        if (!game) {
          return socket.emit('error', { message: 'Game session not found' });
        }

        socket.join(roomCode);
        game.hostSocketId = socket.id;
        await game.save();

        console.log(`Host joined room: ${roomCode}`);
        socket.emit('host:roomJoined', {
          gameId: game._id,
          roomCode: game.roomCode,
          status: game.status,
          currentQuestionIndex: game.currentQuestionIndex,
          players: game.players,
          quiz: game.quizId
        });
      } catch (err) {
        console.error('host:joinRoom error:', err.message);
        socket.emit('error', { message: err.message });
      }
    });

    // Host starts the game
    socket.on('host:startGame', async ({ gameId }) => {
      try {
        const game = await GameSession.findById(gameId).populate('quizId');
        if (!game) return socket.emit('error', { message: 'Game not found' });

        if (game.status !== 'LOBBY') {
          return socket.emit('error', { message: 'Game has already started' });
        }

        game.status = 'QUESTION';
        game.currentQuestionIndex = 0;
        game.startedAt = new Date();
        await game.save();

        startQuestion(io, game);
      } catch (err) {
        console.error('host:startGame error:', err.message);
        socket.emit('error', { message: err.message });
      }
    });

    // Host moves to next question or finished
    socket.on('host:nextQuestion', async ({ gameId }) => {
      try {
        const game = await GameSession.findById(gameId).populate('quizId');
        if (!game) return socket.emit('error', { message: 'Game not found' });

        const nextIndex = game.currentQuestionIndex + 1;

        if (nextIndex >= game.quizId.questions.length) {
          // Game Finished
          game.status = 'ENDED';
          game.endedAt = new Date();
          await game.save();

          // Calculate final leaderboard & stats
          const sortedPlayers = [...game.players].sort((a, b) => b.score - a.score);
          const rankedPlayers = sortedPlayers.map((p, index) => ({
            ...p.toObject(),
            rank: index + 1
          }));

          const totalScore = game.players.reduce((sum, p) => sum + p.score, 0);
          const avgScore = game.players.length > 0 ? Math.round(totalScore / game.players.length) : 0;

          io.to(game.roomCode).emit('game:finished', {
            gameId: game._id,
            leaderboard: rankedPlayers,
            podium: {
              first: rankedPlayers[0] || null,
              second: rankedPlayers[1] || null,
              third: rankedPlayers[2] || null
            },
            stats: {
              totalPlayers: game.players.length,
              totalQuestions: game.quizId.questions.length,
              avgScore
            }
          });
        } else {
          game.status = 'QUESTION';
          game.currentQuestionIndex = nextIndex;
          await game.save();

          startQuestion(io, game);
        }
      } catch (err) {
        console.error('host:nextQuestion error:', err.message);
        socket.emit('error', { message: err.message });
      }
    });

    // Host shows leaderboard
    socket.on('host:showLeaderboard', async ({ gameId }) => {
      try {
        const game = await GameSession.findById(gameId);
        if (!game) return;

        game.status = 'LEADERBOARD';
        await game.save();

        const sortedPlayers = [...game.players].sort((a, b) => b.score - a.score);
        const topPlayers = sortedPlayers.slice(0, 5).map((p, index) => ({
          playerId: p.playerId,
          nickname: p.nickname,
          score: p.score,
          rank: index + 1
        }));

        io.to(game.roomCode).emit('game:showLeaderboard', {
          topPlayers,
          currentQuestion: game.currentQuestionIndex + 1,
          totalQuestions: game.quizId?.questions?.length || 0
        });
      } catch (err) {
        console.error('host:showLeaderboard error:', err.message);
      }
    });

    // ==========================================
    // 2. PLAYER / STUDENT EVENTS
    // ==========================================

    // Player joins game
    socket.on('player:joinGame', async ({ roomCode, nickname, playerId }) => {
      try {
        const game = await GameSession.findOne({ roomCode, status: { $ne: 'ENDED' } });

        if (!game) {
          return socket.emit('player:joinError', { message: 'Game not found. Please check the code.' });
        }

        // Check if nickname taken by an active different player
        const existingPlayerIndex = game.players.findIndex(
          (p) => p.nickname.toLowerCase() === nickname.trim().toLowerCase()
        );

        let activePlayerId = playerId || `p_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

        if (existingPlayerIndex !== -1) {
          const existing = game.players[existingPlayerIndex];
          if (existing.connected && existing.playerId !== playerId) {
            return socket.emit('player:joinError', { message: 'This nickname is already being used in this game.' });
          }
          // Reconnecting player with same nickname
          activePlayerId = existing.playerId;
          game.players[existingPlayerIndex].socketId = socket.id;
          game.players[existingPlayerIndex].connected = true;
        } else {
          // New player join
          game.players.push({
            playerId: activePlayerId,
            nickname: nickname.trim(),
            socketId: socket.id,
            score: 0,
            rank: game.players.length + 1,
            connected: true
          });
        }

        await game.save();
        socket.join(roomCode);

        // Notify socket of successful join
        socket.emit('player:joinedSuccess', {
          gameId: game._id,
          roomCode: game.roomCode,
          playerId: activePlayerId,
          nickname: nickname.trim(),
          status: game.status
        });

        // Broadcast to host and room updated players count
        io.to(roomCode).emit('game:playerJoined', {
          playerCount: game.players.filter((p) => p.connected).length,
          players: game.players.map((p) => ({ nickname: p.nickname, score: p.score, connected: p.connected }))
        });
      } catch (err) {
        console.error('player:joinGame error:', err.message);
        socket.emit('player:joinError', { message: 'Failed to join game' });
      }
    });

    // Player submits answer
    socket.on('player:submitAnswer', async ({ gameId, playerId, selectedAnswer }) => {
      try {
        const game = await GameSession.findById(gameId).populate('quizId');
        if (!game) return socket.emit('error', { message: 'Game not found' });

        // Anti-cheat validation 1: Check status
        if (game.status !== 'QUESTION') {
          return socket.emit('player:answerError', { message: 'Not taking answers right now' });
        }

        const currentQIndex = game.currentQuestionIndex;
        const currentQ = game.quizId.questions[currentQIndex];

        if (!currentQ) {
          return socket.emit('player:answerError', { message: 'Invalid question' });
        }

        // Anti-cheat validation 2: Check if player already answered this question
        const alreadyAnswered = game.answers.some(
          (a) => a.playerId === playerId && a.questionIndex === currentQIndex
        );

        if (alreadyAnswered) {
          return socket.emit('player:answerError', { message: 'You have already submitted an answer!' });
        }

        // Anti-cheat validation 3: Calculate response time & check timer
        const now = Date.now();
        const startTime = game.questionStartTime ? new Date(game.questionStartTime).getTime() : now;
        const responseTimeMs = Math.max(0, now - startTime);
        const maxTimerMs = (currentQ.timer + 1.5) * 1000; // 1.5s network grace period

        if (responseTimeMs > maxTimerMs) {
          return socket.emit('player:answerError', { message: 'Too late! Time expired.' });
        }

        // Check correctness & calculate points
        const isCorrect = Number(selectedAnswer) === currentQ.correctAnswer;
        let pointsEarned = 0;

        if (isCorrect) {
          const basePoints = currentQ.points || 1000;
          // Speed factor formula: fast response yields higher points
          const timerLimitMs = currentQ.timer * 1000;
          const speedFactor = Math.max(0.5, 1 - responseTimeMs / (timerLimitMs * 1.5));
          pointsEarned = Math.round(basePoints * speedFactor);
        }

        // Update player's total score
        const playerIndex = game.players.findIndex((p) => p.playerId === playerId);
        let updatedScore = pointsEarned;

        if (playerIndex !== -1) {
          game.players[playerIndex].score += pointsEarned;
          updatedScore = game.players[playerIndex].score;
        }

        // Save answer entry
        game.answers.push({
          playerId,
          questionIndex: currentQIndex,
          selectedAnswer: Number(selectedAnswer),
          isCorrect,
          responseTimeMs,
          pointsEarned,
          totalScoreAfter: updatedScore
        });

        await game.save();

        // Acknowledge submission to student
        socket.emit('player:answerConfirmed', {
          questionIndex: currentQIndex,
          selectedAnswer: Number(selectedAnswer)
        });

        // Notify host live submission stats
        const answersForThisQ = game.answers.filter((a) => a.questionIndex === currentQIndex);
        const totalConnectedPlayers = game.players.filter((p) => p.connected).length;

        io.to(game.hostSocketId).emit('game:answerReceived', {
          answersCount: answersForThisQ.length,
          totalPlayers: totalConnectedPlayers
        });

        // Auto-end question early if ALL connected players answered
        if (answersForThisQ.length >= totalConnectedPlayers && totalConnectedPlayers > 0) {
          clearQuestionTimer(game._id);
          finishQuestion(io, game._id);
        }
      } catch (err) {
        console.error('player:submitAnswer error:', err.message);
        socket.emit('player:answerError', { message: 'Failed to process answer' });
      }
    });

    // Reconnection handling for player or host
    socket.on('player:reconnect', async ({ gameId, playerId }) => {
      try {
        const game = await GameSession.findById(gameId);
        if (!game) return;

        const player = game.players.find((p) => p.playerId === playerId);
        if (player) {
          player.socketId = socket.id;
          player.connected = true;
          await game.save();

          socket.join(game.roomCode);

          const hasAnsweredCurrent = game.answers.some(
            (a) => a.playerId === playerId && a.questionIndex === game.currentQuestionIndex
          );

          socket.emit('player:reconnectedState', {
            gameId: game._id,
            roomCode: game.roomCode,
            status: game.status,
            currentQuestionIndex: game.currentQuestionIndex,
            score: player.score,
            nickname: player.nickname,
            hasAnsweredCurrent
          });
        }
      } catch (err) {
        console.error('player:reconnect error:', err.message);
      }
    });

    // Handle Socket Disconnect
    socket.on('disconnect', async () => {
      console.log(`Socket disconnected: ${socket.id}`);
      try {
        // Mark player disconnected
        const game = await GameSession.findOne({ 'players.socketId': socket.id });
        if (game) {
          const player = game.players.find((p) => p.socketId === socket.id);
          if (player) {
            player.connected = false;
            await game.save();

            io.to(game.roomCode).emit('game:playerJoined', {
              playerCount: game.players.filter((p) => p.connected).length,
              players: game.players.map((p) => ({ nickname: p.nickname, score: p.score, connected: p.connected }))
            });
          }
        }
      } catch (err) {
        console.error('disconnect handler error:', err.message);
      }
    });
  });
};

// Start Question helper & timer broadcast
const startQuestion = async (io, game) => {
  const currentQIndex = game.currentQuestionIndex;
  const currentQ = game.quizId.questions[currentQIndex];

  if (!currentQ) return;

  game.questionStartTime = new Date();
  await game.save();

  const timerSeconds = currentQ.timer || 20;

  // Broadcast to Host full details (including text and choices)
  io.to(game.hostSocketId).emit('game:questionStarted', {
    questionIndex: currentQIndex,
    totalQuestions: game.quizId.questions.length,
    questionText: currentQ.questionText,
    questionType: currentQ.questionType,
    image: currentQ.image,
    options: currentQ.options,
    timer: timerSeconds,
    points: currentQ.points
  });

  // Broadcast to Students ONLY choice count & metadata (NO question text, NO choice text!)
  io.to(game.roomCode).emit('player:questionStarted', {
    questionIndex: currentQIndex,
    totalQuestions: game.quizId.questions.length,
    questionType: currentQ.questionType,
    optionCount: currentQ.options.length,
    timer: timerSeconds
  });

  clearQuestionTimer(game._id);

  let remaining = timerSeconds;

  const interval = setInterval(() => {
    remaining -= 1;
    io.to(game.roomCode).emit('game:timerTick', { remaining });

    if (remaining <= 0) {
      clearQuestionTimer(game._id);
      finishQuestion(io, game._id);
    }
  }, 1000);

  activeTimers.set(game._id.toString(), { timerInterval: interval });
};

const clearQuestionTimer = (gameId) => {
  const key = gameId.toString();
  if (activeTimers.has(key)) {
    const { timerInterval } = activeTimers.get(key);
    if (timerInterval) clearInterval(timerInterval);
    activeTimers.delete(key);
  }
};

// Finish question & calculate answer breakdown & results
const finishQuestion = async (io, gameId) => {
  try {
    const game = await GameSession.findById(gameId).populate('quizId');
    if (!game) return;

    game.status = 'ANSWER_REVEAL';
    await game.save();

    const currentQIndex = game.currentQuestionIndex;
    const currentQ = game.quizId.questions[currentQIndex];

    // Compute distribution per answer option (0, 1, 2, 3)
    const answersForThisQ = game.answers.filter((a) => a.questionIndex === currentQIndex);
    const distribution = [0, 0, 0, 0];

    answersForThisQ.forEach((ans) => {
      if (ans.selectedAnswer >= 0 && ans.selectedAnswer < 4) {
        distribution[ans.selectedAnswer] += 1;
      }
    });

    // Compute updated ranks
    const sortedPlayers = [...game.players].sort((a, b) => b.score - a.score);
    sortedPlayers.forEach((p, index) => {
      p.rank = index + 1;
    });

    game.players = sortedPlayers;
    await game.save();

    // Broadcast answer reveal to Host
    io.to(game.hostSocketId).emit('game:questionEnded', {
      questionIndex: currentQIndex,
      correctAnswer: currentQ.correctAnswer,
      distribution,
      totalAnswers: answersForThisQ.length,
      nextQuestionAvailable: currentQIndex + 1 < game.quizId.questions.length
    });

    // Broadcast individual player results to each player socket
    game.players.forEach((player) => {
      const playerAns = answersForThisQ.find((a) => a.playerId === player.playerId);
      const socket = io.sockets.sockets.get(player.socketId);

      if (socket) {
        socket.emit('player:questionResult', {
          isCorrect: playerAns ? playerAns.isCorrect : false,
          answered: !!playerAns,
          selectedAnswer: playerAns ? playerAns.selectedAnswer : -1,
          correctAnswer: currentQ.correctAnswer,
          pointsEarned: playerAns ? playerAns.pointsEarned : 0,
          totalScore: player.score,
          rank: player.rank,
          totalPlayers: game.players.length
        });
      }
    });
  } catch (err) {
    console.error('finishQuestion error:', err.message);
  }
};

module.exports = setupSocketHandlers;
