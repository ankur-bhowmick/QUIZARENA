import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import api from '../services/api';
import { getSocket } from '../services/socket';
import { Play, User, KeyRound, ArrowRight, Loader2, Sparkles, QrCode, Camera, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import QrScannerModal from '../components/QrScannerModal';

export default function StudentJoin() {
  const [searchParams] = useSearchParams();
  const initialCode = searchParams.get('code') || '';

  const [step, setStep] = useState(initialCode ? 2 : 1);
  const [roomCode, setRoomCode] = useState(initialCode);
  const [nickname, setNickname] = useState('');
  const [quizTitle, setQuizTitle] = useState('');
  const [gameId, setGameId] = useState('');
  const [joinedViaQr, setJoinedViaQr] = useState(Boolean(initialCode));

  const [showScanner, setShowScanner] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  // Validate Code Handler
  const handleValidateCode = async (codeToValidate = roomCode) => {
    const targetCode = typeof codeToValidate === 'string' ? codeToValidate : roomCode;
    if (!targetCode || targetCode.trim().length !== 6) {
      setError('Game code must be 6 digits.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const cleanCode = targetCode.trim();
      const res = await api.get(`/games/code/${cleanCode}`);
      setGameId(res.data._id);
      setQuizTitle(res.data.quizTitle);
      setRoomCode(cleanCode);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Game not found. Please check the code.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialCode && initialCode.length === 6) {
      handleValidateCode(initialCode);
    }
  }, [initialCode]);

  // QR Code Camera Scan Callback
  const handleQrScanned = (scannedCode) => {
    if (scannedCode && scannedCode.length === 6) {
      setJoinedViaQr(true);
      setRoomCode(scannedCode);
      handleValidateCode(scannedCode);
    } else {
      setError(`Invalid QR code (found: ${scannedCode}). Please scan a QuizArena QR code.`);
    }
  };

  // Join Game Handler
  const handleJoinGame = (e) => {
    e.preventDefault();
    if (!nickname.trim()) {
      setError('Please enter a nickname.');
      return;
    }

    const socket = getSocket();
    setError('');
    setLoading(true);

    const storedPlayerId = localStorage.getItem('quizarena_player_id') || `p_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    localStorage.setItem('quizarena_player_id', storedPlayerId);
    localStorage.setItem('quizarena_nickname', nickname.trim());

    socket.emit('player:joinGame', {
      roomCode: roomCode.trim(),
      nickname: nickname.trim(),
      playerId: storedPlayerId
    });

    const handleJoinedSuccess = (data) => {
      socket.off('player:joinedSuccess', handleJoinedSuccess);
      socket.off('player:joinError', handleJoinError);
      setLoading(false);
      navigate(`/student/game/${data.gameId}`);
    };

    const handleJoinError = (errData) => {
      socket.off('player:joinedSuccess', handleJoinedSuccess);
      socket.off('player:joinError', handleJoinError);
      setLoading(false);
      setError(errData.message || 'Failed to join game.');
    };

    socket.on('player:joinedSuccess', handleJoinedSuccess);
    socket.on('player:joinError', handleJoinError);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B0F19] px-4 py-12 relative overflow-hidden select-none">
      
      {/* Background Neon Orbs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/20 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        
        {/* Logo Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 group mb-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center font-display font-black text-2xl text-white shadow-xl shadow-indigo-500/30">
              Q
            </div>
            <span className="font-display text-3xl font-black text-white">
              QUIZ<span className="text-indigo-400">ARENA</span>
            </span>
          </Link>
          <p className="text-slate-400 text-xs font-semibold tracking-wider uppercase">
            Student Game Entry
          </p>
        </div>

        {/* Card */}
        <motion.div
          key={step}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="glass-panel p-8 rounded-3xl border border-slate-800 shadow-2xl"
        >
          
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-950/60 border border-rose-500/30 text-rose-300 text-xs font-semibold text-center">
              {error}
            </div>
          )}

          {step === 1 ? (
            /* STEP 1: ENTER ROOM CODE OR SCAN QR CODE */
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h2 className="font-display font-black text-2xl text-white">Enter Game Code</h2>
                <p className="text-slate-400 text-xs">Scan the QR code on the host screen or enter the 6-digit code</p>
              </div>

              {/* QR Scanner Trigger Button */}
              <button
                type="button"
                onClick={() => setShowScanner(true)}
                className="w-full py-3.5 rounded-2xl bg-indigo-950/80 hover:bg-indigo-900/80 border border-indigo-500/40 text-indigo-300 font-bold text-xs flex items-center justify-center gap-2 shadow-lg hover:scale-[1.01] transition-all group"
              >
                <Camera className="w-4 h-4 text-cyan-400 group-hover:rotate-12 transition-transform" />
                <span>SCAN QR CODE WITH CAMERA</span>
              </button>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-800"></div>
                <span className="flex-shrink mx-4 text-slate-500 font-bold text-[10px] uppercase tracking-widest">or enter code</span>
                <div className="flex-grow border-t border-slate-800"></div>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); handleValidateCode(); }} className="space-y-4">
                <div className="relative">
                  <KeyRound className="w-6 h-6 text-indigo-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    maxLength={6}
                    required
                    autoFocus
                    placeholder="e.g. 482731"
                    value={roomCode}
                    onChange={(e) => {
                      setRoomCode(e.target.value.replace(/\D/g, ''));
                      setError('');
                    }}
                    className="w-full pl-14 pr-4 py-4 rounded-2xl bg-slate-900 border-2 border-slate-700 text-center font-mono font-black text-2xl tracking-widest text-amber-400 placeholder:text-slate-600 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-base shadow-lg shadow-amber-500/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin text-slate-950" />
                  ) : (
                    <>
                      <span>CONTINUE</span>
                      <ArrowRight className="w-5 h-5 stroke-[3]" />
                    </>
                  )}
                </button>
              </form>
            </div>
          ) : (
            /* STEP 2: ENTER NICKNAME */
            <form onSubmit={handleJoinGame} className="space-y-6">
              
              {joinedViaQr && (
                <div className="p-3 rounded-2xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Joined via QR Code #{roomCode}</span>
                </div>
              )}

              <div className="text-center space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-950/60 px-3 py-1 rounded-full border border-indigo-500/30">
                  {quizTitle || `Room #${roomCode}`}
                </span>
                <h2 className="font-display font-black text-2xl text-white pt-2">What's your nickname?</h2>
                <p className="text-slate-400 text-xs">Enter a name so the host can identify you on the leaderboard</p>
              </div>

              <div className="relative">
                <User className="w-6 h-6 text-indigo-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  maxLength={18}
                  required
                  autoFocus
                  placeholder="e.g. Alex"
                  value={nickname}
                  onChange={(e) => {
                    setNickname(e.target.value);
                    setError('');
                  }}
                  className="w-full pl-14 pr-4 py-4 rounded-2xl bg-slate-900 border-2 border-slate-700 text-white font-bold text-xl placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
                >
                  Back
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-black text-base shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      <span>JOIN GAME NOW</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

        </motion.div>

      </div>

      {/* Camera QR Code Scanner Modal */}
      <QrScannerModal
        isOpen={showScanner}
        onClose={() => setShowScanner(false)}
        onScanSuccess={handleQrScanned}
      />
    </div>
  );
}
