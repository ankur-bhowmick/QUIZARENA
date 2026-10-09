const express = require('express');
const router = express.Router();
const {
  getQuizzes,
  getQuizById,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  duplicateQuiz
} = require('../controllers/quizController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getQuizzes)
  .post(protect, createQuiz);

router.route('/:id')
  .get(getQuizById)
  .put(protect, updateQuiz)
  .delete(protect, deleteQuiz);

router.post('/:id/duplicate', protect, duplicateQuiz);

module.exports = router;
