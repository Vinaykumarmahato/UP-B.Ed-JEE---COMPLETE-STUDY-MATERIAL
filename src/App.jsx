import React, { useState } from 'react';
import { BookOpen, Calendar, Brain, BarChart3, TrendingUp, Sun, Moon, Download, Share2, Menu, X, BookMarked, Play } from 'lucide-react';
import { useLocalStorage } from './hooks/useLocalStorage';
import Home from './components/Home';
import QuestionBank from './components/QuestionBank';
import StudyPlan from './components/StudyPlan';
import Predictions from './components/Predictions';
import FrequencyAnalyzer from './components/FrequencyAnalyzer';
import ProgressTracker from './components/ProgressTracker';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [isDarkMode, setIsDarkMode] = useLocalStorage('upbed_theme', false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'UP B.Ed JEE Prep Portal',
        text: 'Check out this awesome interactive preparation portal for UP B.Ed JEE!',
        url: window.location.href,
      }).catch(console.error);
    } else {
      alert('Share feature is not supported on this browser. You can copy the URL: ' + window.location.href);
    }
  };

  const handleDownloadNotes = () => {
    const content = "UP B.Ed JEE 2026 - Quick Revision Notes\n\n" + 
      "1. India's Independence: 15 Aug 1947\n" + 
      "2. Constitution Adopted: 26 Nov 1949\n" + 
      "3. First President: Dr. Rajendra Prasad\n" +
      "4. Gandhi's Education Philosophy: Nai Talim\n" +
      "5. Montessori Principle: Free discovery by the child\n\n" +
      "For full study material, visit the 15-Day Plan on the portal!";
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'UP_BEd_JEE_Notes.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const navItems = [
    { id: 'home', label: 'Home', icon: <BookOpen className="w-5 h-5" /> },
    { id: 'questions', label: 'Question Bank', icon: <BookMarked className="w-5 h-5" /> },
    { id: 'plan', label: '15-Day Plan', icon: <Calendar className="w-5 h-5" /> },
    { id: 'predictions', label: 'AI Predictions', icon: <Brain className="w-5 h-5" /> },
    { id: 'analyzer', label: 'Frequency', icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'tracker', label: 'Test yourself', icon: <TrendingUp className="w-5 h-5" /> },
  ];

  const renderPage = () => {
    switch (currentPage) {
      case 'home': return <Home setCurrentPage={setCurrentPage} />;
      case 'questions': return <QuestionBank />;
      case 'plan': return <StudyPlan />;
      case 'predictions': return <Predictions />;
      case 'analyzer': return <FrequencyAnalyzer />;
      case 'tracker': return <ProgressTracker />;
      default: return <Home setCurrentPage={setCurrentPage} />;
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'dark bg-slate-900 text-slate-50' : 'bg-slate-50 text-slate-900'}`}>
      {/* Header/Navigation */}
      <header className={`sticky top-0 z-50 border-b transition-all duration-300 ${isDarkMode ? 'bg-slate-900/80 border-slate-800 backdrop-blur-md' : 'bg-white/80 border-slate-100 backdrop-blur-md'}`}>
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="flex justify-between items-center h-20 md:h-24">
            {/* Branding */}
            <a href="https://advindiancoder.com" target="_blank" rel="noopener noreferrer" className="flex items-center group">
              <div className="relative">
                <img 
                  src="/adv-logo.png" 
                  alt="Logo" 
                  className="h-10 w-10 md:h-14 md:w-14 object-contain transition-transform group-hover:scale-110"
                />
                <div className="absolute -inset-1 bg-primary-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
              <div className="ml-3">
                <h1 className="text-sm md:text-xl font-black text-slate-800 dark:text-white leading-none tracking-tight">ADV EXAM</h1>
                <p className="text-[10px] md:text-xs font-bold text-primary-600 dark:text-primary-400 mt-1 uppercase tracking-[0.1em]">Preparation Portal</p>
              </div>
            </a>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center bg-slate-100/50 dark:bg-slate-800/50 p-1.5 rounded-2xl border border-slate-200/50 dark:border-slate-700/50">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setCurrentPage(item.id)}
                  className={`flex flex-col items-center justify-center px-4 py-2 rounded-xl transition-all duration-300 group ${
                    currentPage === item.id 
                      ? 'bg-white dark:bg-slate-700 shadow-sm text-primary-600 dark:text-primary-400 scale-105' 
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <div className={`mb-1 transition-transform group-hover:-translate-y-0.5 ${currentPage === item.id ? 'text-primary-500' : ''}`}>
                    {React.cloneElement(item.icon, { className: "w-5 h-5" })}
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider">{item.label}</span>
                </button>
              ))}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center space-x-2 md:space-x-4">
              <button 
                onClick={toggleTheme} 
                className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-600"
              >
                {isDarkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5" />}
              </button>
              
              <div className="hidden sm:flex items-center space-x-2">
                <button 
                  onClick={handleDownloadNotes}
                  className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all flex items-center"
                >
                  <Download className="w-4 h-4 mr-2 text-primary-500" />
                  Notes
                </button>
                <button 
                  onClick={handleShare}
                  className="px-5 py-2.5 rounded-xl bg-primary-600 text-white shadow-lg shadow-primary-500/20 hover:bg-primary-700 hover:scale-105 transition-all flex items-center font-bold text-sm"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </button>
              </div>

              {/* Mobile Toggle */}
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 slide-down">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <div className="flex items-center justify-between px-3 py-2 mb-2 border-b border-slate-100 dark:border-slate-700">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Quick Actions</span>
                <button onClick={() => setIsMenuOpen(false)}><X className="w-5 h-5 text-slate-400" /></button>
              </div>
              <button 
                onClick={() => { handleDownloadNotes(); setIsMenuOpen(false); }}
                className="flex items-center w-full px-4 py-3 rounded-xl text-sm font-bold bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-200"
              >
                <Download className="w-5 h-5 mr-3 text-blue-500" /> Download Notes
              </button>
              <button 
                onClick={() => { handleShare(); setIsMenuOpen(false); }}
                className="flex items-center w-full px-4 py-3 rounded-xl text-sm font-bold bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300"
              >
                <Share2 className="w-5 h-5 mr-3 text-primary-500" /> Share Portal
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 md:py-8 slide-up pb-24 md:pb-8">
        {renderPage()}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 shadow-2xl border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <div className="grid grid-cols-6 h-16">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { setCurrentPage(item.id); setIsMenuOpen(false); }}
              className={`flex flex-col items-center justify-center gap-0.5 text-xs font-medium transition-colors ${
                currentPage === item.id
                  ? 'text-primary-600 dark:text-primary-400'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <span className={`p-1 rounded-lg ${currentPage === item.id ? 'bg-primary-50 dark:bg-primary-900/30' : ''}`}>
                {item.icon}
              </span>
              <span className="truncate w-full text-center px-0.5" style={{fontSize: '9px'}}>
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </nav>

      {/* Footer */}
      <footer className={`py-4 md:py-6 text-center border-t ${isDarkMode ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-500'} hidden md:block`}>
        <p className="font-medium text-xs md:text-sm">
          Developed by ADV Indian Code
        </p>
        <div className="mt-3 flex justify-center">
          <a 
            href="https://www.youtube.com/@ADVIndianCoder" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="inline-flex items-center px-5 py-2 bg-[#FF0000] hover:bg-[#CC0000] text-white font-bold rounded-full transition-colors shadow-md hover:shadow-lg text-sm"
          >
            <Play className="w-4 h-4 mr-2 fill-current" />
            Subscribe
          </a>
        </div>
      </footer>

    </div>
  );
}

export default App;
