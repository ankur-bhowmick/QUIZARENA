import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSocket } from '../services/socket';
import { useSound } from '../context/SoundContext';
import { CHOICE_CONFIG } from '../utils/constants';
import { CheckCircle2, XCircle, Clock, Trophy, Award, Sparkles, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function StudentGame() {
  const { gameId } = useParams();
  const navigate = useNavigate();

  const { playCorrect, playIncorrect, playTick, playVictory } = useSound();

  const [status, setStatus] = useState('LOBBY'); // LOBBY, QUESTION, ANSWER_REVEAL, LEADERBOARD, ENDED
  const [nickname, setNickname] = useState(localStorage.getItem('quizarena_nickname') || 'Player');
  const [playerId] = useState(localStorage.getItem('quizarena_player_id') || '');
  const [roomCode, setRoomCode] = useState('');

  // Question state
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [optionCount, setOptionCount] = useState(4);
  const [timerRemaining, setTimerRemaining] = useState(0);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [selectedChoiceIdx, setSelectedChoiceIdx] = useState(null);

  // Result state
  const [result, setResult] = useState(null);
  const [finalStats, setFinalStats] = useState(null);

  useEffect(() => {
    const socket = getSocket();

    // Reconnect / state restore emit
    socket.emit('player:reconnect', { gameId, playerId });

    socket.on('player:reconnectedState', (data) => {
      setRoomCode(data.roomCode);
      setStatus(data.status);
      setCurrentQIndex(data.currentQuestionIndex);
      if (data.nickname) setNickname(data.nickname);
      setHasAnswered(data.hasAnsweredCurrent);
    });

    socket.on('player:questionStarted', (data) => {
      setStatus('QUESTION');
      setCurrentQIndex(data.questionIndex);
      setTotalQuestions(data.totalQuestions);
      setOptionCount(data.optionCount || 4);
      setTimerRemaining(data.timer);
      setHasAnswered(false);
      setSelectedChoiceIdx(null);
      setResult(null);
    });

    socket.on('game:timerTick', (data) => {
      setTimerRemaining(data.remaining);
      if (data.remaining <= 3 && data.remaining > 0) {
        playTick();
      }
    });

    socket.on('player:answerConfirmed', (data) => {
      setHasAnswered(true);
      setSelectedChoiceIdx(data.selectedAnswer);
    });

    socket.on('player:questionResult', (data) => {
      setStatus('ANSWER_REVEAL');
      setResult(data);
      if (data.isCorrect) {
        playCorrect();
      } else {
        playIncorrect();
      }
    });

    socket.on('game:showLeaderboard', (data) => {
      setStatus('LEADERBOARD');
    });

    socket.on('game:finished', (data) => {
      setStatus('ENDED');
      setFinalStats(data);
      playVictory();
    });

    return () => {
      socket.off('player:reconnectedState');
      socket.off('player:questionStarted');
      socket.off('game:timerTick');
      socket.off('player:answerConfirmed');
      socket.off('player:questionResult');
      socket.off('game:showLeaderboard');
      socket.off('game:finished');
    };
  }, [gameId, playerId]);

  // Handle Answer Tap
  const handleAnswerTap = (index) => {
    if (hasAnswered || status !== 'QUESTION') return;

    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(50);
    }

    setHasAnswered(true);
    setSelectedChoiceIdx(index);

    const socket = getSocket();
    socket.emit('player:submitAnswer', {
      gameId,
      playerId,
      selectedAnswer: index
    });
  };

  // RENDER BASED ON GAME STATE
  return (
    <div className="min-h-screen bg-[#0B0F19] text-white flex flex-col justify-between p-4 max-w-md mx-auto relative overflow-hidden select-none">
      
      {/* Top Header Bar */}
      <div className="flex items-center justify-between py-2 border-b border-slate-800 text-xs text-slate-400 font-semibold mb-4">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-white font-bold">{nickname}</span>
        </div>
        {status === 'QUESTION' && (
          <div className="flex items-center gap-1 text-amber-400 font-mono font-bold text-sm bg-amber-950/60 px-3 py-1 rounded-full border border-amber-500/30">
            <Clock className="w-4 h-4" /> {timerRemaining}s
          </div>
        )}
        {result && (
          <div className="text-indigo-400 font-bold bg-indigo-950 px-2.5 py-1 rounded-lg border border-indigo-500/30">
            {result.totalScore} pts
          </div>
        )}
      </div>

      {/* STATE 1: LOBBY */}
      {status === 'LOBBY' && (
        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center shadow-2xl shadow-indigo-500/40"
          >
            <Sparkles className="w-12 h-12 text-white animate-bounce" />
          </motion.div>

          <div className="space-y-2">
            <h1 className="font-display font-black text-4xl text-white">You're in!</h1>
            <p className="text-slate-300 font-bold text-lg">{nickname}</p>
          </div>

          <div className="p-4 rounded-2xl glass-panel border border-slate-800 max-w-xs space-y-2">
            <Loader2 className="w-6 h-6 text-amber-400 animate-spin mx-auto" />
            <p className="text-xs text-slate-400 font-semibold">
              See your nickname on the host screen? Wait for the host to start the quiz!
            </p>
          </div>
        </div>
      )}

      {/* STATE 2: QUESTION (4 MASSIVE TOUCH BUTTONS ONLY - NO QUESTION TEXT ON STUDENT PHONE) */}
      {status === 'QUESTION' && (
        <div className="flex-1 flex flex-col justify-center gap-4">
          
          {hasAnswered ? (
            /* Answer Submitted Waiting Screen */
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400 flex items-center justify-center animate-pulse">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="font-display font-black text-2xl text-white">Answer Submitted!</h2>
              <p className="text-slate-400 text-xs">Waiting for timer or other players...</p>
            </div>
          ) : (
            /* 4 Colored Tactile Buttons */
            <div className="grid grid-cols-2 gap-4 aspect-square w-full">
              {Array.from({ length: optionCount }).map((_, idx) => {
                const choice = CHOICE_CONFIG[idx] || CHOICE_CONFIG[0];
                return (
                  <button
                    key={idx}
                    onClick={() => handleAnswerTap(idx)}
                    className={`choice-btn ${choice.colorClass} text-white font-black text-4xl sm:text-5xl flex flex-col items-center justify-center gap-1 active:scale-95 transition-transform`}
                  >
                    <span>{choice.symbol}</span>
                  </button>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* STATE 3: ANSWER REVEAL */}
      {status === 'ANSWER_REVEAL' && result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 flex flex-col items-center justify-center text-center space-y-6"
        >
          {result.isCorrect ? (
            <div className="w-28 h-28 rounded-full bg-emerald-600/20 border-4 border-emerald-500 text-emerald-400 flex items-center justify-center shadow-2xl shadow-emerald-500/30">
              <CheckCircle2 className="w-16 h-16" />
            </div>
          ) : (
            <div className="w-28 h-28 rounded-full bg-rose-600/20 border-4 border-rose-500 text-rose-400 flex items-center justify-center shadow-2xl shadow-rose-500/30">
              <XCircle className="w-16 h-16" />
            </div>
          )}

          <div className="space-y-2">
            <h2 className="font-display font-black text-3xl text-white">
              {result.isCorrect ? 'Correct!' : result.answered ? 'Incorrect' : 'Time\'s Up!'}
            </h2>
            <p className="text-amber-400 font-black text-2xl">
              +{result.pointsEarned} pts
            </p>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-slate-800 w-full max-w-xs space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400 font-semibold border-b border-slate-800 pb-2">
              <span>Your Score</span>
              <span className="text-white font-bold text-base">{result.totalScore}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
              <span>Current Rank</span>
              <span className="text-indigo-400 font-bold text-base">#{result.rank} of {result.totalPlayers}</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* STATE 4: LEADERBOARD WAIT */}
      {status === 'LEADERBOARD' && (
        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
          <Trophy className="w-16 h-16 text-amber-400 animate-bounce" />
          <h2 className="font-display font-black text-2xl text-white">Leaderboard Displayed</h2>
          <p className="text-slate-400 text-xs max-w-xs">Look up at the host projector screen to see current top players!</p>
        </div>
      )}

      {/* STATE 5: FINAL RESULTS */}
      {status === 'ENDED' && finalStats && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex-1 flex flex-col items-center justify-center text-center space-y-6"
        >
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-amber-500 to-amber-600 text-slate-950 flex items-center justify-center font-display font-black text-3xl shadow-2xl shadow-amber-500/40">
            <Award className="w-12 h-12" />
          </div>

          <div className="space-y-1">
            <h2 className="font-display font-black text-3xl text-white">Game Over!</h2>
            <p className="text-slate-400 text-xs">Great effort, {nickname}!</p>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-slate-800 w-full max-w-xs space-y-4">
            {result && (
              <>
                <div className="text-center border-b border-slate-800 pb-3">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Final Score</span>
                  <h3 className="font-display font-black text-3xl text-amber-400">{result.totalScore}</h3>
                </div>
                <div className="text-center">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Final Rank</span>
                  <h3 className="font-display font-black text-2xl text-indigo-400">#{result.rank}</h3>
                </div>
              </>
            )}
          </div>

          <button
            onClick={() => navigate('/join')}
            className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm"
          >
            Join Another Game
          </button>
        </motion.div>
      )}

      {/* Footer Info */}
      <div className="text-center text-[10px] text-slate-600 pt-2 font-mono">
        QuizArena Mobile Player • Room Code: {roomCode || '---'}
      </div>

    </div>
  );
}
