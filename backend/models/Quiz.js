const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: [true, 'Question text is required'],
    trim: true
  },
  questionType: {
    type: String,
    enum: ['multiple_choice', 'true_false'],
    default: 'multiple_choice'
  },
  image: {
    type: String,
    default: ''
  },
  options: {
    type: [String],
    required: true,
    validate: [
      function (val) {
        return val && val.length >= 2 && val.length <= 4;
      },
      'Questions must have between 2 and 4 options'
    ]
  },
  correctAnswer: {
    type: Number,
    required: [true, 'Correct answer index is required'],
    min: 0,
    max: 3
  },
  timer: {
    type: Number,
    default: 20,
    min: 5,
    max: 120
  },
  points: {
    type: Number,
    default: 1000,
    min: 0,
    max: 5000
  }
});

const QuizSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Quiz title is required'],
      trim: true
    },
    description: {
      type: String,
      default: '',
      trim: true
    },
    category: {
      type: String,
      default: 'General',
      trim: true
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      default: 'Medium'
    },
    visibility: {
      type: String,
      enum: ['Public', 'Private'],
      default: 'Public'
    },
    coverImage: {
      type: String,
      default: ''
    },
    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    questions: [QuestionSchema],
    playCount: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Quiz', QuizSchema);
