import React from 'react';
import { BarChart3, PieChart, AlertTriangle } from 'lucide-react';
import { frequencyData, subjectFrequencies } from '../data';

const FrequencyAnalyzer = () => {
  const maxMatched = Math.max(...frequencyData.map(d => d.questionsMatched));

  return (
    <div className="space-y-8 fade-in">
      <div>
        <h2 className="text-2xl font-bold mb-2">Frequency Analyzer</h2>
        <p className="text-slate-500">Deep dive into 10+ years of UP B.Ed JEE question patterns.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Year-wise Distribution Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold flex items-center">
              <BarChart3 className="mr-2 w-5 h-5 text-primary-500" /> Year-wise Data Availability
            </h3>
          </div>
          
          <div className="h-64 flex items-end justify-between gap-2 mt-4">
            {frequencyData.map((data, idx) => {
              const heightPercent = (data.questionsMatched / maxMatched) * 100;
              return (
                <div key={idx} className="flex flex-col items-center w-full group h-full justify-end">
                  <div className="relative w-full flex justify-center flex-1 items-end">
                    <div 
                      className="w-full max-w-[40px] bg-primary-400 dark:bg-primary-600 rounded-t-sm group-hover:bg-primary-500 dark:group-hover:bg-primary-400 transition-all relative"
                      style={{ height: `${heightPercent}%` }}
                    >
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        {data.questionsMatched} Qs
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-slate-500 mt-3 font-medium rotate-45 md:rotate-0 origin-left shrink-0">{data.year}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Most Dangerous/Tricky Questions */}
        <div className="bg-gradient-to-b from-red-50 to-white dark:from-red-900/20 dark:to-slate-800 rounded-2xl p-6 shadow-sm border border-red-100 dark:border-red-900/30">
          <h3 className="text-lg font-bold flex items-center text-red-700 dark:text-red-400 mb-6">
            <AlertTriangle className="mr-2 w-5 h-5" /> Tricky Questions
          </h3>
          
          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500"></div>
              <p className="font-semibold text-sm mb-2">"संविधान कब लागू हुआ?" vs "कब अपनाया गया?"</p>
              <div className="text-xs space-y-1 text-slate-600 dark:text-slate-400">
                <p><span className="text-green-600 font-bold">Adopted:</span> 26 Nov 1949</p>
                <p><span className="text-blue-600 font-bold">Implemented:</span> 26 Jan 1950</p>
              </div>
            </div>
            
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-500"></div>
              <p className="font-semibold text-sm mb-2">"संज्ञा के कितने प्रकार?"</p>
              <p className="text-xs text-slate-600 dark:text-slate-400">Often debated between 4 and 5. In UP B.Ed context, <strong className="text-orange-600">5 is considered correct</strong>.</p>
            </div>
            
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-yellow-500"></div>
              <p className="font-semibold text-sm mb-2">Longest River in India</p>
              <p className="text-xs text-slate-600 dark:text-slate-400">Indus is longer, but <strong className="text-yellow-600">Ganga is the correct answer</strong> for "in India".</p>
            </div>
          </div>
        </div>
      </div>

      {/* Top Repeated Topics */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
        <h3 className="text-lg font-bold flex items-center mb-6">
          <PieChart className="mr-2 w-5 h-5 text-primary-500" /> Top Repeated Topics by Subject
        </h3>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjectFrequencies.map((subject, idx) => (
            <div key={idx} className="bg-slate-50 dark:bg-slate-750/50 p-5 rounded-xl border border-slate-100 dark:border-slate-700">
              <h4 className="font-bold text-primary-700 dark:text-primary-400 mb-4 pb-2 border-b border-slate-200 dark:border-slate-600">
                {subject.subject}
              </h4>
              <ul className="space-y-2">
                {subject.topics.map((topic, tIdx) => (
                  <li key={tIdx} className="flex items-center text-sm">
                    <span className="w-5 h-5 flex items-center justify-center bg-white dark:bg-slate-700 rounded-full text-xs font-bold text-slate-400 mr-2 shadow-sm shrink-0">
                      {tIdx + 1}
                    </span>
                    <span className="text-slate-700 dark:text-slate-300 font-medium">{topic}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FrequencyAnalyzer;
