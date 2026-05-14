import React, { useState } from 'react';
import { Search, ChevronLeft, ChevronRight, Eye, RefreshCw, AlertCircle, Bookmark, Target } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { questions } from '../data';

const QuestionBank = () => {
  const subjects = ["All", "General Knowledge", "Teaching Aptitude", "Hindi Grammar", "English Grammar", "Psychology", "Reasoning"];
  const [activeSubject, setActiveSubject] = useLocalStorage("upbed_qb_subject", "All");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentIndex, setCurrentIndex] = useLocalStorage("upbed_qb_index", 0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [savedQuestions, setSavedQuestions] = useLocalStorage("upbed_saved_questions", []);

  // Filter questions
  const filteredQuestions = questions.filter(q => {
    const matchesSubject = activeSubject === "All" || q.subject === activeSubject;
    const matchesSearch = q.text.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (q.explanation && q.explanation.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSubject && matchesSearch;
  });

  const currentQuestion = filteredQuestions[currentIndex];

  const handleNext = () => {
    if (currentIndex < filteredQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowAnswer(false);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowAnswer(false);
    }
  };

  const toggleSave = (id) => {
    if (savedQuestions.includes(id)) {
      setSavedQuestions(savedQuestions.filter(qId => qId !== id));
    } else {
      setSavedQuestions([...savedQuestions, id]);
    }
  };

  return (
    <div className="space-y-4 md:space-y-6 fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 md:gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold">Question Bank</h2>
          <p className="text-slate-500 text-sm md:text-base">Master the most frequently asked questions.</p>
        </div>
        
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search keyword..." 
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentIndex(0);
              setShowAnswer(false);
            }}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-shadow"
          />
        </div>
      </div>

      {/* Subject Tabs */}
      <div className="flex overflow-x-auto pb-2 hide-scrollbar gap-2">
        {subjects.map(subject => (
          <button
            key={subject}
            onClick={() => {
              setActiveSubject(subject);
              setCurrentIndex(0);
              setShowAnswer(false);
            }}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeSubject === subject 
                ? 'bg-primary-600 text-white shadow-md' 
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
            }`}
          >
            {subject}
          </button>
        ))}
      </div>

      {filteredQuestions.length > 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-4 md:p-6 lg:p-8">
          <div className="flex flex-wrap justify-between items-center mb-4 md:mb-6 gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center px-2 md:px-3 py-1 rounded-full text-xs font-semibold bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-400">
                {currentQuestion.subject}
              </span>
              {currentQuestion.isReal ? (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                  📜 Previous Year
                </span>
              ) : (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400">
                  🤖 AI Predicted
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs md:text-sm font-medium text-slate-500">
                {currentIndex + 1}/{filteredQuestions.length}
              </span>
              <button onClick={() => toggleSave(currentQuestion.id)} className={`p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors ${savedQuestions.includes(currentQuestion.id) ? 'text-orange-500' : 'text-slate-400'}`}>
                <Bookmark className="w-5 h-5" fill={savedQuestions.includes(currentQuestion.id) ? "currentColor" : "none"} />
              </button>
            </div>
          </div>

          <div className="mb-6 md:mb-8">
            <h3 className="text-lg md:text-xl lg:text-2xl font-bold leading-relaxed mb-4 md:mb-6">
              Q: {currentQuestion.text}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              {Object.entries(currentQuestion.options).map(([key, value]) => (
                <div 
                  key={key} 
                  className={`p-4 rounded-xl border-2 transition-all ${
                    showAnswer && key === currentQuestion.correctAnswer 
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                      : showAnswer 
                        ? 'border-slate-100 dark:border-slate-700 opacity-50' 
                        : 'border-slate-100 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-700 cursor-pointer'
                  }`}
                  onClick={() => !showAnswer && setShowAnswer(true)}
                >
                  <span className="font-bold mr-3 text-slate-400">{key}.</span>
                  <span className="font-medium">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {!showAnswer ? (
            <button 
              onClick={() => setShowAnswer(true)}
              className="w-full py-4 bg-primary-50 dark:bg-slate-700 text-primary-700 dark:text-primary-300 rounded-xl font-bold hover:bg-primary-100 dark:hover:bg-slate-600 transition-colors flex justify-center items-center"
            >
              <Eye className="w-5 h-5 mr-2" /> Show Answer
            </button>
          ) : (
            <div className="bg-slate-50 dark:bg-slate-750/50 rounded-xl p-6 border border-slate-100 dark:border-slate-700 slide-up">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 rounded-lg shrink-0">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-lg text-green-700 dark:text-green-400 mb-2">
                    Correct Answer: {currentQuestion.correctAnswer}
                  </h4>
                  <p className="text-slate-700 dark:text-slate-300 mb-4">{currentQuestion.explanation}</p>
                  
                  <div className="flex flex-wrap gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                    {currentQuestion.isReal ? (
                      <>
                        {currentQuestion.frequency > 0 && (
                          <div className="flex items-center text-sm">
                            <RefreshCw className="w-4 h-4 text-green-600 dark:text-green-400 mr-2" />
                            <span className="text-slate-600 dark:text-slate-400">Asked: <strong className="text-green-600 dark:text-green-400">{currentQuestion.frequency} times</strong> in past exams</span>
                          </div>
                        )}
                        <div className="flex items-center text-sm">
                          <Target className="w-4 h-4 text-purple-500 mr-2" />
                          <span className="text-slate-600 dark:text-slate-400">Source: <strong className="text-purple-600 dark:text-purple-400">UP B.Ed JEE ({currentQuestion.sourceYear})</strong></span>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center text-sm">
                        <Target className="w-4 h-4 text-orange-500 mr-2" />
                        <span className="text-slate-600 dark:text-slate-400">Chances of appearing: <strong className="text-orange-600 dark:text-orange-400">{currentQuestion.probability}%</strong></span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex justify-between items-center mt-6 md:mt-8 pt-4 md:pt-6 border-t border-slate-100 dark:border-slate-700">
            <button 
              onClick={handlePrev} 
              disabled={currentIndex === 0}
              className={`flex items-center px-3 md:px-4 py-2 rounded-lg font-medium transition-colors text-sm md:text-base ${currentIndex === 0 ? 'text-slate-400 cursor-not-allowed' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
            >
              <ChevronLeft className="w-4 md:w-5 h-4 md:h-5 mr-1" /> Prev
            </button>
            
            <button 
              onClick={handleNext} 
              disabled={currentIndex === filteredQuestions.length - 1}
              className={`flex items-center px-4 md:px-6 py-2 bg-primary-600 text-white rounded-lg font-medium text-sm md:text-base hover:bg-primary-700 transition-colors ${currentIndex === filteredQuestions.length - 1 ? 'opacity-50 cursor-not-allowed' : 'shadow-md'}`}
            >
              Next <ChevronRight className="w-4 md:w-5 h-4 md:h-5 ml-1" />
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
          <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">No questions found</h3>
          <p className="text-slate-500">Try adjusting your search or filter criteria.</p>
        </div>
      )}
    </div>
  );
};

export default QuestionBank;
