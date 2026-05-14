import React from 'react';
import { BookMarked, Calendar, Brain, ArrowRight, Award, Clock, Target, TrendingUp } from 'lucide-react';

const Home = ({ setCurrentPage }) => {
  const stats = [
    { label: "Questions Analyzed", value: "200+", icon: <BookMarked className="w-6 h-6 text-blue-500" /> },
    { label: "Years of Data", value: "20", icon: <Clock className="w-6 h-6 text-orange-500" /> },
    { label: "Success Rate", value: "95%", icon: <Award className="w-6 h-6 text-green-500" /> },
    { label: "High Prob. Topics", value: "15", icon: <Target className="w-6 h-6 text-purple-500" /> }
  ];

  return (
    <div className="space-y-12 fade-in">
      {/* Hero Section */}
      <section className="text-center py-12 px-4 rounded-3xl bg-gradient-to-br from-primary-900 via-primary-800 to-primary-600 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20">
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full bg-orange-400 blur-3xl"></div>
        </div>
        
        <div className="relative z-10 max-w-3xl mx-auto space-y-6">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
            Crack UP B.Ed JEE <span className="text-orange-400">2026</span>
          </h1>
          <p className="text-lg md:text-xl text-primary-100 max-w-2xl mx-auto">
            Your ultimate 15-day smart preparation platform. Master 200+ high-frequency questions and AI-predicted topics for guaranteed success.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 pt-6">
            <button 
              onClick={() => setCurrentPage('questions')}
              className="px-8 py-4 bg-white text-primary-700 font-bold rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all flex items-center group"
            >
              Study Questions
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={() => setCurrentPage('plan')}
              className="px-8 py-4 bg-orange-500 text-white font-bold rounded-full shadow-lg hover:shadow-xl hover:bg-orange-400 hover:-translate-y-1 transition-all flex items-center"
            >
              <Calendar className="mr-2 w-5 h-5" />
              15-Day Plan
            </button>
            <button 
              onClick={() => setCurrentPage('predictions')}
              className="px-8 py-4 bg-transparent border-2 border-white/30 text-white font-bold rounded-full hover:bg-white/10 transition-all flex items-center"
            >
              <Brain className="mr-2 w-5 h-5" />
              AI Predictions
            </button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center text-center hover:shadow-md transition-shadow">
            <div className="p-3 bg-slate-50 dark:bg-slate-700 rounded-full mb-4">
              {stat.icon}
            </div>
            <h3 className="text-3xl font-bold text-slate-800 dark:text-white mb-1">{stat.value}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{stat.label}</p>
          </div>
        ))}
      </section>

      {/* Features Section */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Smart Study Features</h2>
          <p className="text-slate-600 dark:text-slate-400">Everything you need to boost your score in the last 15 days of preparation.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-slate-800 dark:to-slate-750 p-8 rounded-3xl relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform">
              <BookMarked className="w-48 h-48" />
            </div>
            <h3 className="text-xl font-bold mb-3">Topic-wise Question Bank</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6 relative z-10">Access the most repeated questions from the last 20 years, categorized by subject with detailed explanations.</p>
            <button onClick={() => setCurrentPage('questions')} className="text-blue-600 font-semibold flex items-center relative z-10 hover:text-blue-700">
              Start Practicing <ArrowRight className="ml-1 w-4 h-4" />
            </button>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-slate-800 dark:to-slate-750 p-8 rounded-3xl relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform text-orange-500">
              <Brain className="w-48 h-48" />
            </div>
            <h3 className="text-xl font-bold mb-3">AI Predictions</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6 relative z-10">Focus on what matters. Our AI analyzes 10+ years of trends to predict the highest probability questions for 2026.</p>
            <button onClick={() => setCurrentPage('predictions')} className="text-orange-600 font-semibold flex items-center relative z-10 hover:text-orange-700">
              View Predictions <ArrowRight className="ml-1 w-4 h-4" />
            </button>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-slate-800 dark:to-slate-750 p-8 rounded-3xl relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform text-green-500">
              <TrendingUp className="w-48 h-48" />
            </div>
            <h3 className="text-xl font-bold mb-3">Track Progress</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6 relative z-10">Take random mini-quizzes, identify your weak topics, and track your readiness visually.</p>
            <button onClick={() => setCurrentPage('tracker')} className="text-green-600 font-semibold flex items-center relative z-10 hover:text-green-700">
              Check Progress <ArrowRight className="ml-1 w-4 h-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
