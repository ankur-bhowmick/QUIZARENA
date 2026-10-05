const mongoose = require('mongoose');

const PlayerSchema = new mongoose.Schema({
  playerId: {
    type: String,
    required: true
  },
  nickname: {
    type: String,
    required: true,
    trim: true
  },
  socketId: {
    type: String,
    default: ''
  },
  score: {
    type: Number,
    default: 0
  },
  rank: {
    type: Number,
    default: 0
  },
  connected: {
    type: Boolean,
    default: true
  },
  joinedAt: {
    type: Date,
    default: Date.now
  }
});

const AnswerSchema = new mongoose.Schema({
  playerId: {
    type: String,
    required: true
  },
  questionIndex: {
    type: Number,
    required: true
  },
  selectedAnswer: {
    type: Number,
    required: true
  },
  isCorrect: {
    type: Boolean,
    required: true
  },
  responseTimeMs: {
    type: Number,
    default: 0
  },
  pointsEarned: {
    type: Number,
    default: 0
  },
  totalScoreAfter: {
    type: Number,
    default: 0
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const GameSessionSchema = new mongoose.Schema(
  {
    roomCode: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quiz',
      required: true
    },
    hostId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    hostSocketId: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['LOBBY', 'QUESTION', 'ANSWER_REVEAL', 'LEADERBOARD', 'ENDED'],
      default: 'LOBBY'
    },
    currentQuestionIndex: {
      type: Number,
      default: -1
    },
    questionStartTime: {
      type: Date,
      default: null
    },
    players: [PlayerSchema],
    answers: [AnswerSchema],
    startedAt: {
      type: Date,
      default: null
    },
    endedAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('GameSession', GameSessionSchema);
