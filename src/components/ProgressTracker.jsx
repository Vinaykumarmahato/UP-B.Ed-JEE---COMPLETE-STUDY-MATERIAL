import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Play, Trophy, XCircle, CheckCircle, RefreshCw, AlertTriangle,
  User, Mail, Phone, ShieldCheck, BarChart2, Clock, Target,
  BookOpen, Star, Zap, Award, TrendingUp, TrendingDown, ChevronDown, ChevronUp, Filter
} from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { questions } from '../data';

/* ─── Category config ──────────────────────────────────────────────────── */
const CATEGORIES = [
  { count: 200,  label: 'Beginner',    emoji: '🌱', color: 'from-emerald-400 to-teal-500',     bg: 'bg-emerald-50 dark:bg-emerald-900/20',  border: 'border-emerald-200 dark:border-emerald-800', time: '3h 20m',  desc: 'Perfect for a quick revision' },
  { count: 400,  label: 'Elementary',  emoji: '📗', color: 'from-sky-400 to-blue-500',          bg: 'bg-sky-50 dark:bg-sky-900/20',           border: 'border-sky-200 dark:border-sky-800',         time: '6h 40m',  desc: 'Build your foundation' },
  { count: 600,  label: 'Intermediate',emoji: '📘', color: 'from-violet-400 to-purple-600',     bg: 'bg-violet-50 dark:bg-violet-900/20',     border: 'border-violet-200 dark:border-violet-800',   time: '10h',     desc: 'Half the question bank' },
  { count: 800,  label: 'Advanced',    emoji: '📙', color: 'from-orange-400 to-amber-500',      bg: 'bg-orange-50 dark:bg-orange-900/20',     border: 'border-orange-200 dark:border-orange-800',   time: '13h 20m', desc: 'Serious preparation mode' },
  { count: 1000, label: 'Expert',      emoji: '📕', color: 'from-rose-400 to-pink-600',         bg: 'bg-rose-50 dark:bg-rose-900/20',         border: 'border-rose-200 dark:border-rose-800',       time: '16h 40m', desc: 'Elite level challenge' },
  { count: 1200, label: 'Topper 🏆',  emoji: '🎯', color: 'from-yellow-400 to-orange-500',     bg: 'bg-yellow-50 dark:bg-yellow-900/20',     border: 'border-yellow-200 dark:border-yellow-800',   time: '20h',     desc: 'Complete mastery – all 1200!' },
];

const SUBJECTS = [...new Set(questions.map(q => q.subject))];

const SUBJECT_COLORS = {
  'General Knowledge': { bar: 'bg-blue-500',    badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' },
  'Teaching Aptitude': { bar: 'bg-green-500',   badge: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' },
  'Psychology':        { bar: 'bg-purple-500',  badge: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300' },
  'Hindi Grammar':     { bar: 'bg-orange-500',  badge: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300' },
  'English Grammar':   { bar: 'bg-sky-500',     badge: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300' },
  'Reasoning':         { bar: 'bg-pink-500',    badge: 'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300' },
};

/* ─── Helpers ────────────────────────────────────────────────────────────── */
const calcTotalSeconds = (count) => (count === 'All' ? questions.length : parseInt(count) || 200) * 60;

const formatTime = (secs) => {
  if (secs === null || secs === undefined) return '--:--:--';
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

const getRank = (pct) => {
  if (pct >= 90) return { label: 'Topper 🏆', color: 'text-yellow-500' };
  if (pct >= 75) return { label: 'Distinction ⭐', color: 'text-purple-500' };
  if (pct >= 60) return { label: 'First Class 🎖️', color: 'text-blue-500' };
  if (pct >= 45) return { label: 'Pass ✅', color: 'text-green-500' };
  return { label: 'Needs More Practice 📚', color: 'text-red-500' };
};

/* ════════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════════════════════════════════════ */
const ProgressTracker = () => {
  /* ── Persistent state ── */
  const [userDetails, setUserDetails]         = useLocalStorage('upbed_user_details', null);
  const [quizState,   setQuizState]           = useLocalStorage('upbed_quiz_state', 'registration');
  const [currentQuestions, setCurrentQuestions] = useLocalStorage('upbed_quiz_questions', []);
  const [currentIndex, setCurrentIndex]       = useLocalStorage('upbed_quiz_index', 0);
  const [score,       setScore]               = useLocalStorage('upbed_quiz_score', 0);
  const [answers,     setAnswers]             = useLocalStorage('upbed_quiz_answers', []);
  const [timerEndTime, setTimerEndTime]       = useLocalStorage('upbed_quiz_end_time', null);
  const [timeTaken,   setTimeTaken]           = useLocalStorage('upbed_quiz_time_taken', null);

  /* ── Ephemeral state ── */
  const [selectedOption, setSelectedOption]   = useState(null);
  const [timeLeft,       setTimeLeft]         = useState(null);
  const [name,           setName]             = useState('');
  const [email,          setEmail]            = useState('');
  const [phone,          setPhone]            = useState('');
  const [selectedCat,    setSelectedCat]      = useState(null);   // chosen category obj
  const [reviewFilter,   setReviewFilter]     = useState('all');  // all | correct | wrong
  const [expandedIdx,    setExpandedIdx]      = useState(null);   // expanded review card
  const timerRef = useRef(null);

  /* ── Timer ── */
  useEffect(() => {
    if (!timerEndTime || ['results', 'registration', 'success', 'category'].includes(quizState)) {
      clearInterval(timerRef.current);
      return;
    }
    const tick = () => {
      const remaining = Math.floor((timerEndTime - Date.now()) / 1000);
      if (remaining <= 0) {
        clearInterval(timerRef.current);
        setTimeLeft(0);
        setTimeTaken(calcTotalSeconds(userDetails?.questionCount));
        setQuizState('results');
      } else {
        setTimeLeft(remaining);
      }
    };
    tick();
    timerRef.current = setInterval(tick, 1000);
    return () => clearInterval(timerRef.current);
  }, [quizState, timerEndTime]);

  /* ── Auto-advance if already registered ── */
  useEffect(() => {
    if (userDetails && quizState === 'registration') setQuizState('category');
  }, [userDetails, quizState, setQuizState]);

  /* ── Registration ── */
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!name || !email || !phone) return;
    setUserDetails({ name, email, phone, questionCount: 200 });
    setQuizState('success');
    try {
      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: 'b3b4c5b4-37cd-4195-b15a-8df6644064db',
          subject: 'New Student Registered - UP B.Ed Mock Test',
          from_name: 'UP B.Ed Portal',
          Name: name, Email: email, Mobile: phone,
        }),
      });
    } catch (_) {}
    setTimeout(() => setQuizState('category'), 2800);
  };

  /* ── Start quiz with chosen category ── */
  const startQuiz = (cat) => {
    const count = cat.count;
    const perSubject = Math.floor(count / SUBJECTS.length);
    let remainder = count % SUBJECTS.length;
    let selected = [];
    SUBJECTS.forEach(sub => {
      const subQs = questions.filter(q => q.subject === sub).sort(() => 0.5 - Math.random());
      const take = perSubject + (remainder > 0 ? 1 : 0);
      if (remainder > 0) remainder--;
      selected.push(...subQs.slice(0, take));
    });
    selected = selected.sort(() => 0.5 - Math.random());

    const totalSecs = calcTotalSeconds(count);
    setCurrentQuestions(selected);
    setCurrentIndex(0);
    setScore(0);
    setAnswers([]);
    setSelectedOption(null);
    setTimerEndTime(Date.now() + totalSecs * 1000);
    setUserDetails({ ...userDetails, questionCount: count });
    setQuizState('playing');
  };

  /* ── Answer ── */
  const handleAnswer = (option) => {
    if (selectedOption) return;
    setSelectedOption(option);
    const isCorrect = option === currentQuestions[currentIndex].correctAnswer;
    if (isCorrect) setScore(score + 1);
    const newAnswers = [...answers, { question: currentQuestions[currentIndex], selected: option, isCorrect }];
    setAnswers(newAnswers);

    setTimeout(() => {
      if (currentIndex < currentQuestions.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setSelectedOption(null);
      } else {
        if (timerEndTime) {
          const elapsed = calcTotalSeconds(userDetails?.questionCount) - Math.floor((timerEndTime - Date.now()) / 1000);
          setTimeTaken(Math.max(0, elapsed));
        }
        setQuizState('results');
      }
    }, 900);
  };

  /* ── Analytics ── */
  const analytics = useMemo(() => {
    if (answers.length === 0) return null;
    const subjects = {};
    let correct = 0, incorrect = 0, skipped = 0;
    answers.forEach(ans => {
      const sub = ans.question.subject;
      if (!subjects[sub]) subjects[sub] = { total: 0, correct: 0 };
      subjects[sub].total++;
      if (ans.isCorrect) { subjects[sub].correct++; correct++; }
      else incorrect++;
    });
    const unanswered = currentQuestions.length - answers.length;
    const accuracy = Math.round((correct / answers.length) * 100) || 0;
    const needsImprovement = Object.entries(subjects)
      .filter(([, s]) => (s.correct / s.total) < 0.5)
      .map(([sub]) => sub);
    const strengths = Object.entries(subjects)
      .filter(([, s]) => (s.correct / s.total) >= 0.75)
      .map(([sub]) => sub);
    return { subjects, correct, incorrect, unanswered, accuracy, needsImprovement, strengths };
  }, [answers, currentQuestions.length]);

  /* ── Filtered review list ── */
  const reviewList = useMemo(() => {
    if (reviewFilter === 'correct') return answers.filter(a => a.isCorrect);
    if (reviewFilter === 'wrong')   return answers.filter(a => !a.isCorrect);
    return answers;
  }, [answers, reviewFilter]);

  const isTimerWarning  = timeLeft !== null && timeLeft < 300;
  const isTimerCritical = timeLeft !== null && timeLeft < 60;

  const scorePercent = currentQuestions.length > 0 ? Math.round((score / currentQuestions.length) * 100) : 0;
  const rank = getRank(scorePercent);

  /* ═══════════════════════════════════════════════════════════════════════
     RENDER
  ═══════════════════════════════════════════════════════════════════════ */
  return (
    <div className="max-w-5xl mx-auto space-y-8 fade-in">
      {/* ── Page header ── */}
      <div className="text-center mb-2">
        <h2 className="text-3xl font-extrabold mb-2">Test Yourself</h2>
        <p className="text-slate-500 text-base">Choose your challenge level and start practicing with a live timer.</p>
      </div>

      {/* ══════════ REGISTRATION ══════════ */}
      {quizState === 'registration' && (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 md:p-12 shadow-sm border border-slate-100 dark:border-slate-700 max-w-xl mx-auto slide-up relative overflow-hidden">
          <div className="absolute top-4 right-4 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-3 py-1 rounded-full text-xs font-bold flex items-center border border-green-200 dark:border-green-800">
            <ShieldCheck className="w-4 h-4 mr-1" /> 100% Free
          </div>
          <div className="text-center mb-8 mt-4">
            <div className="w-20 h-20 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-10 h-10 text-primary-600 dark:text-primary-400" />
            </div>
            <h3 className="text-2xl font-bold">Register to Start</h3>
            <p className="text-slate-500 mt-2">Enter your details once to unlock personalized analytics.</p>
          </div>
          <form onSubmit={handleRegister} className="space-y-4 text-left">
            {[
              { label: 'Full Name', type: 'text', val: name, set: setName, Icon: User, ph: 'Ramesh Kumar' },
              { label: 'Email Address', type: 'email', val: email, set: setEmail, Icon: Mail, ph: 'ramesh@example.com' },
              { label: 'Mobile Number', type: 'tel', val: phone, set: setPhone, Icon: Phone, ph: '+91 9876543210' },
            ].map(({ label, type, val, set, Icon, ph }) => (
              <div key={label}>
                <label className="block text-sm font-medium mb-1">{label}</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Icon className="h-5 w-5 text-slate-400" />
                  </div>
                  <input required type={type} value={val} onChange={e => set(e.target.value)}
                    className="w-full pl-10 pr-3 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                    placeholder={ph} />
                </div>
              </div>
            ))}
            <button type="submit" className="w-full mt-6 px-8 py-4 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 hover:shadow-lg transition-all flex items-center justify-center">
              Register & Choose Category →
            </button>
          </form>
        </div>
      )}

      {/* ══════════ SUCCESS SPLASH ══════════ */}
      {quizState === 'success' && (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-12 text-center shadow-sm border border-slate-100 dark:border-slate-700 slide-up max-w-xl mx-auto">
          <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
            <CheckCircle className="w-14 h-14 text-green-500" />
          </div>
          <h3 className="text-3xl font-extrabold mb-3 text-green-600 dark:text-green-400">Welcome, {userDetails?.name}! 🎉</h3>
          <p className="text-slate-500 mb-6">Registration successful. Redirecting to category selection…</p>
          <div className="flex justify-center gap-1">
            {[0, 150, 300].map(d => (
              <div key={d} className="w-2 h-2 rounded-full bg-primary-500 animate-bounce" style={{ animationDelay: `${d}ms` }} />
            ))}
          </div>
        </div>
      )}

      {/* ══════════ CATEGORY SELECTION ══════════ */}
      {quizState === 'category' && (
        <div className="slide-up">
          <div className="text-center mb-8">
            <p className="text-lg font-semibold text-slate-700 dark:text-slate-300">
              Hello, <span className="text-primary-600 dark:text-primary-400">{userDetails?.name}</span> 👋 — Select how many questions you want to practice:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {CATEGORIES.map(cat => (
              <button
                key={cat.count}
                onClick={() => setSelectedCat(cat)}
                className={`group relative rounded-2xl p-6 border-2 text-left transition-all duration-200 hover:-translate-y-1 hover:shadow-xl ${
                  selectedCat?.count === cat.count
                    ? `${cat.border} ${cat.bg} shadow-lg scale-[1.02]`
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300'
                }`}
              >
                {/* gradient bar top */}
                <div className={`absolute top-0 left-0 right-0 h-1 rounded-t-2xl bg-gradient-to-r ${cat.color} ${selectedCat?.count === cat.count ? 'opacity-100' : 'opacity-0 group-hover:opacity-60'} transition-opacity`} />

                <div className="flex items-start justify-between mb-3">
                  <span className="text-3xl">{cat.emoji}</span>
                  {selectedCat?.count === cat.count && (
                    <span className="bg-primary-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">Selected</span>
                  )}
                </div>

                <div className={`text-4xl font-black mb-1 bg-gradient-to-r ${cat.color} bg-clip-text text-transparent`}>
                  {cat.count}
                </div>
                <div className="font-bold text-slate-800 dark:text-slate-100 text-lg">{cat.label}</div>
                <div className="text-slate-500 dark:text-slate-400 text-sm mt-1">{cat.desc}</div>

                <div className="flex items-center gap-1 mt-3 text-slate-400 dark:text-slate-500 text-xs">
                  <Clock className="w-3 h-3" />
                  <span>Est. time: {cat.time}</span>
                </div>

                {/* per subject */}
                <div className="mt-3 flex flex-wrap gap-1">
                  {SUBJECTS.map(sub => (
                    <span key={sub} className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded">
                      {cat.count / SUBJECTS.length} {sub.split(' ')[0]}
                    </span>
                  ))}
                </div>
              </button>
            ))}
          </div>

          {/* Info strip */}
          <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800/40 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4 mb-6 text-sm text-primary-700 dark:text-primary-300">
            <Zap className="w-5 h-5 shrink-0 text-primary-500" />
            <span>Each category draws questions <strong>equally from all 6 subjects</strong>. Timer runs at <strong>1 minute per question</strong>. You'll get a <strong>full report</strong> at the end.</span>
          </div>

          <div className="text-center">
            <button
              disabled={!selectedCat}
              onClick={() => startQuiz(selectedCat)}
              className={`inline-flex items-center gap-3 px-10 py-4 rounded-2xl font-bold text-lg transition-all duration-200 ${
                selectedCat
                  ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-lg hover:shadow-xl hover:-translate-y-1'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Play className="w-6 h-6" />
              {selectedCat ? `Start Practicing — ${selectedCat.count} Questions` : 'Select a category first'}
            </button>
            {selectedCat && (
              <p className="text-slate-400 text-sm mt-2">Timer: {selectedCat.time} · 6 Subjects · 1 min/question</p>
            )}
          </div>
        </div>
      )}

      {/* ══════════ PLAYING ══════════ */}
      {quizState === 'playing' && currentQuestions.length > 0 && (
        <div className="slide-up">
          {/* ── Sticky header with timer + progress ── */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 px-5 py-4 mb-5 flex flex-col sm:flex-row items-center justify-between gap-3 sticky top-2 z-20">
            {/* Timer */}
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full font-mono font-bold text-xl ${
              isTimerCritical ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 animate-pulse'
              : isTimerWarning ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
              : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200'
            }`}>
              <Clock className="w-5 h-5" />
              {formatTime(timeLeft)}
            </div>

            {/* Progress */}
            <div className="flex-1 w-full sm:w-auto px-2">
              <div className="flex justify-between text-xs font-semibold text-slate-500 mb-1">
                <span>Q {currentIndex + 1} / {currentQuestions.length}</span>
                <span>{Math.round(((currentIndex) / currentQuestions.length) * 100)}% done</span>
              </div>
              <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary-500 to-primary-400 rounded-full transition-all duration-500"
                  style={{ width: `${((currentIndex + 1) / currentQuestions.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Score live */}
            <div className="flex items-center gap-1 text-sm font-bold text-green-600 dark:text-green-400">
              <CheckCircle className="w-4 h-4" /> {score} correct
            </div>
          </div>

          {/* ── Question card ── */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 md:p-10">
            {/* Subject badge */}
            <div className="mb-5">
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${SUBJECT_COLORS[currentQuestions[currentIndex].subject]?.badge || 'bg-slate-100 text-slate-700'}`}>
                <BookOpen className="w-3 h-3" />
                {currentQuestions[currentIndex].subject}
              </span>
              {currentQuestions[currentIndex].sourceYear && (
                <span className="ml-2 text-xs text-slate-400 italic">{currentQuestions[currentIndex].sourceYear}</span>
              )}
            </div>

            <h3 className="text-xl md:text-2xl font-bold leading-relaxed mb-8 text-slate-800 dark:text-slate-100">
              {currentQuestions[currentIndex].text}
            </h3>

            <div className="grid gap-3">
              {Object.entries(currentQuestions[currentIndex].options).map(([key, value]) => {
                let cls = 'border-slate-200 dark:border-slate-700 hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-slate-700';
                if (selectedOption) {
                  if (key === currentQuestions[currentIndex].correctAnswer) cls = 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300';
                  else if (key === selectedOption) cls = 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300';
                  else cls = 'border-slate-100 dark:border-slate-800 opacity-40';
                }
                return (
                  <button key={key} onClick={() => handleAnswer(key)} disabled={!!selectedOption}
                    className={`p-4 md:p-5 rounded-xl border-2 transition-all text-left flex items-center gap-4 ${cls}`}>
                    <span className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center font-bold text-base shrink-0">
                      {key}
                    </span>
                    <span className="font-medium text-base md:text-lg">{value}</span>
                    {selectedOption && key === currentQuestions[currentIndex].correctAnswer && (
                      <CheckCircle className="w-5 h-5 text-green-500 ml-auto shrink-0" />
                    )}
                    {selectedOption && key === selectedOption && key !== currentQuestions[currentIndex].correctAnswer && (
                      <XCircle className="w-5 h-5 text-red-500 ml-auto shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Explanation pop-up */}
            {selectedOption && (
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl text-sm text-blue-800 dark:text-blue-200">
                <p className="font-bold mb-1">💡 Explanation</p>
                <p>{currentQuestions[currentIndex].explanation}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════ RESULTS ══════════ */}
      {quizState === 'results' && analytics && (
        <div className="space-y-6 slide-up">

          {/* ── Hero score card ── */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-primary-900 rounded-3xl p-8 md:p-12 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-primary-500 opacity-10 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-orange-400 opacity-10 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3 pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div>
                <p className="text-slate-400 uppercase tracking-widest text-xs font-bold mb-1">Performance Report</p>
                <h2 className="text-3xl md:text-4xl font-extrabold mb-1">{userDetails?.name}</h2>
                <p className="text-slate-400 text-sm flex flex-wrap gap-3">
                  <span><Mail className="w-3 h-3 inline mr-1" />{userDetails?.email}</span>
                  <span><Phone className="w-3 h-3 inline mr-1" />{userDetails?.phone}</span>
                </p>
                <p className={`mt-3 text-2xl font-black ${rank.color}`}>{rank.label}</p>
              </div>

              {/* Big score circle */}
              <div className="text-center bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/20 min-w-[180px]">
                <div className="text-6xl font-black text-white mb-1">{scorePercent}%</div>
                <p className="text-slate-300 font-medium text-sm">Overall Score</p>
                <p className="text-primary-300 text-xs mt-1">{score} / {currentQuestions.length} correct</p>
              </div>
            </div>
          </div>

          {/* ── Quick stat cards ── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Questions', val: currentQuestions.length, Icon: BarChart2, color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' },
              { label: 'Correct', val: analytics.correct, Icon: CheckCircle, color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' },
              { label: 'Wrong', val: analytics.incorrect, Icon: XCircle, color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' },
              { label: 'Accuracy', val: `${analytics.accuracy}%`, Icon: Target, color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' },
            ].map(({ label, val, Icon, color }) => (
              <div key={label} className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-4">
                <div className={`p-3 rounded-xl ${color}`}><Icon className="w-6 h-6" /></div>
                <div>
                  <p className="text-slate-500 text-xs font-bold uppercase">{label}</p>
                  <p className="text-2xl font-black">{val}</p>
                </div>
              </div>
            ))}
          </div>

          {/* ── Time & Rank strip ── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-4">
              <div className="p-3 rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"><Clock className="w-6 h-6" /></div>
              <div>
                <p className="text-slate-500 text-xs font-bold uppercase">Time Taken</p>
                <p className="text-2xl font-black font-mono">{timeTaken ? formatTime(timeTaken) : '--:--:--'}</p>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-4">
              <div className="p-3 rounded-xl bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400"><Award className="w-6 h-6" /></div>
              <div>
                <p className="text-slate-500 text-xs font-bold uppercase">Category</p>
                <p className="text-xl font-black">{CATEGORIES.find(c => c.count === userDetails?.questionCount)?.label || userDetails?.questionCount + ' Qs'}</p>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-4">
              <div className="p-3 rounded-xl bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"><TrendingUp className="w-6 h-6" /></div>
              <div>
                <p className="text-slate-500 text-xs font-bold uppercase">Avg per question</p>
                <p className="text-2xl font-black font-mono">
                  {timeTaken ? formatTime(Math.round(timeTaken / (answers.length || 1))) : '--:--'}
                </p>
              </div>
            </div>
          </div>

          {/* ── Subject-wise analytics ── */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><BarChart2 className="w-5 h-5 text-primary-500" /> Subject-wise Performance</h3>
              <div className="space-y-4">
                {Object.entries(analytics.subjects).map(([subject, stats]) => {
                  const pct = Math.round((stats.correct / stats.total) * 100);
                  const barColor = pct >= 70 ? 'bg-green-500' : pct >= 40 ? 'bg-yellow-500' : 'bg-red-500';
                  return (
                    <div key={subject}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{subject}</span>
                        <span className="font-bold">{stats.correct}/{stats.total} <span className={`${pct >= 70 ? 'text-green-600' : pct >= 40 ? 'text-yellow-600' : 'text-red-600'}`}>({pct}%)</span></span>
                      </div>
                      <div className="w-full h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-700 ${barColor}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Strengths & Weaknesses */}
            <div className="space-y-4">
              {/* Strengths */}
              <div className="bg-green-50 dark:bg-green-900/10 p-6 rounded-2xl border border-green-100 dark:border-green-900/30 shadow-sm">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-green-700 dark:text-green-400">
                  <TrendingUp className="w-5 h-5" /> Your Strengths
                </h3>
                {analytics.strengths.length > 0 ? (
                  <ul className="space-y-2">
                    {analytics.strengths.map(sub => (
                      <li key={sub} className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-green-100 dark:border-green-900/30 flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-200 text-sm">
                        <Star className="w-4 h-4 text-yellow-400 shrink-0" /> {sub}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-green-700 dark:text-green-400 text-sm">Keep practicing to build strong subjects!</p>
                )}
              </div>

              {/* Needs improvement */}
              <div className="bg-red-50 dark:bg-red-900/10 p-6 rounded-2xl border border-red-100 dark:border-red-900/30 shadow-sm">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-red-700 dark:text-red-400">
                  <AlertTriangle className="w-5 h-5" /> Needs Improvement
                </h3>
                {analytics.needsImprovement.length > 0 ? (
                  <ul className="space-y-2">
                    {analytics.needsImprovement.map(sub => (
                      <li key={sub} className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-red-100 dark:border-red-900/30 flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-200 text-sm">
                        <TrendingDown className="w-4 h-4 text-red-500 shrink-0" /> {sub}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center py-3">
                    <Trophy className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                    <p className="text-green-700 dark:text-green-400 font-bold text-sm">All subjects above 50% — Great work!</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Action buttons ── */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-2">
            <button onClick={() => setQuizState('category')}
              className="inline-flex items-center gap-2 px-8 py-3 bg-primary-600 text-white font-bold rounded-full hover:bg-primary-700 transition-colors shadow-md hover:shadow-lg">
              <Play className="w-4 h-4" /> Try a New Category
            </button>
            <button onClick={() => startQuiz(CATEGORIES.find(c => c.count === userDetails?.questionCount) || CATEGORIES[0])}
              className="inline-flex items-center gap-2 px-8 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-full hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors border border-slate-200 dark:border-slate-600">
              <RefreshCw className="w-4 h-4" /> Retake Same Test
            </button>
          </div>

          {/* ── Detailed review ── */}
          <div className="border-t border-slate-200 dark:border-slate-700 pt-10">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h3 className="text-2xl font-bold flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-primary-500" /> Review All Answers
              </h3>
              {/* Filter */}
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-400" />
                {['all', 'correct', 'wrong'].map(f => (
                  <button key={f} onClick={() => setReviewFilter(f)}
                    className={`px-3 py-1 rounded-full text-xs font-bold capitalize transition-all ${
                      reviewFilter === f ? 'bg-primary-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                    }`}>
                    {f === 'all' ? `All (${answers.length})` : f === 'correct' ? `✅ Correct (${analytics.correct})` : `❌ Wrong (${analytics.incorrect})`}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {reviewList.map((answer, idx) => (
                <div key={idx}
                  className={`rounded-2xl border overflow-hidden transition-all ${
                    answer.isCorrect
                      ? 'border-green-100 dark:border-green-900/30'
                      : 'border-red-100 dark:border-red-900/30'
                  }`}
                >
                  {/* Card header — clickable to expand */}
                  <button
                    className={`w-full p-5 text-left flex items-start gap-4 ${
                      answer.isCorrect ? 'bg-green-50/60 dark:bg-green-900/10' : 'bg-red-50/60 dark:bg-red-900/10'
                    }`}
                    onClick={() => setExpandedIdx(expandedIdx === idx ? null : idx)}
                  >
                    <span className="shrink-0 mt-0.5">
                      {answer.isCorrect
                        ? <CheckCircle className="w-5 h-5 text-green-500" />
                        : <XCircle className="w-5 h-5 text-red-500" />}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap gap-2 mb-1">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${SUBJECT_COLORS[answer.question.subject]?.badge || 'bg-slate-100 text-slate-700'}`}>
                          {answer.question.subject}
                        </span>
                        {answer.question.sourceYear && (
                          <span className="text-xs text-slate-400 italic">{answer.question.sourceYear}</span>
                        )}
                      </div>
                      <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm md:text-base line-clamp-2">
                        Q{idx + 1}. {answer.question.text}
                      </p>
                    </div>
                    <span className="shrink-0 text-slate-400">
                      {expandedIdx === idx ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </span>
                  </button>

                  {/* Expanded body */}
                  {expandedIdx === idx && (
                    <div className="p-5 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700 space-y-3">
                      {/* Options */}
                      <div className="grid gap-2">
                        {Object.entries(answer.question.options).map(([k, v]) => {
                          const isCorrectOpt = k === answer.question.correctAnswer;
                          const isSelected = k === answer.selected;
                          let cls = 'border-slate-100 dark:border-slate-700 text-slate-500';
                          if (isCorrectOpt) cls = 'border-green-400 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 font-bold';
                          else if (isSelected && !isCorrectOpt) cls = 'border-red-400 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300';
                          return (
                            <div key={k} className={`flex items-center gap-3 p-3 rounded-xl border ${cls}`}>
                              <span className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-xs font-bold shrink-0">{k}</span>
                              <span className="text-sm">{v}</span>
                              {isCorrectOpt && <CheckCircle className="w-4 h-4 text-green-500 ml-auto shrink-0" />}
                              {isSelected && !isCorrectOpt && <XCircle className="w-4 h-4 text-red-500 ml-auto shrink-0" />}
                            </div>
                          );
                        })}
                      </div>

                      {/* Your answer vs correct */}
                      {!answer.isCorrect && (
                        <div className="flex flex-wrap gap-4 text-sm">
                          <span>Your answer: <span className="font-bold text-red-600">{answer.question.options[answer.selected]}</span></span>
                          <span>Correct: <span className="font-bold text-green-600">{answer.question.options[answer.question.correctAnswer]}</span></span>
                        </div>
                      )}

                      {/* Explanation */}
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl text-sm text-blue-800 dark:text-blue-200">
                        <p className="font-bold mb-1">💡 Explanation</p>
                        <p>{answer.question.explanation}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {reviewList.length === 0 && (
              <div className="text-center py-12 text-slate-400">
                <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No questions to show for this filter.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressTracker;
