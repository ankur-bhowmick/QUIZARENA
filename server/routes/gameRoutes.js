const express = require('express');
const router = express.Router();
const {
  createGame,
  getGameByCode,
  getGameById,
  endGame
} = require('../controllers/gameController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createGame);
router.get('/code/:roomCode', getGameByCode);
router.get('/:id', getGameById);
router.post('/:id/end', protect, endGame);

module.exports = router;
