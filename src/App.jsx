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
      <header className={`sticky top-0 z-50 shadow-md ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center cursor-pointer" onClick={() => setCurrentPage('home')}>
              <div className="bg-primary-600 text-white p-2 rounded-lg mr-3">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-orange-500">UP B.Ed JEE</h1>
                <p className="text-xs font-medium text-slate-500">Exam Prep Portal</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setCurrentPage(item.id)}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentPage === item.id 
                      ? (isDarkMode ? 'bg-slate-700 text-primary-400' : 'bg-primary-50 text-primary-700') 
                      : (isDarkMode ? 'text-slate-300 hover:bg-slate-700 hover:text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900')
                  }`}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </nav>

            {/* Actions */}
            <div className="hidden md:flex items-center space-x-4">
              <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                {isDarkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
              </button>
              <button onClick={handleDownloadNotes} className="flex items-center px-4 py-2 bg-slate-100 dark:bg-slate-700 rounded-md text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                <Download className="w-4 h-4 mr-2" /> Notes
              </button>
              <button onClick={handleShare} className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700 transition-colors">
                <Share2 className="w-4 h-4 mr-2" /> Share
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="flex md:hidden items-center">
              <button onClick={toggleTheme} className="p-2 mr-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700">
                {isDarkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
              </button>
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentPage(item.id);
                    setIsMenuOpen(false);
                  }}
                  className={`flex items-center w-full px-3 py-2 rounded-md text-base font-medium ${
                    currentPage === item.id 
                      ? (isDarkMode ? 'bg-slate-700 text-primary-400' : 'bg-primary-50 text-primary-700') 
                      : (isDarkMode ? 'text-slate-300 hover:bg-slate-700 hover:text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900')
                  }`}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 slide-up">
        {renderPage()}
      </main>

      {/* Footer */}
      <footer className={`py-6 text-center border-t ${isDarkMode ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-500'}`}>
        <p className="font-medium text-sm md:text-base">
          Developed by ADV Indian Code
        </p>
        <div className="mt-4 flex justify-center">
          <a 
            href="https://www.youtube.com/@ADVIndianCoder" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="inline-flex items-center px-6 py-2.5 bg-[#FF0000] hover:bg-[#CC0000] text-white font-bold rounded-full transition-colors shadow-md hover:shadow-lg"
          >
            <Play className="w-5 h-5 mr-2 fill-current" />
            Subscribe
          </a>
        </div>
      </footer>

    </div>
  );
}

export default App;
