import React from 'react';
import { BookMarked, Calendar, Brain, ArrowRight, Award, Clock, Target, TrendingUp } from 'lucide-react';

const Home = ({ setCurrentPage }) => {
  const stats = [
    { label: "Questions Analyzed", value: "700+", icon: <BookMarked className="w-6 h-6 text-blue-500" /> },
    { label: "Years of Data", value: "20", icon: <Clock className="w-6 h-6 text-orange-500" /> },
    { label: "Success Rate", value: "95%", icon: <Award className="w-6 h-6 text-green-500" /> },
    { label: "High Prob. Topics", value: "15", icon: <Target className="w-6 h-6 text-purple-500" /> }
  ];

  return (
    <div className="space-y-8 md:space-y-12 fade-in">
      {/* Hero Section */}
      <section className="text-center py-10 md:py-16 px-4 rounded-2xl md:rounded-3xl bg-gradient-to-br from-primary-900 via-primary-800 to-primary-600 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
          <div className="absolute -top-24 -left-24 w-64 md:w-96 h-64 md:h-96 rounded-full bg-white blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-40 md:w-64 h-40 md:h-64 rounded-full bg-orange-400 blur-3xl"></div>
        </div>
        
        <div className="relative z-10 max-w-3xl mx-auto space-y-4 md:space-y-6">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
            Crack UP B.Ed JEE <span className="text-orange-400">2026</span>
          </h1>
          <p className="text-base md:text-lg lg:text-xl text-primary-100 max-w-2xl mx-auto">
            Your ultimate 15-day smart preparation platform. Master 700+ high-frequency questions and AI-predicted topics for guaranteed success.
          </p>
          
          <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 md:gap-4 pt-4 md:pt-6">
            <button 
              onClick={() => setCurrentPage('questions')}
              className="w-full sm:w-auto px-6 md:px-8 py-3 md:py-4 bg-white text-primary-700 font-bold rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center group"
            >
              Study Questions
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={() => setCurrentPage('plan')}
              className="w-full sm:w-auto px-6 md:px-8 py-3 md:py-4 bg-orange-500 text-white font-bold rounded-full shadow-lg hover:shadow-xl hover:bg-orange-400 hover:-translate-y-1 transition-all flex items-center justify-center"
            >
              <Calendar className="mr-2 w-5 h-5" />
              15-Day Plan
            </button>
            <button 
              onClick={() => setCurrentPage('tracker')}
              className="w-full sm:w-auto px-6 md:px-8 py-3 md:py-4 bg-transparent border-2 border-white/30 text-white font-bold rounded-full hover:bg-white/10 transition-all flex items-center justify-center"
            >
              <Brain className="mr-2 w-5 h-5" />
              Test Yourself
            </button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white dark:bg-slate-800 p-4 md:p-6 rounded-xl md:rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center text-center hover:shadow-md transition-shadow">
            <div className="p-2 md:p-3 bg-slate-50 dark:bg-slate-700 rounded-full mb-2 md:mb-4">
              {stat.icon}
            </div>
            <h3 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white mb-1">{stat.value}</h3>
            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium">{stat.label}</p>
          </div>
        ))}
      </section>

      {/* Features Section */}
      <section className="space-y-6 md:space-y-8">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4">Smart Study Features</h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base">Everything you need to boost your score in the last 15 days of preparation.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-slate-800 dark:to-slate-750 p-6 md:p-8 rounded-2xl md:rounded-3xl relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform">
              <BookMarked className="w-32 md:w-48 h-32 md:h-48" />
            </div>
            <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3">Topic-wise Question Bank</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base mb-4 md:mb-6 relative z-10">Access 700+ questions from the last 20 years, categorized by subject with detailed explanations.</p>
            <button onClick={() => setCurrentPage('questions')} className="text-blue-600 font-semibold flex items-center relative z-10 hover:text-blue-700 text-sm md:text-base">
              Start Practicing <ArrowRight className="ml-1 w-4 h-4" />
            </button>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-slate-800 dark:to-slate-750 p-6 md:p-8 rounded-2xl md:rounded-3xl relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform text-orange-500">
              <Brain className="w-32 md:w-48 h-32 md:h-48" />
            </div>
            <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3">AI Predictions</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base mb-4 md:mb-6 relative z-10">Focus on what matters. Our AI analyzes 10+ years of trends to predict the highest probability questions for 2026.</p>
            <button onClick={() => setCurrentPage('predictions')} className="text-orange-600 font-semibold flex items-center relative z-10 hover:text-orange-700 text-sm md:text-base">
              View Predictions <ArrowRight className="ml-1 w-4 h-4" />
            </button>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-slate-800 dark:to-slate-750 p-6 md:p-8 rounded-2xl md:rounded-3xl relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform text-green-500">
              <TrendingUp className="w-32 md:w-48 h-32 md:h-48" />
            </div>
            <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3">Test Yourself</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base mb-4 md:mb-6 relative z-10">Take full mock tests, get personalized dashboard analytics, and identify your weak topics visually.</p>
            <button onClick={() => setCurrentPage('tracker')} className="text-green-600 font-semibold flex items-center relative z-10 hover:text-green-700 text-sm md:text-base">
              Start Test <ArrowRight className="ml-1 w-4 h-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
