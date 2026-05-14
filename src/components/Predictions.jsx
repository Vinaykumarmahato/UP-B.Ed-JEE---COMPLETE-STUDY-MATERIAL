import React, { useState } from 'react';
import { Brain, Zap, Target, TrendingUp, Filter } from 'lucide-react';
import { aiPredictions } from '../data';

const Predictions = () => {
  const [filter, setFilter] = useState('All');
  
  const filters = ['All', '90%+', '85-89%', '80-84%'];

  const filteredPredictions = aiPredictions.filter(p => {
    if (filter === 'All') return true;
    if (filter === '90%+') return p.probability >= 90;
    if (filter === '85-89%') return p.probability >= 85 && p.probability < 90;
    if (filter === '80-84%') return p.probability >= 80 && p.probability < 85;
    return true;
  });

  const getProbabilityColor = (prob) => {
    if (prob >= 90) return 'text-red-500 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
    if (prob >= 85) return 'text-orange-500 bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800';
    return 'text-green-500 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
  };

  return (
    <div className="space-y-6 md:space-y-8 fade-in">
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl md:rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-10 transform translate-x-1/4 -translate-y-1/4 pointer-events-none">
          <Brain className="w-32 md:w-64 h-32 md:h-64" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center space-x-2 text-orange-400 mb-3 md:mb-4 font-bold tracking-wider uppercase text-xs md:text-sm">
            <Zap className="w-4 md:w-5 h-4 md:h-5" />
            <span>AI-Powered Insights</span>
          </div>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold mb-3 md:mb-4">High Probability Topics for 2026</h2>
          <p className="text-slate-300 text-sm md:text-lg leading-relaxed">
            Our proprietary AI has analyzed over 10 years of past papers, current affairs trends, and UP B.Ed JEE syllabus changes to predict the most likely topics for your upcoming exam.
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 md:gap-4">
        <h3 className="text-lg md:text-xl font-bold flex items-center">
          <Target className="mr-2 w-5 h-5 text-primary-500" /> Topic Predictions
        </h3>
        
        <div className="flex flex-wrap items-center gap-1 bg-white dark:bg-slate-800 p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 ml-1" />
          {filters.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-2 md:px-3 py-1 md:py-1.5 text-xs md:text-sm font-medium rounded-md transition-colors ${
                filter === f 
                  ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:gap-6">
        {filteredPredictions.map((prediction, idx) => (
          <div key={idx} className="bg-white dark:bg-slate-800 rounded-xl md:rounded-2xl p-4 md:p-6 lg:p-8 shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-all slide-up" style={{animationDelay: `${idx * 100}ms`}}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
              <div className="flex-1">
                <h4 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">{prediction.topic}</h4>
                <div className="space-y-3 md:space-y-4">
                  <div className="flex items-start">
                    <div className="p-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded mt-0.5 mr-3 shrink-0">
                      <Brain className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs md:text-sm font-bold text-slate-700 dark:text-slate-300 block mb-1">Why this can come:</span>
                      <p className="text-slate-600 dark:text-slate-400 text-sm">{prediction.reasoning}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="p-1.5 bg-purple-50 dark:bg-purple-900/20 text-purple-600 rounded mt-0.5 mr-3 shrink-0">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs md:text-sm font-bold text-slate-700 dark:text-slate-300 block mb-1">Previous Year Trends:</span>
                      <p className="text-slate-600 dark:text-slate-400 text-sm">{prediction.trends}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="md:w-40 shrink-0 flex flex-row md:flex-col items-center justify-start md:justify-center gap-3 md:gap-0 p-4 md:p-6 rounded-xl md:rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                <div className={`text-3xl md:text-4xl font-extrabold md:mb-2 ${getProbabilityColor(prediction.probability).split(' ')[0]}`}>
                  {prediction.probability}%
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getProbabilityColor(prediction.probability)}`}>
                  Probability
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {filteredPredictions.length === 0 && (
          <div className="text-center py-10 md:py-12 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
            <p className="text-slate-500 text-sm md:text-base">No predictions found for this filter.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Predictions;
