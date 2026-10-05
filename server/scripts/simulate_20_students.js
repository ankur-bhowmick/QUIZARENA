const io = require('socket.io-client');

const SERVER_URL = process.env.SERVER_URL || 'http://localhost:5000';
const ROOM_CODE = process.argv[2];

if (!ROOM_CODE) {
  console.log('Usage: node scripts/simulate_20_students.js <ROOM_CODE>');
  console.log('Example: node scripts/simulate_20_students.js 482731');
  process.exit(1);
}

const studentNames = [
  'Ankur', 'Rahul', 'Priya', 'Arjun', 'Sneha',
  'Karan', 'Aarav', 'Diya', 'Rohan', 'Isha',
  'Vikram', 'Ananya', 'Kabir', 'Meera', 'Aditya',
  'Tanya', 'Dev', 'Nisha', 'Yash', 'Pooja',
  'Rishi', 'Kavya', 'Siddharth', 'Bhavna', 'Manav'
];

console.log(`Starting simulation of ${studentNames.length} students joining Room ${ROOM_CODE}...`);

const sockets = [];

studentNames.forEach((nickname, idx) => {
  const socket = io(SERVER_URL, {
    transports: ['websocket'],
    forceNew: true
  });

  const playerId = `sim_${idx + 1}_${Math.random().toString(36).substring(2, 7)}`;

  socket.on('connect', () => {
    socket.emit('player:joinGame', {
      roomCode: ROOM_CODE,
      nickname,
      playerId
    });
  });

  socket.on('player:joinedSuccess', (data) => {
    console.log(`[${nickname}] Joined room ${ROOM_CODE} successfully!`);
  });

  socket.on('player:questionStarted', (qData) => {
    // Simulate thinking delay between 400ms and 5000ms
    const randomDelay = Math.floor(Math.random() * 3500) + 500;
    // Pick an answer (mostly option 1 or 2 to simulate smart + random answers)
    const selectedAnswer = Math.random() < 0.75 ? (idx % qData.optionCount) : Math.floor(Math.random() * qData.optionCount);

    setTimeout(() => {
      socket.emit('player:submitAnswer', {
        gameId: qData.gameId,
        playerId,
        selectedAnswer
      });
    }, randomDelay);
  });

  socket.on('player:questionResult', (resData) => {
    console.log(`[${nickname}] Q-Result: ${resData.isCorrect ? '✓ CORRECT' : '✗ WRONG'} | +${resData.pointsEarned} pts | Rank #${resData.rank}`);
  });

  socket.on('game:finished', (finalData) => {
    if (idx === 0) {
      console.log('\n=============================================');
      console.log('🎉 GAME FINISHED! FINAL LEADERBOARD:');
      console.log('=============================================');
      finalData.leaderboard.slice(0, 5).forEach((p) => {
        console.log(`#${p.rank} ${p.nickname} - ${p.score} pts`);
      });
      console.log('=============================================\n');
    }
    socket.disconnect();
  });

  sockets.push(socket);
});

console.log(`All ${studentNames.length} simulated student sockets created!`);
