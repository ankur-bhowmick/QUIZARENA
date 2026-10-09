import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Heart, Sparkles, Zap, Award, Globe } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-[#080B12] text-slate-400 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Brand */}
        <div className="space-y-4 md:col-span-1">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center font-display font-black text-lg text-white">
              Q
            </div>
            <span className="font-display text-xl font-bold tracking-wider text-white">
              QUIZ<span className="text-indigo-400">ARENA</span>
            </span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            The next-generation real-time classroom quiz platform built for instant student engagement, interactive lessons, and live multiplayer excitement.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="font-display font-bold text-white text-sm tracking-wider uppercase mb-4">Quick Links</h4>
          <ul className="space-y-2 text-xs">
            <li><Link to="/join" className="hover:text-indigo-400 transition-colors">Join a Game</Link></li>
            <li><Link to="/admin/login" className="hover:text-indigo-400 transition-colors">Host Login</Link></li>
            <li><Link to="/admin/register" className="hover:text-indigo-400 transition-colors">Register as Educator</Link></li>
            <li><Link to="/admin/dashboard" className="hover:text-indigo-400 transition-colors">Quiz Library</Link></li>
          </ul>
        </div>

        {/* Features */}
        <div>
          <h4 className="font-display font-bold text-white text-sm tracking-wider uppercase mb-4">Platform Features</h4>
          <ul className="space-y-2 text-xs">
            <li className="flex items-center gap-2"><Zap className="w-3.5 h-3.5 text-amber-400" /> Sub-10ms Socket.IO Sync</li>
            <li className="flex items-center gap-2"><ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Anti-Cheat Server Validation</li>
            <li className="flex items-center gap-2"><Award className="w-3.5 h-3.5 text-indigo-400" /> Speed-Based Points Engine</li>
            <li className="flex items-center gap-2"><Globe className="w-3.5 h-3.5 text-cyan-400" /> Reconnection Resiliency</li>
          </ul>
        </div>

        {/* Classroom Use Case */}
        <div>
          <h4 className="font-display font-bold text-white text-sm tracking-wider uppercase mb-4">Built for Classrooms</h4>
          <p className="text-xs text-slate-400 leading-relaxed mb-3">
            Project questions onto the big screen while students answer directly from their phones using tactile 4-color choice controls.
          </p>
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-950/60 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> 100% Free & Production Ready
          </div>
        </div>

      </div>

      <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-slate-900 flex flex-col md:flex-row items-center justify-between text-xs text-slate-400 gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
          <p>© {new Date().getFullYear()} QuizArena Platform. All rights reserved.</p>
          <span className="hidden sm:inline text-slate-700">•</span>
          <p className="font-bold text-slate-200">
            Built by <span className="text-amber-400 font-extrabold uppercase">Ankur Bhowmick</span>{' '}
            <span className="text-indigo-400 font-medium">(CS Dept. Bhairab Ganguly College)</span>
          </p>
        </div>
        <p className="flex items-center gap-1 text-slate-500">
          Made with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for interactive learning
        </p>
      </div>
    </footer>
  );
}
