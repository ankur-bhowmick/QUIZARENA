import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSound } from '../context/SoundContext';
import { Play, PlusCircle, LogOut, User, Volume2, VolumeX, ShieldCheck, Sparkles } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { muted, setMuted } = useSound();
  const navigate = useNavigate();

  return (
    <nav className="sticky top-0 z-50 glass-panel border-b border-white/10 bg-[#0B0F19]/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo Branding */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-cyan-500 flex items-center justify-center font-display font-black text-xl text-white shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform duration-200">
              Q
            </div>
            <div className="flex flex-col">
              <span className="font-display text-xl sm:text-2xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-cyan-400">
                QUIZ<span className="text-indigo-400">ARENA</span>
              </span>
              <span className="text-[10px] font-semibold text-indigo-400 tracking-widest uppercase -mt-1 hidden sm:block">
                Real-Time Classroom
              </span>
            </div>
          </Link>

          {/* Navigation Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            
            {/* Sound Toggle */}
            <button
              onClick={() => setMuted(!muted)}
              title={muted ? 'Unmute Sound Effects' : 'Mute Sound Effects'}
              className="p-2 sm:p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700/60"
            >
              {muted ? <VolumeX className="w-5 h-5 text-rose-400" /> : <Volume2 className="w-5 h-5 text-cyan-400" />}
            </button>

            {/* Join Game Quick Button */}
            <Link
              to="/join"
              className="flex items-center gap-2 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/25 transition-all hover:scale-105"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              <span>Join Game</span>
            </Link>

            {/* Admin Authenticated vs Guest Buttons */}
            {user ? (
              <div className="flex items-center gap-2 border-l border-slate-800 pl-2 sm:pl-4">
                <Link
                  to="/admin/dashboard"
                  className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-semibold text-sm border border-slate-700"
                >
                  <ShieldCheck className="w-4 h-4 text-indigo-400" />
                  <span>Dashboard</span>
                </Link>

                <div className="hidden lg:flex items-center gap-2 px-3 py-2 rounded-xl bg-indigo-950/50 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
                  <User className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{user.name}</span>
                </div>

                <button
                  onClick={logout}
                  title="Logout"
                  className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-rose-950/50 hover:text-rose-400 text-slate-400 transition-colors border border-slate-700"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 border-l border-slate-800 pl-2 sm:pl-4">
                <Link
                  to="/admin/login"
                  className="px-3.5 py-2 rounded-xl text-slate-300 hover:text-white font-semibold text-sm transition-colors"
                >
                  Host Login
                </Link>
                <Link
                  to="/admin/register"
                  className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition-all hover:scale-105"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Register Host</span>
                </Link>
              </div>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
}
