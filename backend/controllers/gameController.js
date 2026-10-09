const GameSession = require('../models/GameSession');
const Quiz = require('../models/Quiz');
const { generateRoomCode } = require('../utils/codeGenerator');

// @desc    Create a new game session (Host starts a lobby)
// @route   POST /api/games
// @access  Private (Host/Admin)
const createGame = async (req, res, next) => {
  try {
    const { quizId } = req.body;

    if (!quizId) {
      return res.status(400).json({ message: 'Quiz ID is required' });
    }

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    if (!quiz.questions || quiz.questions.length === 0) {
      return res.status(400).json({ message: 'Cannot start game for a quiz with 0 questions' });
    }

    const roomCode = await generateRoomCode();

    const session = await GameSession.create({
      roomCode,
      quizId,
      hostId: req.user._id,
      status: 'LOBBY',
      currentQuestionIndex: -1,
      players: [],
      answers: []
    });

    // Increment play count of quiz
    quiz.playCount += 1;
    await quiz.save();

    res.status(201).json({
      _id: session._id,
      roomCode: session.roomCode,
      status: session.status,
      quiz: {
        _id: quiz._id,
        title: quiz.title,
        description: quiz.description,
        totalQuestions: quiz.questions.length
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get game session by 6-digit room code (for student join validation)
// @route   GET /api/games/code/:roomCode
// @access  Public
const getGameByCode = async (req, res, next) => {
  try {
    const { roomCode } = req.params;

    const session = await GameSession.findOne({ roomCode }).populate('quizId', 'title description totalQuestions');

    if (!session) {
      return res.status(404).json({ message: 'Game not found. Please check the code.' });
    }

    if (session.status === 'ENDED') {
      return res.status(400).json({ message: 'This game session has already ended.' });
    }

    res.json({
      _id: session._id,
      roomCode: session.roomCode,
      status: session.status,
      quizTitle: session.quizId?.title || 'Quiz Session'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get game session full details by ID
// @route   GET /api/games/:id
// @access  Public / Private
const getGameById = async (req, res, next) => {
  try {
    const session = await GameSession.findById(req.params.id).populate('quizId');

    if (!session) {
      return res.status(404).json({ message: 'Game session not found' });
    }

    res.json(session);
  } catch (error) {
    next(error);
  }
};

// @desc    End game session
// @route   POST /api/games/:id/end
// @access  Private (Host)
const endGame = async (req, res, next) => {
  try {
    const session = await GameSession.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ message: 'Game session not found' });
    }

    session.status = 'ENDED';
    session.endedAt = new Date();
    await session.save();

    res.json({ message: 'Game ended successfully', session });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createGame,
  getGameByCode,
  getGameById,
  endGame
};
