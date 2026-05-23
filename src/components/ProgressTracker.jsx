import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Play, Trophy, XCircle, CheckCircle, RefreshCw, AlertTriangle, User, Mail, Phone, ShieldCheck, BarChart2, Clock } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { questions } from '../data';

const ProgressTracker = () => {
  const [userDetails, setUserDetails] = useLocalStorage('upbed_user_details', null);
  const [quizState, setQuizState] = useLocalStorage('upbed_quiz_state', 'registration'); // registration, start, playing, results
  
  const [currentQuestions, setCurrentQuestions] = useLocalStorage('upbed_quiz_questions', []);
  const [currentIndex, setCurrentIndex] = useLocalStorage('upbed_quiz_index', 0);
  const [score, setScore] = useLocalStorage('upbed_quiz_score', 0);
  const [answers, setAnswers] = useLocalStorage('upbed_quiz_answers', []);
  const [selectedOption, setSelectedOption] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [timerEndTime, setTimerEndTime] = useLocalStorage('upbed_quiz_end_time', null);
  const [timeTaken, setTimeTaken] = useLocalStorage('upbed_quiz_time_taken', null); // stored as seconds
  const timerRef = useRef(null);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [questionCount, setQuestionCount] = useState('100');

  const QUESTION_OPTIONS = [50, 100, 200, 300, 600, 1200, 'All'];

  // Calculate total exam seconds: 1 minute per question
  const calcTotalSeconds = (count) => {
    const n = (count === 'All') ? questions.length : parseInt(count) || 100;
    return n * 60;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if(name && email && phone) {
      // Show thank you screen first
      const totalSecs = calcTotalSeconds(questionCount);
      setTimerEndTime(Date.now() + totalSecs * 1000); // store absolute end time
      setUserDetails({ name, email, phone, questionCount });
      setQuizState('success');

      // Send email in background
      try {
        fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            access_key: 'b3b4c5b4-37cd-4195-b15a-8df6644064db',
            subject: 'New Student Registered - UP B.Ed Mock Test',
            from_name: 'UP B.Ed Portal',
            Name: name,
            Email: email,
            Mobile: phone,
            'Questions Selected': questionCount === 'All' ? 'All Questions' : questionCount + ' Questions'
          })
        });
      } catch (error) {
        console.error("Email sending failed", error);
      }

      // Auto-move to quiz start after 3 seconds
      setTimeout(() => {
        setQuizState('start');
      }, 3000);
    }
  };

  const startQuiz = () => {
    const count = userDetails?.questionCount;
    let selected;

    if (!count || count === 'All') {
      selected = [...questions].sort(() => 0.5 - Math.random());
    } else {
      const total = parseInt(count);
      const subjects = [...new Set(questions.map(q => q.subject))];
      const perSubject = Math.floor(total / subjects.length);
      let remainder = total % subjects.length;

      selected = [];
      subjects.forEach(sub => {
        const subQs = questions.filter(q => q.subject === sub).sort(() => 0.5 - Math.random());
        const take = perSubject + (remainder > 0 ? 1 : 0);
        if (remainder > 0) remainder--;
        selected.push(...subQs.slice(0, take));
      });

      selected = selected.sort(() => 0.5 - Math.random());
    }

    setCurrentQuestions(selected);
    setCurrentIndex(0);
    setScore(0);
    setAnswers([]);
    setSelectedOption(null);
    setQuizState('playing');
  };

  // ---- TIMER ----
  useEffect(() => {
    if (!timerEndTime || quizState === 'results' || quizState === 'registration' || quizState === 'success') {
      clearInterval(timerRef.current);
      return;
    }
    const tick = () => {
      const remaining = Math.floor((timerEndTime - Date.now()) / 1000);
      if (remaining <= 0) {
        clearInterval(timerRef.current);
        setTimeLeft(0);
        setTimeTaken(calcTotalSeconds(userDetails?.questionCount)); // full time used
        setQuizState('results');
      } else {
        setTimeLeft(remaining);
      }
    };
    tick();
    timerRef.current = setInterval(tick, 1000);
    return () => clearInterval(timerRef.current);
  }, [quizState, timerEndTime]);

  const formatTime = (secs) => {
    if (secs === null || secs === undefined) return '--:--:--';
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  };

  const isTimerWarning  = timeLeft !== null && timeLeft < 300; // under 5 mins
  const isTimerCritical = timeLeft !== null && timeLeft < 60;  // under 1 min


  const handleAnswer = (option) => {
    if (selectedOption) return; 
    
    setSelectedOption(option);
    const isCorrect = option === currentQuestions[currentIndex].correctAnswer;
    
    if (isCorrect) {
      setScore(score + 1);
    }
    
    setAnswers([...answers, {
      question: currentQuestions[currentIndex],
      selected: option,
      isCorrect
    }]);

    setTimeout(() => {
      if (currentIndex < currentQuestions.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setSelectedOption(null);
      } else {
        // Save time taken before ending
        if (timerEndTime) {
          const elapsed = calcTotalSeconds(userDetails?.questionCount) - Math.floor((timerEndTime - Date.now()) / 1000);
          setTimeTaken(Math.max(0, elapsed));
        }
        setQuizState('results');
      }
    }, 1000);
  };

  // Compute analytics for dashboard
  const analytics = useMemo(() => {
    if (answers.length === 0) return null;
    const subjects = {};
    let correct = 0;
    let incorrect = 0;

    answers.forEach(ans => {
      const sub = ans.question.subject;
      if (!subjects[sub]) subjects[sub] = { total: 0, correct: 0 };
      subjects[sub].total += 1;
      if (ans.isCorrect) {
        subjects[sub].correct += 1;
        correct += 1;
      } else {
        incorrect += 1;
      }
    });

    const needsImprovement = Object.entries(subjects)
      .filter(([sub, stats]) => (stats.correct / stats.total) < 0.5)
      .map(([sub]) => sub);

    return { subjects, correct, incorrect, needsImprovement };
  }, [answers]);

  // If user details exist but state is registration, push to start
  React.useEffect(() => {
    if (userDetails && quizState === 'registration') {
      setQuizState('start');
    }
  }, [userDetails, quizState, setQuizState]);

  return (
    <div className="max-w-5xl mx-auto space-y-8 fade-in">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-extrabold mb-4">Test Yourself</h2>
        <p className="text-slate-500 text-lg">Test your readiness with a complete mock test.</p>
      </div>

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
            <p className="text-slate-500 mt-2">Enter your details to take the mock test and unlock your personalized analytics dashboard.</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4 text-left">
            
            <div>
              <label className="block text-sm font-medium mb-1">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400" />
                </div>
                <input required type="text" name="Name" value={name} onChange={e => setName(e.target.value)} className="w-full pl-10 pr-3 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-primary-500 outline-none transition-all" placeholder="John Doe" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input required type="email" name="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full pl-10 pr-3 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-primary-500 outline-none transition-all" placeholder="john@example.com" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Mobile Number</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-slate-400" />
                </div>
                <input required type="tel" name="Mobile Number" value={phone} onChange={e => setPhone(e.target.value)} className="w-full pl-10 pr-3 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-primary-500 outline-none transition-all" placeholder="+91 9876543210" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Number of Questions</label>
              <div className="grid grid-cols-4 gap-2">
                {QUESTION_OPTIONS.map(opt => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setQuestionCount(opt)}
                    className={`py-2 rounded-xl font-bold text-sm transition-all border-2 ${
                      questionCount === opt
                        ? 'bg-primary-600 text-white border-primary-600 shadow-md'
                        : 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-primary-400'
                    }`}
                  >
                    {opt === 'All' ? '🎯 All' : opt}
                  </button>
                ))}
              </div>
              <p className="text-xs text-slate-400 mt-2">
                {questionCount === 'All'
                  ? `All ${questions.length} questions — equally mixed from all subjects`
                  : `${questionCount} questions — equally distributed across all subjects`}
              </p>
            </div>
            
            <button type="submit" className="w-full mt-6 px-8 py-4 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 hover:shadow-lg transition-all flex items-center justify-center">
              Register & Continue
            </button>
          </form>
        </div>
      )}

      {quizState === 'success' && (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-12 text-center shadow-sm border border-slate-100 dark:border-slate-700 slide-up max-w-xl mx-auto">
          <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
            <CheckCircle className="w-14 h-14 text-green-500" />
          </div>
          <h3 className="text-3xl font-extrabold mb-3 text-green-600 dark:text-green-400">
            Thank You, {userDetails?.name}! 🎉
          </h3>
          <p className="text-slate-600 dark:text-slate-400 text-lg mb-2">
            You have successfully registered.
          </p>
          <p className="text-slate-500 dark:text-slate-500 text-sm">
            Preparing your mock test... Please wait a moment.
          </p>
          <div className="mt-6 flex justify-center gap-1">
            <div className="w-2 h-2 rounded-full bg-primary-400 animate-bounce" style={{animationDelay: '0ms'}}></div>
            <div className="w-2 h-2 rounded-full bg-primary-500 animate-bounce" style={{animationDelay: '150ms'}}></div>
            <div className="w-2 h-2 rounded-full bg-primary-600 animate-bounce" style={{animationDelay: '300ms'}}></div>
          </div>
        </div>
      )}

      {quizState === 'start' && (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-12 text-center shadow-sm border border-slate-100 dark:border-slate-700 slide-up max-w-2xl mx-auto">
          <div className="w-24 h-24 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <Trophy className="w-12 h-12 text-primary-600 dark:text-primary-400" />
          </div>
          <h3 className="text-2xl font-bold mb-2">Welcome, {userDetails?.name}!</h3>
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 px-5 py-3 rounded-2xl mb-4">
              <span className="text-3xl font-extrabold text-primary-600 dark:text-primary-400">
                {userDetails?.questionCount === 'All' ? questions.length : userDetails?.questionCount}
              </span>
              <span className="text-slate-600 dark:text-slate-400 font-medium text-left">
                Questions selected<br />
                <span className="text-xs text-slate-400">Equally mixed from all subjects</span>
              </span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              Once completed, you will unlock your personalized performance dashboard with subject-wise analytics.
            </p>
          </div>
          <button 
            onClick={startQuiz}
            className="px-8 py-4 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 hover:shadow-lg transition-all flex items-center mx-auto"
          >
            <Play className="w-5 h-5 mr-2" /> Start Mock Test
          </button>
        </div>
      )}

      {quizState === 'playing' && currentQuestions.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 md:p-10 slide-up">
          {/* Timer + Progress bar */}
          <div className="mb-8">
            {/* Timer Badge */}
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4 font-mono font-bold text-lg ${
              isTimerCritical
                ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 animate-pulse'
                : isTimerWarning
                ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200'
            }`}>
              <Clock className="w-5 h-5" />
              {formatTime(timeLeft)}
            </div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                Question {currentIndex + 1} of {currentQuestions.length}
              </span>
              <span className="text-sm font-bold text-primary-600 dark:text-primary-400">
                {Math.round(((currentIndex) / currentQuestions.length) * 100)}% Completed
              </span>
            </div>
            <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary-500 rounded-full transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / currentQuestions.length) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="mb-10">
            <div className="flex justify-between mb-4">
               <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300">
                {currentQuestions[currentIndex].subject}
               </span>
            </div>
            <h3 className="text-2xl font-bold leading-relaxed mb-8">
              {currentQuestions[currentIndex].text}
            </h3>
            <div className="grid gap-4">
              {Object.entries(currentQuestions[currentIndex].options).map(([key, value]) => {
                let btnStyle = "border-slate-200 dark:border-slate-700 hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-slate-700";
                
                if (selectedOption) {
                  if (key === currentQuestions[currentIndex].correctAnswer) {
                    btnStyle = "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400";
                  } else if (key === selectedOption) {
                    btnStyle = "border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400";
                  } else {
                    btnStyle = "border-slate-100 dark:border-slate-800 opacity-50";
                  }
                }

                return (
                  <button
                    key={key}
                    onClick={() => handleAnswer(key)}
                    disabled={selectedOption !== null}
                    className={`p-5 rounded-xl border-2 transition-all text-left flex items-center ${btnStyle}`}
                  >
                    <span className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center font-bold mr-4 shrink-0">
                      {key}
                    </span>
                    <span className="font-medium text-lg">{value}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {quizState === 'results' && analytics && (
        <div className="space-y-6 slide-up">
          {/* Dashboard Header */}
          <div className="bg-slate-900 rounded-3xl p-8 md:p-10 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500 opacity-10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div>
                <h2 className="text-3xl md:text-4xl font-extrabold mb-2">{userDetails?.name}'s Dashboard</h2>
                <p className="text-slate-400 text-lg flex items-center gap-4">
                  <span><Mail className="w-4 h-4 inline mr-1" /> {userDetails?.email}</span>
                  <span><Phone className="w-4 h-4 inline mr-1" /> {userDetails?.phone}</span>
                </p>
              </div>
              <div className="text-center bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 min-w-[200px]">
                <div className="text-5xl font-extrabold text-primary-400 mb-1">
                  {Math.round((score / currentQuestions.length) * 100)}%
                </div>
                <p className="text-slate-300 font-medium">Final Score</p>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
             <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-4">
                <div className="p-4 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
                  <BarChart2 className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-slate-500 text-sm font-bold uppercase">Total Qs</p>
                  <p className="text-2xl font-black">{currentQuestions.length}</p>
                </div>
             </div>
             <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-4">
                <div className="p-4 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-xl">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-slate-500 text-sm font-bold uppercase">Correct</p>
                  <p className="text-2xl font-black text-green-600 dark:text-green-400">{analytics.correct}</p>
                </div>
             </div>
             <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-4">
                <div className="p-4 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl">
                  <XCircle className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-slate-500 text-sm font-bold uppercase">Wrong</p>
                  <p className="text-2xl font-black text-red-600 dark:text-red-400">{analytics.incorrect}</p>
                </div>
             </div>
             <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-4">
                <div className="p-4 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl">
                  <Clock className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-slate-500 text-sm font-bold uppercase">Time Taken</p>
                  <p className="text-xl font-black text-purple-600 dark:text-purple-400 font-mono">
                    {timeTaken ? formatTime(timeTaken) : '--:--:--'}
                  </p>
                </div>
             </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Subject Analysis */}
            <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
              <h3 className="text-xl font-bold mb-6 flex items-center"><BarChart2 className="w-5 h-5 mr-2 text-primary-500" /> Subject-wise Analytics</h3>
              <div className="space-y-4">
                {Object.entries(analytics.subjects).map(([subject, stats]) => {
                  const percent = Math.round((stats.correct / stats.total) * 100);
                  return (
                    <div key={subject}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-bold text-slate-700 dark:text-slate-300">{subject}</span>
                        <span className="font-medium">{stats.correct}/{stats.total} ({percent}%)</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${percent >= 70 ? 'bg-green-500' : percent >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{width: `${percent}%`}}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Needs Improvement */}
            <div className="bg-red-50 dark:bg-red-900/10 p-6 md:p-8 rounded-2xl border border-red-100 dark:border-red-900/30 shadow-sm">
              <h3 className="text-xl font-bold mb-6 flex items-center text-red-700 dark:text-red-400"><AlertTriangle className="w-5 h-5 mr-2" /> Needs Improvement</h3>
              {analytics.needsImprovement.length > 0 ? (
                <div>
                  <p className="text-slate-600 dark:text-slate-400 mb-4">You scored below 50% in the following subjects. Focus your studies here:</p>
                  <ul className="space-y-3">
                    {analytics.needsImprovement.map(sub => (
                      <li key={sub} className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-red-200 dark:border-red-800/50 flex items-center font-bold text-slate-700 dark:text-slate-200">
                        <div className="w-2 h-2 rounded-full bg-red-500 mr-3"></div> {sub}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Trophy className="w-8 h-8" />
                  </div>
                  <h4 className="font-bold text-lg text-slate-800 dark:text-slate-200">Excellent Work!</h4>
                  <p className="text-slate-500 text-sm mt-2">You scored above 50% in all subjects. No critical weak points found!</p>
                </div>
              )}
            </div>
          </div>

          <div className="text-center pt-8 pb-4">
            <button 
              onClick={startQuiz}
              className="px-8 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors inline-flex items-center border border-slate-200 dark:border-slate-700 shadow-sm"
            >
              <RefreshCw className="w-5 h-5 mr-2" /> Retake Mock Test
            </button>
          </div>
          
          <h3 className="text-2xl font-bold pt-12 border-t border-slate-200 dark:border-slate-800 mb-6">Review All Questions</h3>
          <div className="space-y-4">
            {answers.map((answer, idx) => (
              <div key={idx} className={`p-6 rounded-2xl border ${answer.isCorrect ? 'bg-green-50/50 border-green-100 dark:bg-green-900/10 dark:border-green-900/30' : 'bg-red-50/50 border-red-100 dark:bg-red-900/10 dark:border-red-900/30'}`}>
                <div className="flex justify-between items-start mb-4">
                   <div className="flex items-start">
                     {answer.isCorrect ? (
                       <CheckCircle className="w-6 h-6 text-green-500 mr-3 shrink-0" />
                     ) : (
                       <XCircle className="w-6 h-6 text-red-500 mr-3 shrink-0" />
                     )}
                     <h4 className="font-bold text-lg">{answer.question.text}</h4>
                   </div>
                   <span className="text-xs font-bold px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded whitespace-nowrap ml-4">
                     {answer.question.subject}
                   </span>
                </div>
                
                <div className="ml-9 space-y-2 text-sm">
                  <p className="text-slate-600 dark:text-slate-400">
                    Your Answer: <span className={answer.isCorrect ? "font-bold text-green-600" : "font-bold text-red-600"}>
                      {answer.question.options[answer.selected]}
                    </span>
                  </p>
                  {!answer.isCorrect && (
                    <p className="text-slate-600 dark:text-slate-400">
                      Correct Answer: <span className="font-bold text-green-600">
                        {answer.question.options[answer.question.correctAnswer]}
                      </span>
                    </p>
                  )}
                  <div className="pt-2 mt-2 border-t border-slate-200 dark:border-slate-700/50 text-slate-500">
                    <p>{answer.question.explanation}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressTracker;
