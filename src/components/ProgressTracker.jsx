import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Play, Trophy, XCircle, CheckCircle, RefreshCw, AlertTriangle,
  User, Mail, Phone, ShieldCheck, BarChart2, Clock, Target,
  BookOpen, Star, Zap, Award, TrendingUp, TrendingDown, ChevronDown, ChevronUp, Filter,
  MinusCircle
} from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { questions } from '../data';

/* ─────────────────────────────────────────────────────────────────────────────
   UP B.Ed JEE NEGATIVE MARKING RULES
   ─ Each correct answer  → +1 mark
   ─ Each wrong answer    → -1/3 mark  (i.e. 0.333...)
   ─ Unattempted          →  0 marks
   ─ Final marks are rounded to 2 decimal places for display
   ───────────────────────────────────────────────────────────────────────────── */
const MARKS_PER_CORRECT  = 1;
const NEGATIVE_PER_WRONG = 1 / 3;   // 0.3333...

/**
 * calcMarks(correct, wrong)
 * Returns { raw, display, maxMarks, percentage }
 */
const calcMarks = (correct, wrong, totalQuestions) => {
  const raw        = correct * MARKS_PER_CORRECT - wrong * NEGATIVE_PER_WRONG;
  const clamped    = Math.max(0, raw);          // marks can't go below 0
  const maxMarks   = totalQuestions * MARKS_PER_CORRECT;
  const percentage = maxMarks > 0 ? Math.round((clamped / maxMarks) * 100) : 0;
  return {
    raw,                                         // actual (may be negative before clamp)
    marks:      Math.round(clamped * 100) / 100, // 2-dp display value
    maxMarks,
    percentage,
  };
};

/* ─── Category config ──────────────────────────────────────────────────── */
const CATEGORIES = [
  { count: 200,  label: 'Beginner',     emoji: '🌱', color: 'from-emerald-400 to-teal-500',    bg: 'bg-emerald-50 dark:bg-emerald-900/20',  border: 'border-emerald-200 dark:border-emerald-800', time: '3h 20m',  desc: 'Perfect for a quick revision' },
  { count: 400,  label: 'Elementary',   emoji: '📗', color: 'from-sky-400 to-blue-500',         bg: 'bg-sky-50 dark:bg-sky-900/20',           border: 'border-sky-200 dark:border-sky-800',         time: '6h 40m',  desc: 'Build your foundation' },
  { count: 600,  label: 'Intermediate', emoji: '📘', color: 'from-violet-400 to-purple-600',    bg: 'bg-violet-50 dark:bg-violet-900/20',     border: 'border-violet-200 dark:border-violet-800',   time: '10h',     desc: 'Half the question bank' },
  { count: 800,  label: 'Advanced',     emoji: '📙', color: 'from-orange-400 to-amber-500',     bg: 'bg-orange-50 dark:bg-orange-900/20',     border: 'border-orange-200 dark:border-orange-800',   time: '13h 20m', desc: 'Serious preparation mode' },
  { count: 1000, label: 'Expert',       emoji: '📕', color: 'from-rose-400 to-pink-600',        bg: 'bg-rose-50 dark:bg-rose-900/20',         border: 'border-rose-200 dark:border-rose-800',       time: '16h 40m', desc: 'Elite level challenge' },
  { count: 1200, label: 'Topper 🏆',   emoji: '🎯', color: 'from-yellow-400 to-orange-500',    bg: 'bg-yellow-50 dark:bg-yellow-900/20',     border: 'border-yellow-200 dark:border-yellow-800',   time: '20h',     desc: 'Complete mastery – all 1200!' },
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

/* ─── Helpers ───────────────────────────────────────────────────────────── */
const calcTotalSeconds = (count) => (count === 'All' ? questions.length : parseInt(count) || 200) * 60;

const formatTime = (secs) => {
  if (secs === null || secs === undefined) return '--:--:--';
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

const getRank = (pct) => {
  if (pct >= 90) return { label: 'Topper 🏆',              color: 'text-yellow-500' };
  if (pct >= 75) return { label: 'Distinction ⭐',          color: 'text-purple-500' };
  if (pct >= 60) return { label: 'First Class 🎖️',         color: 'text-blue-500' };
  if (pct >= 45) return { label: 'Pass ✅',                 color: 'text-green-500' };
  return           { label: 'Needs More Practice 📚',       color: 'text-red-500' };
};

/* ════════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════════════════════════════════════ */
const ProgressTracker = () => {
  /* ── Persistent state ── */
  const [userDetails,       setUserDetails]       = useLocalStorage('upbed_user_details', null);
  const [quizState,         setQuizState]         = useLocalStorage('upbed_quiz_state', 'registration');
  const [currentQuestions,  setCurrentQuestions]  = useLocalStorage('upbed_quiz_questions', []);
  const [currentIndex,      setCurrentIndex]      = useLocalStorage('upbed_quiz_index', 0);
  const [score,             setScore]             = useLocalStorage('upbed_quiz_score', 0);        // correct count
  const [wrongCount,        setWrongCount]        = useLocalStorage('upbed_quiz_wrong', 0);        // ★ NEW: wrong count
  const [answers,           setAnswers]           = useLocalStorage('upbed_quiz_answers', []);
  const [timerEndTime,      setTimerEndTime]      = useLocalStorage('upbed_quiz_end_time', null);
  const [timeTaken,         setTimeTaken]         = useLocalStorage('upbed_quiz_time_taken', null);

  /* ── Ephemeral state ── */
  const [selectedOption, setSelectedOption] = useState(null);
  const [timeLeft,       setTimeLeft]       = useState(null);
  const [name,           setName]           = useState('');
  const [email,          setEmail]          = useState('');
  const [phone,          setPhone]          = useState('');
  const [selectedCat,    setSelectedCat]    = useState(null);
  const [reviewFilter,   setReviewFilter]   = useState('all');
  const [expandedIdx,    setExpandedIdx]    = useState(null);
  const timerRef = useRef(null);

  /* ── Derived marks (live during quiz + results) ── */
  const liveMarks = calcMarks(score, wrongCount, currentQuestions.length);

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

  /* ── Auto-advance / fix stale localStorage states ── */
  useEffect(() => {
    const staleStates = ['registration', 'start', 'success'];
    if (userDetails && staleStates.includes(quizState)) setQuizState('category');
    if (quizState === 'playing' && (!currentQuestions || currentQuestions.length === 0)) {
      setQuizState(userDetails ? 'category' : 'registration');
    }
  }, []);

  /* ── Hard reset ── */
  const handleReset = () => {
    setUserDetails(null);
    setQuizState('registration');
    setCurrentQuestions([]);
    setCurrentIndex(0);
    setScore(0);
    setWrongCount(0);
    setAnswers([]);
    setTimerEndTime(null);
    setTimeTaken(null);
    setSelectedOption(null);
    setTimeLeft(null);
    setSelectedCat(null);
    setName('');
    setEmail('');
    setPhone('');
  };

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
    setWrongCount(0);         // ★ reset wrong counter
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
    const q         = currentQuestions[currentIndex];
    const isCorrect = option === q.correctAnswer;

    // ★ Update correct / wrong counters
    if (isCorrect) {
      setScore(score + 1);
    } else {
      setWrongCount(wrongCount + 1);
    }

    const newAnswers = [...answers, { question: q, selected: option, isCorrect }];
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
    let correct = 0, incorrect = 0;
    answers.forEach(ans => {
      const sub = ans.question.subject;
      if (!subjects[sub]) subjects[sub] = { total: 0, correct: 0, wrong: 0 };
      subjects[sub].total++;
      if (ans.isCorrect) { subjects[sub].correct++; correct++; }
      else               { subjects[sub].wrong++;   incorrect++; }
    });
    const unanswered = currentQuestions.length - answers.length;
    const accuracy   = Math.round((correct / answers.length) * 100) || 0;

    // ★ Negative marking breakdown
    const marksData = calcMarks(correct, incorrect, currentQuestions.length);

    // Subject marks
    const subjectMarks = {};
    Object.entries(subjects).forEach(([sub, s]) => {
      subjectMarks[sub] = calcMarks(s.correct, s.wrong, s.total);
    });

    const needsImprovement = Object.entries(subjects)
      .filter(([, s]) => (s.correct / s.total) < 0.5)
      .map(([sub]) => sub);
    const strengths = Object.entries(subjects)
      .filter(([, s]) => (s.correct / s.total) >= 0.75)
      .map(([sub]) => sub);

    return { subjects, subjectMarks, correct, incorrect, unanswered, accuracy, marksData, needsImprovement, strengths };
  }, [answers, currentQuestions.length]);

  /* ── Filtered review list ── */
  const reviewList = useMemo(() => {
    if (reviewFilter === 'correct') return answers.filter(a => a.isCorrect);
    if (reviewFilter === 'wrong')   return answers.filter(a => !a.isCorrect);
    return answers;
  }, [answers, reviewFilter]);

  const isTimerWarning  = timeLeft !== null && timeLeft < 300;
  const isTimerCritical = timeLeft !== null && timeLeft < 60;

  // Use marks percentage for rank (not raw correct %)
  const finalMarks   = analytics?.marksData ?? liveMarks;
  const scorePercent = finalMarks.percentage;
  const rank         = getRank(scorePercent);

  /* ═══════════════════════════════════════════════════════════════════════
     RENDER
  ═══════════════════════════════════════════════════════════════════════ */
  return (
    <div className="max-w-5xl mx-auto space-y-8 fade-in">

      {/* ── Page header ── */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-3xl font-extrabold mb-1">Test Yourself</h2>
          <p className="text-slate-500 text-sm">
            Choose your level → Start Practicing → Get your Report
          </p>
        </div>
        {userDetails && quizState !== 'registration' && (
          <button
            onClick={handleReset}
            className="text-xs text-slate-400 hover:text-red-500 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" /> Change User
          </button>
        )}
      </div>

      {/* ★ Negative Marking Notice banner */}
      <div className="flex items-start gap-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl px-5 py-4 text-sm text-amber-800 dark:text-amber-200">
        <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-amber-500" />
        <div>
          <span className="font-bold">UP B.Ed JEE Negative Marking Active: </span>
          Correct answer = <span className="font-bold text-green-600 dark:text-green-400">+1 mark</span> &nbsp;|&nbsp;
          Wrong answer = <span className="font-bold text-red-600 dark:text-red-400">−1/3 mark</span> &nbsp;|&nbsp;
          Unattempted = <span className="font-bold">0 marks</span>
        </div>
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
              { label: 'Full Name',       type: 'text',  val: name,  set: setName,  Icon: User,  ph: 'Ramesh Kumar' },
              { label: 'Email Address',   type: 'email', val: email, set: setEmail, Icon: Mail,  ph: 'ramesh@example.com' },
              { label: 'Mobile Number',   type: 'tel',   val: phone, set: setPhone, Icon: Phone, ph: '+91 9876543210' },
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
                <div className={`absolute top-0 left-0 right-0 h-1 rounded-t-2xl bg-gradient-to-r ${cat.color} ${selectedCat?.count === cat.count ? 'opacity-100' : 'opacity-0 group-hover:opacity-60'} transition-opacity`} />

                <div className="flex items-start justify-between mb-3">
                  <span className="text-3xl">{cat.emoji}</span>
                  {selectedCat?.count === cat.count && (
                    <span className="bg-primary-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">Selected</span>
                  )}
                </div>

                <div className={`text-4xl font-black mb-1 bg-gradient-to-r ${cat.color} bg-clip-text text-tran
