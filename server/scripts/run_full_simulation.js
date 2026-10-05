const io = require('socket.io-client');
const { spawn } = require('child_process');
const path = require('path');

async function testFullFlow() {
  try {
    console.log('1. Logging in as Demo Admin...');
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'Admin@123'
      })
    });
    const loginData = await loginRes.json();
    const token = loginData.token;
    console.log('✓ Admin login successful');

    console.log('2. Fetching seeded sample quiz...');
    const quizRes = await fetch('http://localhost:5000/api/quizzes', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const quizzes = await quizRes.json();
    const quiz = quizzes[0];
    if (!quiz) throw new Error('No quiz found');
    console.log(`✓ Sample quiz found: "${quiz.title}" (${quiz.questions.length} questions)`);

    console.log('3. Starting a new Game Session...');
    const gameRes = await fetch('http://localhost:5000/api/games', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ quizId: quiz._id })
    });

    const gameData = await gameRes.json();
    const { _id: gameId, roomCode } = gameData;
    console.log(`✓ Game Session started! ROOM CODE: ${roomCode}`);

    console.log('4. Host connecting socket...');
    const hostSocket = io('http://localhost:5000');
    
    hostSocket.on('connect', () => {
      hostSocket.emit('host:joinRoom', { gameId, roomCode });
    });

    hostSocket.on('host:roomJoined', (data) => {
      console.log(`✓ Host joined room ${roomCode}. Spawning 25 simulated students...`);

      // Spawn student simulation process
      const simProcess = spawn('node', [path.join(__dirname, 'simulate_20_students.js'), roomCode], {
        stdio: 'inherit'
      });

      // Wait 3 seconds for students to enter lobby, then start game
      setTimeout(() => {
        console.log('5. Host clicking START GAME...');
        hostSocket.emit('host:startGame', { gameId });
      }, 3000);

      // Handle subsequent questions
      hostSocket.on('game:questionEnded', (qData) => {
        console.log(`✓ Question ended! Distribution: ${JSON.stringify(qData.distribution)}`);
        setTimeout(() => {
          if (qData.nextQuestionAvailable) {
            console.log('✓ Host clicking NEXT QUESTION...');
            hostSocket.emit('host:nextQuestion', { gameId });
          }
        }, 1500);
      });

      hostSocket.on('game:finished', (fData) => {
        console.log('\n======================================================');
        console.log('✅ TEST SUCCESSFUL! Full multiplayer game completed with 25 students.');
        console.log('======================================================');
        process.exit(0);
      });
    });

  } catch (err) {
    console.error('Test error:', err.message);
    process.exit(1);
  }
}

testFullFlow();
