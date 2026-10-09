const GameSession = require('../models/GameSession');

const generateRoomCode = async () => {
  let isUnique = false;
  let code = '';

  while (!isUnique) {
    code = Math.floor(100000 + Math.random() * 900000).toString();
    const existing = await GameSession.findOne({ roomCode: code, status: { $ne: 'ENDED' } });
    if (!existing) {
      isUnique = true;
    }
  }

  return code;
};

module.exports = { generateRoomCode };
