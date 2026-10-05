import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Play, Sparkles, Users, Tv, Smartphone, Award, ShieldCheck, ArrowRight, Zap, CheckCircle2, Camera } from 'lucide-react';
import { motion } from 'framer-motion';
import QrScannerModal from '../components/QrScannerModal';

export default function Landing() {
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [error, setError] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const navigate = useNavigate();

  const handleQuickJoin = (e) => {
    e.preventDefault();
    if (!roomCodeInput.trim() || roomCodeInput.trim().length !== 6) {
      setError('Please enter a 6-digit game code.');
      return;
    }
    navigate(`/join?code=${roomCodeInput.trim()}`);
  };

  const handleQrScanned = (code) => {
    if (code && code.length === 6) {
      navigate(`/join?code=${code}`);
    } else {
      setError(`Invalid QR code scanned: ${code}`);
    }
  };

  return (
    <div className="relative overflow-hidden bg-[#0B0F19] min-h-screen text-slate-100 pb-20 select-none">
      
      {/* Background Neon Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-indigo-600/20 via-violet-600/20 to-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* HERO SECTION */}
      <section className="relative pt-12 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        
        {/* Top Tagline & Author Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex flex-wrap items-center justify-center gap-2 sm:gap-3 px-5 py-2.5 rounded-full glass-panel border border-indigo-500/40 text-slate-200 text-xs sm:text-sm font-bold mb-8 shadow-xl shadow-indigo-950/60"
        >
          <span className="flex items-center gap-1.5 text-cyan-400">
            <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" /> Real-Time Classroom Gaming
          </span>
          <span className="text-slate-600 hidden sm:inline">•</span>
          <span className="text-white font-black tracking-wide">
            Built by <span className="text-amber-400 uppercase">ANKUR BHOWMICK</span>
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-indigo-950 text-indigo-300 text-[11px] font-semibold border border-indigo-500/30">
            CS Dept. Bhairab Ganguly College
          </span>
        </motion.div>

        {/* Hero Titles */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-display font-black text-5xl sm:text-7xl lg:text-8xl tracking-tight text-white leading-none mb-6"
        >
          Learn. Play. <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-400">Compete.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-2xl mx-auto text-lg sm:text-xl text-slate-300 font-medium leading-relaxed mb-10"
        >
          Interactive real-time quizzes for classrooms, events, and fun. Project the questions on the big screen, answer from any phone!
        </motion.p>

        {/* Quick Join Game Code Box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="max-w-md mx-auto mb-10 p-2 sm:p-3 rounded-2xl glass-panel border border-indigo-500/40 shadow-2xl shadow-indigo-950/80 space-y-2"
        >
          <form onSubmit={handleQuickJoin} className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              maxLength={6}
              placeholder="ENTER 6-DIGIT GAME CODE"
              value={roomCodeInput}
              onChange={(e) => {
                setRoomCodeInput(e.target.value.replace(/\D/g, ''));
                setError('');
              }}
              className="flex-1 px-4 py-3.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-center sm:text-left text-lg sm:text-xl font-mono font-bold tracking-widest text-amber-400 placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
            />
            <button
              type="submit"
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-base shadow-lg shadow-amber-500/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
            >
              <Play className="w-5 h-5 fill-slate-950" />
              <span>JOIN</span>
            </button>
          </form>

          <button
            onClick={() => setShowScanner(true)}
            className="w-full py-2.5 rounded-xl bg-indigo-950/80 hover:bg-indigo-900/80 text-cyan-300 font-bold text-xs flex items-center justify-center gap-2 border border-indigo-500/30 transition-all"
          >
            <Camera className="w-4 h-4 text-cyan-400" />
            <span>Scan QR Code with Camera</span>
          </button>

          {error && <p className="text-rose-400 text-xs font-semibold mt-2 text-center">{error}</p>}
        </motion.div>

        {/* Camera QR Scanner Modal */}
        <QrScannerModal
          isOpen={showScanner}
          onClose={() => setShowScanner(false)}
          onScanSuccess={handleQrScanned}
        />

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-wrap items-center justify-center gap-4"
        >
          <Link
            to="/admin/dashboard"
            className="px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-black text-lg shadow-xl shadow-indigo-600/30 flex items-center gap-3 transition-all hover:scale-105"
          >
            <Tv className="w-6 h-6" />
            <span>Host a Quiz</span>
          </Link>

          <Link
            to="/join"
            className="px-8 py-4 rounded-2xl glass-panel-interactive text-slate-200 hover:text-white font-bold text-lg flex items-center gap-3"
          >
            <Smartphone className="w-6 h-6 text-cyan-400" />
            <span>Join a Game</span>
          </Link>
        </motion.div>

      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-display font-black text-3xl sm:text-5xl text-white mb-4">
            How QuizArena Works
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto text-base sm:text-lg">
            3 simple steps to transform any room into an electric game show experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Step 1 */}
          <div className="p-8 rounded-3xl glass-panel border border-slate-800 relative group hover:border-indigo-500/50 transition-all">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center font-display font-black text-2xl mb-6">
              1
            </div>
            <h3 className="font-display font-bold text-2xl text-white mb-3 flex items-center gap-2">
              <Tv className="w-6 h-6 text-indigo-400" /> Host Projects Question
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Teacher launches the game code on a projector or TV screen. The question and options are visible to the whole classroom.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-8 rounded-3xl glass-panel border border-slate-800 relative group hover:border-violet-500/50 transition-all">
            <div className="w-14 h-14 rounded-2xl bg-violet-600/20 border border-violet-500/40 text-violet-400 flex items-center justify-center font-display font-black text-2xl mb-6">
              2
            </div>
            <h3 className="font-display font-bold text-2xl text-white mb-3 flex items-center gap-2">
              <Smartphone className="w-6 h-6 text-violet-400" /> Students Join on Phone
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              No account creation needed! Students open <code className="text-amber-400 bg-slate-900 px-1.5 py-0.5 rounded font-mono">/join</code>, enter the 6-digit code, and type their nickname.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-8 rounded-3xl glass-panel border border-slate-800 relative group hover:border-cyan-500/50 transition-all">
            <div className="w-14 h-14 rounded-2xl bg-cyan-600/20 border border-cyan-500/40 text-cyan-400 flex items-center justify-center font-display font-black text-2xl mb-6">
              3
            </div>
            <h3 className="font-display font-bold text-2xl text-white mb-3 flex items-center gap-2">
              <Zap className="w-6 h-6 text-cyan-400" /> Tap 4 Colored Controls
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Student phones show ONLY four large color & symbol buttons (Red ▲, Blue ◆, Yellow ●, Green ■). Fast correct answers earn top points!
            </p>
          </div>

        </div>
      </section>

      {/* VISUAL GAMEPLAY SHOWCASE */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 shadow-2xl relative overflow-hidden">
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">Classroom Experience</span>
              <h3 className="font-display font-black text-3xl sm:text-4xl text-white mt-1">Dual-Screen Synchronization</h3>
            </div>
            <div className="flex items-center gap-2 bg-emerald-950/60 border border-emerald-500/30 px-4 py-2 rounded-xl text-emerald-400 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4" /> Live Socket.IO Engine
            </div>
          </div>

          {/* Mockup split screen */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            
            {/* Host Screen Preview (8 cols) */}
            <div className="lg:col-span-7 p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-3">
                <span className="font-mono font-bold text-indigo-400">HOST PROJECTOR VIEW</span>
                <span className="font-bold text-amber-400">QUESTION 3 / 15</span>
              </div>
              <h4 className="font-display font-extrabold text-xl text-white leading-snug">
                "Which planet in our solar system is known as the Red Planet?"
              </h4>
              <div className="grid grid-cols-2 gap-3 text-xs font-bold">
                <div className="p-3 rounded-xl bg-rose-900/40 border border-rose-500/30 text-rose-200">▲ A. Venus</div>
                <div className="p-3 rounded-xl bg-blue-900/40 border border-blue-500/30 text-blue-200">◆ B. Mars</div>
                <div className="p-3 rounded-xl bg-amber-900/40 border border-amber-500/30 text-amber-200">● C. Jupiter</div>
                <div className="p-3 rounded-xl bg-emerald-900/40 border border-emerald-500/30 text-emerald-200">■ D. Saturn</div>
              </div>
            </div>

            {/* Student Phone Preview (5 cols) */}
            <div className="lg:col-span-5 p-6 rounded-3xl bg-slate-900 border-2 border-indigo-500/40 shadow-xl max-w-xs mx-auto w-full">
              <div className="text-center mb-4">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Student Phone Display</span>
                <p className="text-xs font-black text-amber-400">TAP YOUR ANSWER</p>
              </div>
              <div className="grid grid-cols-2 gap-3 aspect-square">
                <div className="choice-btn choice-red text-white text-2xl font-black">▲</div>
                <div className="choice-btn choice-blue text-white text-2xl font-black">◆</div>
                <div className="choice-btn choice-yellow text-white text-2xl font-black">●</div>
                <div className="choice-btn choice-green text-white text-2xl font-black">■</div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* PLATFORM FEATURES */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-display font-black text-3xl sm:text-4xl text-white mb-3">
            Engineered for Modern Classrooms
          </h2>
          <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto">
            Everything educators need for fast-paced, competitive learning sessions.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="p-6 rounded-2xl glass-panel border border-slate-800">
            <Zap className="w-8 h-8 text-amber-400 mb-4" />
            <h4 className="font-display font-bold text-lg text-white mb-2">Speed Bonus Points</h4>
            <p className="text-slate-400 text-xs leading-relaxed">
              Calculates point awards based on millisecond response times. Fast correct answers dominate the leaderboard!
            </p>
          </div>

          <div className="p-6 rounded-2xl glass-panel border border-slate-800">
            <ShieldCheck className="w-8 h-8 text-emerald-400 mb-4" />
            <h4 className="font-display font-bold text-lg text-white mb-2">Anti-Cheat Engine</h4>
            <p className="text-slate-400 text-xs leading-relaxed">
              All question logic, answer validation, and score updates strictly executed on the server. Zero client tampering.
            </p>
          </div>

          <div className="p-6 rounded-2xl glass-panel border border-slate-800">
            <Award className="w-8 h-8 text-indigo-400 mb-4" />
            <h4 className="font-display font-bold text-lg text-white mb-2">Animated Leaderboard</h4>
            <p className="text-slate-400 text-xs leading-relaxed">
              Show dynamic rank changes after every question and end with a grand Gold, Silver, Bronze podium reveal.
            </p>
          </div>

          <div className="p-6 rounded-2xl glass-panel border border-slate-800">
            <Users className="w-8 h-8 text-cyan-400 mb-4" />
            <h4 className="font-display font-bold text-lg text-white mb-2">Seamless Reconnection</h4>
            <p className="text-slate-400 text-xs leading-relaxed">
              Temporary mobile disconnects automatically recover without losing player scores or creating duplicate entries.
            </p>
          </div>

        </div>
      </section>

    </div>
  );
}
