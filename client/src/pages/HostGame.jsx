import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { getSocket } from '../services/socket';
import { CHOICE_CONFIG } from '../utils/constants';
import confetti from 'canvas-confetti';
import { QRCodeSVG } from 'qrcode.react';
import {
  Play,
  ArrowRight,
  Clock,
  Users,
  Trophy,
  Award,
  BarChart2,
  Sparkles,
  HelpCircle,
  Home,
  Loader2,
  Tv,
  QrCode,
  X,
  Maximize2,
  Smartphone,
  Copy,
  Check,
  Download,
  Share2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function HostGame() {
  const { gameId } = useParams();
  const navigate = useNavigate();

  const [game, setGame] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [status, setStatus] = useState('LOBBY'); // LOBBY, QUESTION, ANSWER_REVEAL, LEADERBOARD, ENDED

  // QR Code Modal State
  const [showQrModal, setShowQrModal] = useState(false);

  // Roster & active stats
  const [players, setPlayers] = useState([]);
  const [playerCount, setPlayerCount] = useState(0);

  // Question & Timer
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [timerRemaining, setTimerRemaining] = useState(0);
  const [answersCount, setAnswersCount] = useState(0);

  // Results & Leaderboard
  const [revealData, setRevealData] = useState(null); // distribution, correctAnswer
  const [topPlayers, setTopPlayers] = useState([]);
  const [finalPodium, setFinalPodium] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [copied, setCopied] = useState(false);

  // Compute join URL for QR code
  const joinUrl = typeof window !== 'undefined' && game?.roomCode
    ? `${window.location.origin}/join?code=${game.roomCode}`
    : '';

  const handleCopyLink = () => {
    if (!joinUrl) return;
    navigator.clipboard.writeText(joinUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadQr = (svgId = 'host-qr-svg') => {
    const svgElement = document.getElementById(svgId);
    if (!svgElement) return;

    try {
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const URL = window.URL || window.webkitURL || window;
      const blobURL = URL.createObjectURL(svgBlob);

      const image = new Image();
      image.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 1000;
        canvas.height = 1000;
        const context = canvas.getContext('2d');
        context.fillStyle = '#FFFFFF';
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.drawImage(image, 50, 50, 900, 900);
        const png = canvas.toDataURL('image/png');

        const downloadLink = document.createElement('a');
        downloadLink.href = png;
        downloadLink.download = `QuizArena-Room-${game.roomCode}-QR.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      };
      image.src = blobURL;
    } catch (e) {
      console.error('Failed to download QR code', e);
    }
  };

  // Fetch Game Session Details & Setup Socket
  useEffect(() => {
    const fetchGame = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/games/${gameId}`);
        const session = res.data;
        setGame(session);
        setQuiz(session.quizId);
        setStatus(session.status);
        setPlayers(session.players || []);
        setPlayerCount(session.players ? session.players.filter(p => p.connected).length : 0);
        setError('');

        // Socket Join as Host
        const socket = getSocket();
        socket.emit('host:joinRoom', { gameId: session._id, roomCode: session.roomCode });
      } catch (err) {
        setError('Failed to load game session details.');
      } finally {
        setLoading(false);
      }
    };

    fetchGame();
  }, [gameId]);

  // Socket Listeners
  useEffect(() => {
    const socket = getSocket();

    socket.on('host:roomJoined', (data) => {
      setStatus(data.status);
      setPlayers(data.players || []);
      setPlayerCount(data.players ? data.players.filter(p => p.connected).length : 0);
    });

    socket.on('game:playerJoined', (data) => {
      setPlayerCount(data.playerCount);
      setPlayers(data.players || []);
    });

    socket.on('game:questionStarted', (data) => {
      setStatus('QUESTION');
      setCurrentQuestionIndex(data.questionIndex);
      setCurrentQuestion(data);
      setTimerRemaining(data.timer);
      setAnswersCount(0);
      setRevealData(null);
      setShowQrModal(false);
    });

    socket.on('game:timerTick', (data) => {
      setTimerRemaining(data.remaining);
    });

    socket.on('game:answerReceived', (data) => {
      setAnswersCount(data.answersCount);
    });

    socket.on('game:questionEnded', (data) => {
      setStatus('ANSWER_REVEAL');
      setRevealData(data);
    });

    socket.on('game:showLeaderboard', (data) => {
      setStatus('LEADERBOARD');
      setTopPlayers(data.topPlayers || []);
    });

    socket.on('game:finished', (data) => {
      setStatus('ENDED');
      setFinalPodium(data.podium);
      setTopPlayers(data.leaderboard || []);

      try {
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 }
        });
      } catch (e) {}
    });

    return () => {
      socket.off('host:roomJoined');
      socket.off('game:playerJoined');
      socket.off('game:questionStarted');
      socket.off('game:timerTick');
      socket.off('game:answerReceived');
      socket.off('game:questionEnded');
      socket.off('game:showLeaderboard');
      socket.off('game:finished');
    };
  }, [gameId]);

  // Host Action: Start Game
  const handleStartGame = () => {
    const socket = getSocket();
    socket.emit('host:startGame', { gameId });
  };

  // Host Action: Next Question
  const handleNextQuestion = () => {
    const socket = getSocket();
    socket.emit('host:nextQuestion', { gameId });
  };

  // Host Action: Show Leaderboard
  const handleShowLeaderboard = () => {
    const socket = getSocket();
    socket.emit('host:showLeaderboard', { gameId });
  };

  // Host Action: End Game
  const handleEndGame = async () => {
    try {
      await api.post(`/games/${gameId}/end`);
      navigate('/admin/dashboard');
    } catch (err) {
      navigate('/admin/dashboard');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B0F19]">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B0F19] text-center p-4">
        <div className="glass-panel p-8 rounded-3xl max-w-md space-y-4">
          <p className="text-rose-400 font-bold">{error || 'Game session not found'}</p>
          <button onClick={() => navigate('/admin/dashboard')} className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs">
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col justify-between p-4 sm:p-8 relative overflow-hidden select-none">
      
      {/* Background Neon Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-to-tr from-indigo-600/15 via-violet-600/15 to-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />

      {/* TOP HEADER: ROOM CODE, QUIZ TITLE & QR CODE TRIGGER */}
      <header className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-800/80 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center font-display font-black text-xl text-white">
            Q
          </div>
          <div>
            <h2 className="font-display font-black text-xl text-white">
              {quiz?.title || 'Quiz Session'}
            </h2>
            <p className="text-slate-400 text-xs font-semibold">
              Host Projection View
            </p>
          </div>
        </div>

        {/* Room Code & Quick QR Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowQrModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-indigo-950/80 hover:bg-indigo-900/80 text-indigo-300 font-bold text-xs border border-indigo-500/30 transition-all hover:scale-105 shadow-lg"
            title="Enlarge QR Code"
          >
            <QrCode className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">Show QR Code</span>
          </button>

          <div className="flex items-center gap-4 bg-slate-900/90 border border-slate-700/80 px-6 py-3 rounded-2xl shadow-xl">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Join at <span className="text-cyan-400 font-mono font-bold lowercase">/join</span> Code:
            </span>
            <span className="font-mono font-black text-3xl text-amber-400 tracking-widest">
              {game.roomCode}
            </span>
          </div>
        </div>
      </header>

      {/* MAIN VIEW CONTENT AREA */}
      <main className="flex-1 flex flex-col justify-center py-6 z-10">
        
        {/* ======================================================== */}
        {/* VIEW 1: LOBBY WITH PROMINENT QR CODE */}
        {/* ======================================================== */}
        {status === 'LOBBY' && (
          <div className="space-y-8 text-center max-w-5xl mx-auto w-full">
            <div className="space-y-2">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-950/80 border border-indigo-500/30 text-indigo-300 text-xs font-bold">
                <Tv className="w-4 h-4 text-cyan-400" /> Scan QR Code or enter code on your mobile device
              </span>
              <h1 className="font-display font-black text-4xl sm:text-6xl text-white">
                Game Code: <span className="text-amber-400 font-mono tracking-widest">{game.roomCode}</span>
              </h1>
            </div>

            {/* QR CODE & JOIN BANNER */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center max-w-4xl mx-auto">
              
              {/* QR Code Display Card */}
              <div className="md:col-span-5 p-6 rounded-3xl glass-panel border border-indigo-500/30 flex flex-col items-center justify-center space-y-4 shadow-2xl shadow-indigo-950/60 relative group">
                <div className="bg-white p-4 rounded-2xl shadow-2xl transition-transform group-hover:scale-105 duration-300">
                  {joinUrl && (
                    <QRCodeSVG
                      id="host-qr-svg"
                      value={joinUrl}
                      size={190}
                      bgColor="#FFFFFF"
                      fgColor="#0B0F19"
                      level="H"
                      includeMargin={false}
                    />
                  )}
                </div>

                <div className="text-center space-y-1 w-full">
                  <span className="text-xs font-bold text-slate-200 flex items-center justify-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-cyan-400" /> Scan QR Code with Phone Camera
                  </span>
                  <p className="text-[10px] text-slate-400 font-mono truncate px-2">{joinUrl}</p>
                </div>

                {/* QR Quick Actions */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={handleCopyLink}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-bold flex items-center gap-1 border border-slate-700 transition-colors"
                    title="Copy Join Link"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-cyan-400" />}
                    <span>{copied ? 'Copied!' : 'Copy Link'}</span>
                  </button>

                  <button
                    onClick={() => handleDownloadQr('host-qr-svg')}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-bold flex items-center gap-1 border border-slate-700 transition-colors"
                    title="Save QR Code Image"
                  >
                    <Download className="w-3.5 h-3.5 text-amber-400" />
                    <span>Save QR</span>
                  </button>

                  <button
                    onClick={() => setShowQrModal(true)}
                    className="px-3 py-1.5 rounded-xl bg-indigo-950 hover:bg-indigo-900 text-indigo-300 text-xs font-bold flex items-center gap-1 border border-indigo-500/30 transition-colors"
                    title="Enlarge QR Code"
                  >
                    <Maximize2 className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Enlarge</span>
                  </button>
                </div>
              </div>

              {/* Joined Players Counter & Start Button */}
              <div className="md:col-span-7 flex flex-col justify-center space-y-6 text-left">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 font-display font-bold text-2xl text-white">
                    <Users className="w-7 h-7 text-indigo-400" />
                    <span>Joined Players ({playerCount})</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Students will appear live below as they scan the QR code or enter code <span className="text-amber-400 font-mono font-bold">{game.roomCode}</span>.
                  </p>
                </div>

                {playerCount > 0 ? (
                  <button
                    onClick={handleStartGame}
                    className="w-full sm:w-auto px-10 py-5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xl shadow-2xl shadow-amber-500/30 flex items-center justify-center gap-3 transition-all hover:scale-105"
                  >
                    <Play className="w-7 h-7 fill-slate-950" />
                    <span>START GAME NOW</span>
                  </button>
                ) : (
                  <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-slate-400 text-xs font-medium">
                    Waiting for the first student to scan QR or enter game code...
                  </div>
                )}
              </div>

            </div>

            {/* Roster Cards Grid */}
            {players.length > 0 && (
              <div className="pt-4 border-t border-slate-800/80">
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 max-h-64 overflow-y-auto p-2">
                  {players.map((p, idx) => (
                    <motion.div
                      key={p.playerId || idx}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-slate-200 font-bold text-sm text-center truncate shadow-md flex items-center justify-center gap-2"
                    >
                      <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                      <span className="truncate">{p.nickname}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW 2: QUESTION */}
        {/* ======================================================== */}
        {status === 'QUESTION' && currentQuestion && (
          <div className="max-w-5xl mx-auto w-full space-y-6">
            
            {/* Top Question Header & Timer */}
            <div className="flex items-center justify-between text-slate-400 font-bold text-sm">
              <span className="bg-indigo-950 px-4 py-1.5 rounded-xl border border-indigo-500/30 text-indigo-300">
                QUESTION {currentQuestionIndex + 1} / {quiz?.questions?.length || currentQuestion.totalQuestions}
              </span>

              <div className="flex items-center gap-2 bg-amber-950/80 px-5 py-2 rounded-2xl border border-amber-500/40 text-amber-400 font-mono font-black text-xl shadow-lg">
                <Clock className="w-6 h-6 animate-pulse" /> {timerRemaining}s
              </div>

              <span className="bg-slate-900 px-4 py-1.5 rounded-xl border border-slate-800 text-slate-300">
                Answers: {answersCount} / {playerCount}
              </span>
            </div>

            {/* Question Card */}
            <div className="p-8 rounded-3xl glass-panel border border-slate-800 text-center space-y-4 shadow-2xl">
              <h2 className="font-display font-black text-2xl sm:text-4xl text-white leading-tight">
                {currentQuestion.questionText}
              </h2>

              {currentQuestion.image && (
                <img
                  src={currentQuestion.image}
                  alt="Question Visual"
                  className="max-h-64 mx-auto rounded-2xl border border-slate-700 object-cover shadow-lg"
                />
              )}
            </div>

            {/* 4 Answer Choice Options Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {currentQuestion.options.map((optText, idx) => {
                const choice = CHOICE_CONFIG[idx] || CHOICE_CONFIG[0];
                return (
                  <div
                    key={idx}
                    className={`p-5 rounded-2xl ${choice.colorClass} text-white font-bold text-lg flex items-center gap-4 shadow-lg border border-white/20`}
                  >
                    <span className="w-10 h-10 rounded-xl bg-black/20 font-black text-xl flex items-center justify-center shrink-0">
                      {choice.symbol}
                    </span>
                    <span className="text-white text-base sm:text-lg leading-snug">{optText}</span>
                  </div>
                );
              })}
            </div>

          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW 3: ANSWER REVEAL */}
        {/* ======================================================== */}
        {status === 'ANSWER_REVEAL' && currentQuestion && revealData && (
          <div className="max-w-4xl mx-auto w-full space-y-6 text-center">
            
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
                Question Completed
              </span>
              <h2 className="font-display font-black text-3xl text-white">Answer Distribution</h2>
            </div>

            {/* Distribution Bar Chart */}
            <div className="p-8 rounded-3xl glass-panel border border-slate-800 space-y-6">
              <div className="grid grid-cols-4 gap-4 items-end h-64 border-b border-slate-800 pb-4">
                {currentQuestion.options.map((optText, idx) => {
                  const choice = CHOICE_CONFIG[idx] || CHOICE_CONFIG[0];
                  const count = revealData.distribution[idx] || 0;
                  const isCorrect = revealData.correctAnswer === idx;
                  const maxCount = Math.max(...revealData.distribution, 1);
                  const heightPercent = Math.round((count / maxCount) * 100);

                  return (
                    <div key={idx} className="flex flex-col items-center gap-2 h-full justify-end">
                      <span className="font-mono font-black text-white text-base">{count}</span>

                      {/* Bar */}
                      <div className="w-full max-w-[60px] bg-slate-900 rounded-t-xl overflow-hidden flex flex-col justify-end border border-slate-800" style={{ height: '80%' }}>
                        <div
                          className={`w-full transition-all duration-500 ${choice.colorClass} ${isCorrect ? 'ring-4 ring-emerald-400' : 'opacity-60'}`}
                          style={{ height: `${Math.max(15, heightPercent)}%` }}
                        />
                      </div>

                      <div className="flex items-center gap-1 text-xs font-bold text-slate-300 mt-2">
                        <span className={`w-5 h-5 rounded-md ${choice.colorClass} flex items-center justify-center text-white text-xs`}>
                          {choice.symbol}
                        </span>
                        {isCorrect && <span className="text-emerald-400 font-bold">✓</span>}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Correct Answer Highlight */}
              <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-bold text-base flex items-center justify-center gap-2">
                <span>Correct Answer:</span>
                <span className="font-black text-white underline">
                  {currentQuestion.options[revealData.correctAnswer]}
                </span>
              </div>
            </div>

            {/* Next Control */}
            <div className="flex justify-center gap-4">
              <button
                onClick={handleShowLeaderboard}
                className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-black text-base shadow-xl shadow-indigo-600/30 flex items-center gap-2"
              >
                <Trophy className="w-5 h-5" />
                <span>Show Leaderboard</span>
              </button>

              <button
                onClick={handleNextQuestion}
                className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-base shadow-xl shadow-amber-500/30 flex items-center gap-2"
              >
                <span>Next Question</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>

          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW 4: LEADERBOARD */}
        {/* ======================================================== */}
        {status === 'LEADERBOARD' && (
          <div className="max-w-2xl mx-auto w-full space-y-6 text-center">
            
            <div className="space-y-1">
              <Trophy className="w-12 h-12 text-amber-400 mx-auto animate-bounce" />
              <h2 className="font-display font-black text-4xl text-white">Leaderboard</h2>
            </div>

            {/* Top 5 Rankings */}
            <div className="space-y-3">
              {topPlayers.map((player, idx) => (
                <motion.div
                  key={player.playerId || idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${
                    idx === 0 ? 'bg-amber-950/80 border-amber-500/50 shadow-xl shadow-amber-950/40' :
                    idx === 1 ? 'bg-slate-800/90 border-slate-600' :
                    idx === 2 ? 'bg-amber-900/40 border-amber-700/40' :
                    'bg-slate-900/60 border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className={`w-9 h-9 rounded-xl font-display font-black text-base flex items-center justify-center ${
                      idx === 0 ? 'bg-amber-400 text-slate-950' :
                      idx === 1 ? 'bg-slate-300 text-slate-950' :
                      idx === 2 ? 'bg-amber-700 text-white' :
                      'bg-slate-800 text-slate-400'
                    }`}>
                      #{idx + 1}
                    </span>
                    <span className="font-display font-bold text-xl text-white">{player.nickname}</span>
                  </div>

                  <span className="font-mono font-black text-2xl text-amber-400">{player.score} pts</span>
                </motion.div>
              ))}
            </div>

            <button
              onClick={handleNextQuestion}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-base shadow-xl shadow-amber-500/30 inline-flex items-center gap-2"
            >
              <span>Next Question</span>
              <ArrowRight className="w-5 h-5" />
            </button>

          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW 5: FINAL RESULTS / PODIUM */}
        {/* ======================================================== */}
        {status === 'ENDED' && (
          <div className="max-w-4xl mx-auto w-full space-y-8 text-center">
            
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">Game Over</span>
              <h1 className="font-display font-black text-5xl text-white">Grand Champions!</h1>
            </div>

            {/* Podium Display (2nd, 1st, 3rd) */}
            {finalPodium && (
              <div className="flex items-end justify-center gap-4 pt-8">
                
                {/* 2nd Place */}
                {finalPodium.second && (
                  <div className="flex flex-col items-center space-y-2">
                    <div className="p-3 rounded-2xl bg-slate-800 border border-slate-600 text-slate-200 font-bold text-sm w-36 text-center shadow-lg">
                      <span className="text-xs text-slate-400 block">🥈 2nd Place</span>
                      <p className="font-black text-lg text-white truncate">{finalPodium.second.nickname}</p>
                      <p className="font-mono text-xs text-amber-400 font-bold">{finalPodium.second.score} pts</p>
                    </div>
                    <div className="w-36 h-28 bg-slate-800/80 rounded-t-2xl border-t border-slate-600" />
                  </div>
                )}

                {/* 1st Place */}
                {finalPodium.first && (
                  <div className="flex flex-col items-center space-y-2 -mt-6">
                    <div className="p-4 rounded-2xl bg-amber-950 border-2 border-amber-400 text-amber-300 font-bold text-base w-44 text-center shadow-2xl shadow-amber-500/30">
                      <span className="text-xs font-black text-amber-400 uppercase tracking-widest block">🥇 CHAMPION</span>
                      <p className="font-black text-2xl text-white truncate">{finalPodium.first.nickname}</p>
                      <p className="font-mono text-sm text-amber-400 font-black">{finalPodium.first.score} pts</p>
                    </div>
                    <div className="w-44 h-40 bg-gradient-to-t from-amber-600 to-amber-500 rounded-t-2xl shadow-2xl" />
                  </div>
                )}

                {/* 3rd Place */}
                {finalPodium.third && (
                  <div className="flex flex-col items-center space-y-2">
                    <div className="p-3 rounded-2xl bg-amber-950/60 border border-amber-700/50 text-amber-200 font-bold text-sm w-36 text-center shadow-lg">
                      <span className="text-xs text-amber-500 block">🥉 3rd Place</span>
                      <p className="font-black text-lg text-white truncate">{finalPodium.third.nickname}</p>
                      <p className="font-mono text-xs text-amber-400 font-bold">{finalPodium.third.score} pts</p>
                    </div>
                    <div className="w-36 h-20 bg-amber-900/60 rounded-t-2xl border-t border-amber-800" />
                  </div>
                )}

              </div>
            )}

            <div className="pt-6">
              <button
                onClick={handleEndGame}
                className="px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-base shadow-xl inline-flex items-center gap-2"
              >
                <Home className="w-5 h-5" />
                <span>Return to Dashboard</span>
              </button>
            </div>

          </div>
        )}

      </main>

      {/* ENLARGED QR CODE POPUP MODAL */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 select-none">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass-panel p-8 rounded-3xl max-w-md w-full border border-indigo-500/40 text-center space-y-6 shadow-2xl relative"
          >
            <button
              onClick={() => setShowQrModal(false)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest bg-cyan-950/60 px-3 py-1 rounded-full border border-cyan-500/30 inline-block">
                Projector View Scan Mode
              </span>
              <h3 className="font-display font-black text-3xl text-white pt-1">
                Room Code: <span className="text-amber-400 font-mono tracking-wider">{game.roomCode}</span>
              </h3>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-2xl inline-block mx-auto">
              {joinUrl && (
                <QRCodeSVG
                  id="modal-qr-svg"
                  value={joinUrl}
                  size={260}
                  bgColor="#FFFFFF"
                  fgColor="#0B0F19"
                  level="H"
                  includeMargin={false}
                />
              )}
            </div>

            <div className="space-y-2">
              <p className="text-xs text-slate-300 font-bold flex items-center justify-center gap-1.5">
                <Smartphone className="w-4 h-4 text-cyan-400" /> Open phone camera or scan using QuizArena Scanner
              </p>
              <p className="text-[11px] text-slate-400 font-mono bg-slate-900/90 py-1.5 px-3 rounded-xl border border-slate-800 truncate">
                {joinUrl}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleCopyLink}
                className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-cyan-400" />}
                <span>{copied ? 'Copied Link!' : 'Copy Link'}</span>
              </button>

              <button
                onClick={() => handleDownloadQr('modal-qr-svg')}
                className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Download className="w-4 h-4 text-amber-400" />
                <span>Save PNG</span>
              </button>
            </div>

            <button
              onClick={() => setShowQrModal(false)}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold text-xs shadow-lg"
            >
              Back to Game View
            </button>
          </motion.div>
        </div>
      )}

    </div>
  );
}
