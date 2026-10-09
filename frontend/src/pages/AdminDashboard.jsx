import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Plus,
  Play,
  Edit,
  Copy,
  Trash2,
  Search,
  Filter,
  BarChart3,
  HelpCircle,
  Gamepad2,
  Calendar,
  Layers,
  Sparkles,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { CATEGORIES } from '../utils/constants';

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');

  // Delete modal state
  const [deleteQuizId, setDeleteQuizId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Host launching state
  const [launchingId, setLaunchingId] = useState(null);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (selectedCategory !== 'All') params.category = selectedCategory;
      if (selectedDifficulty !== 'All') params.difficulty = selectedDifficulty;

      const res = await api.get('/quizzes', { params });
      setQuizzes(res.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch quizzes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, [search, selectedCategory, selectedDifficulty]);

  // Host/Start Game
  const handleStartGame = async (quizId) => {
    try {
      setLaunchingId(quizId);
      const res = await api.post('/games', { quizId });
      const { _id: gameId } = res.data;
      navigate(`/host/game/${gameId}`);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to start game session');
    } finally {
      setLaunchingId(null);
    }
  };

  // Duplicate Quiz
  const handleDuplicate = async (quizId) => {
    try {
      await api.post(`/quizzes/${quizId}/duplicate`);
      fetchQuizzes();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to duplicate quiz');
    }
  };

  // Delete Quiz
  const handleDeleteConfirm = async () => {
    if (!deleteQuizId) return;
    try {
      setDeleting(true);
      await api.delete(`/quizzes/${deleteQuizId}`);
      setDeleteQuizId(null);
      fetchQuizzes();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete quiz');
    } finally {
      setDeleting(false);
    }
  };

  // Computed Metrics
  const totalQuizzes = quizzes.length;
  const totalQuestions = quizzes.reduce((sum, q) => sum + (q.questions?.length || 0), 0);
  const totalGamesPlayed = quizzes.reduce((sum, q) => sum + (q.playCount || 0), 0);

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pt-8">
      
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" /> Educator Control Center
          </div>
          <h1 className="font-display font-black text-3xl sm:text-4xl text-white">
            Welcome back, {user?.name || 'Educator'}!
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Manage your quiz library, craft new questions, or host live classroom games.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/admin/quiz/create"
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-black text-sm shadow-xl shadow-indigo-600/30 flex items-center gap-2 transition-all hover:scale-105"
          >
            <Plus className="w-5 h-5" />
            <span>+ Create Quiz</span>
          </Link>

          <Link
            to="/join"
            className="px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm border border-slate-700 flex items-center gap-2"
          >
            <Gamepad2 className="w-5 h-5 text-amber-400" />
            <span>Join/Host Game</span>
          </Link>
        </div>
      </div>

      {/* METRICS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        
        <div className="p-6 rounded-3xl glass-panel border border-slate-800 flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
            <Layers className="w-7 h-7" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Quizzes</span>
            <h3 className="font-display font-black text-3xl text-white">{totalQuizzes}</h3>
          </div>
        </div>

        <div className="p-6 rounded-3xl glass-panel border border-slate-800 flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-cyan-600/20 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
            <HelpCircle className="w-7 h-7" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Questions</span>
            <h3 className="font-display font-black text-3xl text-white">{totalQuestions}</h3>
          </div>
        </div>

        <div className="p-6 rounded-3xl glass-panel border border-slate-800 flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-amber-600/20 border border-amber-500/30 text-amber-400 flex items-center justify-center">
            <BarChart3 className="w-7 h-7" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Games Hosted</span>
            <h3 className="font-display font-black text-3xl text-white">{totalGamesPlayed}</h3>
          </div>
        </div>

      </div>

      {/* SEARCH AND FILTERS */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
        
        {/* Search */}
        <div className="relative w-full md:w-96">
          <Search className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search quizzes by title or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 text-sm font-medium"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-medium focus:outline-none"
            >
              <option value="All">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-medium focus:outline-none"
          >
            <option value="All">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>

      </div>

      {/* QUIZ LIBRARY GRID */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          <p className="text-sm font-medium">Loading quiz library...</p>
        </div>
      ) : quizzes.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl border border-slate-800 text-center space-y-4 max-w-lg mx-auto">
          <Layers className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="font-display font-bold text-xl text-white">No Quizzes Found</h3>
          <p className="text-slate-400 text-xs leading-relaxed">
            {search || selectedCategory !== 'All' ? 'No quizzes match your filter criteria.' : 'You haven’t created any quizzes yet. Start building your first classroom quiz!'}
          </p>
          <Link
            to="/admin/quiz/create"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30"
          >
            <Plus className="w-4 h-4" />
            <span>Create First Quiz</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz) => (
            <div
              key={quiz._id}
              className="glass-panel-interactive p-6 rounded-3xl border border-slate-800 flex flex-col justify-between group"
            >
              <div>
                {/* Header Metadata */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="px-3 py-1 rounded-full bg-indigo-950/80 border border-indigo-500/30 text-indigo-300 text-[11px] font-bold">
                    {quiz.category}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold ${
                    quiz.difficulty === 'Easy' ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30' :
                    quiz.difficulty === 'Hard' ? 'bg-rose-950 text-rose-300 border border-rose-500/30' :
                    'bg-amber-950 text-amber-300 border border-amber-500/30'
                  }`}>
                    {quiz.difficulty}
                  </span>
                </div>

                {/* Title */}
                <h3 className="font-display font-bold text-xl text-white group-hover:text-indigo-400 transition-colors line-clamp-2 mb-2">
                  {quiz.title}
                </h3>
                <p className="text-slate-400 text-xs line-clamp-2 mb-4 leading-relaxed">
                  {quiz.description || 'No description provided.'}
                </p>

                {/* Stats */}
                <div className="flex items-center gap-4 text-xs text-slate-400 font-medium py-2 border-y border-slate-800/80 mb-6">
                  <div className="flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{quiz.questions?.length || 0} Questions</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <BarChart3 className="w-3.5 h-3.5 text-amber-400" />
                    <span>{quiz.playCount || 0} Plays</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                {/* Start Game Big Button */}
                <button
                  onClick={() => handleStartGame(quiz._id)}
                  disabled={launchingId === quiz._id}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
                >
                  {launchingId === quiz._id ? (
                    <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-slate-950" />
                      <span>START GAME SESSION</span>
                    </>
                  )}
                </button>

                {/* Edit, Duplicate, Delete Secondary Actions */}
                <div className="flex items-center justify-between gap-2">
                  <Link
                    to={`/admin/quiz/edit/${quiz._id}`}
                    className="flex-1 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-700"
                  >
                    <Edit className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Edit</span>
                  </Link>

                  <button
                    onClick={() => handleDuplicate(quiz._id)}
                    title="Duplicate Quiz"
                    className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700"
                  >
                    <Copy className="w-3.5 h-3.5 text-cyan-400" />
                  </button>

                  <button
                    onClick={() => setDeleteQuizId(quiz._id)}
                    title="Delete Quiz"
                    className="p-2 rounded-xl bg-slate-800/80 hover:bg-rose-950/60 hover:text-rose-400 text-slate-400 border border-slate-700"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteQuizId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="glass-panel p-6 rounded-3xl max-w-sm w-full border border-slate-800 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-950/80 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-lg text-white">Delete Quiz?</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Are you sure you want to delete this quiz? This action cannot be undone.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setDeleteQuizId(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 flex items-center justify-center gap-1"
              >
                {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
