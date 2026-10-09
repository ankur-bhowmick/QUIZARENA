const Quiz = require('../models/Quiz');

// @desc    Get all quizzes (filtered by search/category or owned by logged in admin)
// @route   GET /api/quizzes
// @access  Private
const getQuizzes = async (req, res, next) => {
  try {
    const { search, category, difficulty } = req.query;
    let query = { creatorId: req.user._id };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    if (difficulty && difficulty !== 'All') {
      query.difficulty = difficulty;
    }

    const quizzes = await Quiz.find(query).sort({ updatedAt: -1 });
    res.json(quizzes);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single quiz by ID
// @route   GET /api/quizzes/:id
// @access  Public / Private
const getQuizById = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    res.json(quiz);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new quiz
// @route   POST /api/quizzes
// @access  Private
const createQuiz = async (req, res, next) => {
  try {
    const { title, description, category, difficulty, visibility, coverImage, questions } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Quiz title is required' });
    }

    const quiz = new Quiz({
      title,
      description: description || '',
      category: category || 'General',
      difficulty: difficulty || 'Medium',
      visibility: visibility || 'Public',
      coverImage: coverImage || '',
      creatorId: req.user._id,
      questions: questions || []
    });

    const createdQuiz = await quiz.save();
    res.status(201).json(createdQuiz);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a quiz
// @route   PUT /api/quizzes/:id
// @access  Private
const updateQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Check ownership
    if (quiz.creatorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this quiz' });
    }

    const { title, description, category, difficulty, visibility, coverImage, questions } = req.body;

    quiz.title = title !== undefined ? title : quiz.title;
    quiz.description = description !== undefined ? description : quiz.description;
    quiz.category = category !== undefined ? category : quiz.category;
    quiz.difficulty = difficulty !== undefined ? difficulty : quiz.difficulty;
    quiz.visibility = visibility !== undefined ? visibility : quiz.visibility;
    quiz.coverImage = coverImage !== undefined ? coverImage : quiz.coverImage;
    if (questions) {
      quiz.questions = questions;
    }

    const updatedQuiz = await quiz.save();
    res.json(updatedQuiz);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a quiz
// @route   DELETE /api/quizzes/:id
// @access  Private
const deleteQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    if (quiz.creatorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this quiz' });
    }

    await quiz.deleteOne();
    res.json({ message: 'Quiz deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Duplicate a quiz
// @route   POST /api/quizzes/:id/duplicate
// @access  Private
const duplicateQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    const duplicatedQuiz = new Quiz({
      title: `${quiz.title} (Copy)`,
      description: quiz.description,
      category: quiz.category,
      difficulty: quiz.difficulty,
      visibility: quiz.visibility,
      coverImage: quiz.coverImage,
      creatorId: req.user._id,
      questions: quiz.questions
    });

    const savedQuiz = await duplicatedQuiz.save();
    res.status(201).json(savedQuiz);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getQuizzes,
  getQuizById,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  duplicateQuiz
};
