import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import {
  Save,
  Plus,
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  ArrowLeft,
  Clock,
  Award,
  HelpCircle,
  Image as ImageIcon,
  CheckCircle2,
  Sparkles,
  Loader2,
  ListOrdered
} from 'lucide-react';
import { CATEGORIES, TIMER_OPTIONS, CHOICE_CONFIG } from '../utils/constants';

export default function QuizEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  // Metadata
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('General Knowledge');
  const [difficulty, setDifficulty] = useState('Medium');
  const [visibility, setVisibility] = useState('Public');
  const [coverImage, setCoverImage] = useState('');

  // Questions array
  const [questions, setQuestions] = useState([
    {
      questionText: 'What is the capital city of India?',
      questionType: 'multiple_choice',
      image: '',
      options: ['Mumbai', 'Kolkata', 'New Delhi', 'Chennai'],
      correctAnswer: 2,
      timer: 20,
      points: 1000
    }
  ]);

  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEditing) {
      const fetchQuiz = async () => {
        try {
          setLoading(true);
          const res = await api.get(`/quizzes/${id}`);
          const q = res.data;
          setTitle(q.title || '');
          setDescription(q.description || '');
          setCategory(q.category || 'General Knowledge');
          setDifficulty(q.difficulty || 'Medium');
          setVisibility(q.visibility || 'Public');
          setCoverImage(q.coverImage || '');
          if (q.questions && q.questions.length > 0) {
            setQuestions(q.questions);
          }
        } catch (err) {
          setError('Failed to load quiz details');
        } finally {
          setLoading(false);
        }
      };
      fetchQuiz();
    }
  }, [id, isEditing]);

  // Add Question
  const handleAddQuestion = (type = 'multiple_choice') => {
    const newQ = {
      questionText: type === 'true_false' ? 'This statement is true.' : 'Enter your question here...',
      questionType: type,
      image: '',
      options: type === 'true_false' ? ['True', 'False'] : ['Option A', 'Option B', 'Option C', 'Option D'],
      correctAnswer: 0,
      timer: 20,
      points: 1000
    };
    setQuestions([...questions, newQ]);
    setActiveQuestionIndex(questions.length);
  };

  // Delete Question
  const handleDeleteQuestion = (idx) => {
    if (questions.length <= 1) {
      alert('A quiz must have at least one question.');
      return;
    }
    const updated = questions.filter((_, i) => i !== idx);
    setQuestions(updated);
    setActiveQuestionIndex(Math.max(0, idx - 1));
  };

  // Duplicate Question
  const handleDuplicateQuestion = (idx) => {
    const target = questions[idx];
    const cloned = { ...target, options: [...target.options] };
    const updated = [...questions];
    updated.splice(idx + 1, 0, cloned);
    setQuestions(updated);
    setActiveQuestionIndex(idx + 1);
  };

  // Reorder Question
  const handleMoveQuestion = (idx, direction) => {
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= questions.length) return;
    const updated = [...questions];
    const temp = updated[idx];
    updated[idx] = updated[targetIdx];
    updated[targetIdx] = temp;
    setQuestions(updated);
    setActiveQuestionIndex(targetIdx);
  };

  // Current active question update helper
  const updateActiveQuestion = (field, value) => {
    const updated = [...questions];
    updated[activeQuestionIndex] = {
      ...updated[activeQuestionIndex],
      [field]: value
    };
    setQuestions(updated);
  };

  // Option text update helper
  const updateOptionText = (optIdx, val) => {
    const updated = [...questions];
    const opts = [...updated[activeQuestionIndex].options];
    opts[optIdx] = val;
    updated[activeQuestionIndex].options = opts;
    setQuestions(updated);
  };

  // Save Quiz handler
  const handleSaveQuiz = async () => {
    if (!title.trim()) {
      setError('Quiz title is required');
      return;
    }

    // Validate questions
    for (let i = 0; i < questions.length; i++) {
      if (!questions[i].questionText.trim()) {
        setError(`Question #${i + 1} requires text.`);
        setActiveQuestionIndex(i);
        return;
      }
      for (let j = 0; j < questions[i].options.length; j++) {
        if (!questions[i].options[j].trim()) {
          setError(`Question #${i + 1} Option ${j + 1} cannot be empty.`);
          setActiveQuestionIndex(i);
          return;
        }
      }
    }

    try {
      setSaving(true);
      setError('');

      const payload = {
        title,
        description,
        category,
        difficulty,
        visibility,
        coverImage,
        questions
      };

      if (isEditing) {
        await api.put(`/quizzes/${id}`, payload);
      } else {
        await api.post('/quizzes', payload);
      }

      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save quiz');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B0F19]">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  const currentQ = questions[activeQuestionIndex] || questions[0];

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pt-6">
      
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/dashboard"
            className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-display font-black text-2xl text-white">
              {isEditing ? 'Edit Quiz' : 'Create New Quiz'}
            </h1>
            <p className="text-slate-400 text-xs">
              {questions.length} Question{questions.length !== 1 && 's'} total
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSaveQuiz}
            disabled={saving}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition-all hover:scale-105"
          >
            {saving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Save className="w-5 h-5" />
                <span>Save Quiz</span>
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-950/60 border border-rose-500/30 text-rose-300 text-xs font-semibold">
          {error}
        </div>
      )}

      {/* QUIZ METADATA FORM */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 mb-8 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Quiz Title *
            </label>
            <input
              type="text"
              placeholder="e.g. World Geography Master Trivia"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-semibold placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-medium focus:outline-none text-sm"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Difficulty Level
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-medium focus:outline-none text-sm"
            >
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Visibility
            </label>
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-medium focus:outline-none text-sm"
            >
              <option value="Public">Public (Discoverable)</option>
              <option value="Private">Private (Room Code Only)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Description / Notes
            </label>
            <input
              type="text"
              placeholder="Brief description for players..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none text-sm"
            />
          </div>
        </div>
      </div>

      {/* QUESTION BUILDER WORKSPACE (2 Columns: Questions Sidebar + Question Editor) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* SIDEBAR: QUESTION LIST */}
        <div className="lg:col-span-4 glass-panel p-5 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
              <ListOrdered className="w-4 h-4 text-indigo-400" />
              <span>Questions Roster</span>
            </h3>

            <div className="flex items-center gap-1">
              <button
                onClick={() => handleAddQuestion('multiple_choice')}
                title="Add Multiple Choice Question"
                className="px-2.5 py-1.5 rounded-lg bg-indigo-600/80 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> MC
              </button>

              <button
                onClick={() => handleAddQuestion('true_false')}
                title="Add True/False Question"
                className="px-2.5 py-1.5 rounded-lg bg-violet-600/80 hover:bg-violet-500 text-white text-xs font-bold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> T/F
              </button>
            </div>
          </div>

          {/* Questions Items */}
          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {questions.map((q, idx) => (
              <div
                key={idx}
                onClick={() => setActiveQuestionIndex(idx)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  activeQuestionIndex === idx
                    ? 'bg-indigo-950/70 border-indigo-500/80 shadow-md shadow-indigo-950/50'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <span className="w-7 h-7 rounded-xl bg-slate-800 text-indigo-400 font-display font-bold text-xs flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <div className="overflow-hidden">
                    <p className="text-xs font-semibold text-white truncate">
                      {q.questionText || 'Empty Question'}
                    </p>
                    <span className="text-[10px] text-slate-400">
                      {q.questionType === 'true_false' ? 'True / False' : 'Multiple Choice'} • {q.timer}s
                    </span>
                  </div>
                </div>

                {/* Sidebar controls for ordering & actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleMoveQuestion(idx, -1); }}
                    disabled={idx === 0}
                    className="p-1 text-slate-500 hover:text-white disabled:opacity-30"
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleMoveQuestion(idx, 1); }}
                    disabled={idx === questions.length - 1}
                    className="p-1 text-slate-500 hover:text-white disabled:opacity-30"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDuplicateQuestion(idx); }}
                    className="p-1 text-slate-500 hover:text-cyan-400"
                    title="Duplicate"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteQuestion(idx); }}
                    className="p-1 text-slate-500 hover:text-rose-400"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* MAIN PANEL: ACTIVE QUESTION EDITOR */}
        <div className="lg:col-span-8 glass-panel p-6 rounded-3xl border border-slate-800 space-y-6">
          
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <span className="font-display font-bold text-lg text-white">
              Editing Question #{activeQuestionIndex + 1}
            </span>

            <div className="flex items-center gap-3">
              {/* Type toggle */}
              <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => {
                    updateActiveQuestion('questionType', 'multiple_choice');
                    if (currentQ.options.length < 4) {
                      updateActiveQuestion('options', ['Option A', 'Option B', 'Option C', 'Option D']);
                    }
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                    currentQ.questionType === 'multiple_choice'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Multiple Choice
                </button>
                <button
                  onClick={() => {
                    updateActiveQuestion('questionType', 'true_false');
                    updateActiveQuestion('options', ['True', 'False']);
                    if (currentQ.correctAnswer > 1) updateActiveQuestion('correctAnswer', 0);
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                    currentQ.questionType === 'true_false'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  True / False
                </button>
              </div>

              {/* Timer selector */}
              <div className="flex items-center gap-1 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
                <Clock className="w-4 h-4 text-amber-400" />
                <select
                  value={currentQ.timer}
                  onChange={(e) => updateActiveQuestion('timer', Number(e.target.value))}
                  className="bg-transparent text-white font-bold text-xs focus:outline-none"
                >
                  {TIMER_OPTIONS.map((sec) => (
                    <option key={sec} value={sec} className="bg-slate-900">{sec} sec</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Question Text Input */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Question Text *
            </label>
            <textarea
              rows={3}
              placeholder="What is the capital of India?"
              value={currentQ.questionText}
              onChange={(e) => updateActiveQuestion('questionText', e.target.value)}
              className="w-full p-4 rounded-2xl bg-slate-900 border border-slate-700 text-white font-medium placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 text-base"
            />
          </div>

          {/* Optional Image URL */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-cyan-400" /> Optional Question Image URL
            </label>
            <input
              type="text"
              placeholder="https://images.unsplash.com/photo-..."
              value={currentQ.image || ''}
              onChange={(e) => updateActiveQuestion('image', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>

          {/* Answer Options & Correct Answer Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
              Answer Options (Select the Radio Button to mark the Correct Answer)
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {currentQ.options.map((opt, optIdx) => {
                const choiceMeta = CHOICE_CONFIG[optIdx] || CHOICE_CONFIG[0];
                const isCorrect = currentQ.correctAnswer === optIdx;

                return (
                  <div
                    key={optIdx}
                    onClick={() => updateActiveQuestion('correctAnswer', optIdx)}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative ${
                      isCorrect
                        ? 'bg-slate-900 border-emerald-500 ring-2 ring-emerald-500/20 shadow-lg'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`w-8 h-8 rounded-xl ${choiceMeta.colorClass} text-white font-black text-sm flex items-center justify-center shrink-0`}>
                        {choiceMeta.symbol}
                      </span>

                      <span className="text-xs font-bold text-slate-300 uppercase">
                        Option {choiceMeta.label}
                      </span>

                      {isCorrect && (
                        <span className="ml-auto inline-flex items-center gap-1 text-emerald-400 text-xs font-bold bg-emerald-950 px-2 py-0.5 rounded-md border border-emerald-500/30">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Correct
                        </span>
                      )}
                    </div>

                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => updateOptionText(optIdx, e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      placeholder={`Enter answer choice ${choiceMeta.label}...`}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm font-semibold placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
