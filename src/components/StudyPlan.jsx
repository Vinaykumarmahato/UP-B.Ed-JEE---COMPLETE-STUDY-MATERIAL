import React, { useState } from 'react';
import { Clock, BookOpen, CheckCircle, Circle } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { studyPlan } from '../data';

const StudyPlan = () => {
  const [activeDay, setActiveDay] = useLocalStorage('upbed_study_active_day', 1);
  
  // Initialize plan status from data.js if not in local storage
  const initialStatus = studyPlan.reduce((acc, day) => {
    acc[day.day] = day.status;
    return acc;
  }, {});
  
  const [planStatus, setPlanStatus] = useLocalStorage('upbed_study_plan_status', initialStatus);
  
  const currentDayData = studyPlan.find(d => d.day === activeDay);
  const currentStatus = currentDayData ? planStatus[currentDayData.day] : 'not-started';

  const getStatusColor = (status) => {
    switch(status) {
      case 'completed': return 'bg-green-500';
      case 'in-progress': return 'bg-blue-500';
      default: return 'bg-slate-300 dark:bg-slate-600';
    }
  };

  const toggleDayStatus = () => {
    if (!currentDayData) return;
    const newStatus = currentStatus === 'completed' ? 'in-progress' : 'completed';
    setPlanStatus({...planStatus, [currentDayData.day]: newStatus});
  };

  const completedDaysCount = Object.values(planStatus).filter(status => status === 'completed').length;
  const progressPercent = Math.round((completedDaysCount / 15) * 100);

  return (
    <div className="space-y-6 fade-in">
      <div>
        <h2 className="text-2xl font-bold mb-2">15-Day Smart Study Plan</h2>
        <div className="flex items-center justify-between">
          <p className="text-slate-500">Structured daily goals for guaranteed success.</p>
          <span className="font-bold text-primary-600">{progressPercent}% Completed</span>
        </div>
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 mt-3">
          <div className="bg-primary-600 h-2.5 rounded-full transition-all duration-1000" style={{ width: `${progressPercent}%` }}></div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-1/3 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden flex flex-col h-[600px]">
          <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
            <h3 className="font-bold">Timeline</h3>
          </div>
          <div className="overflow-y-auto flex-1 p-2">
            {studyPlan.map((day) => (
              <button
                key={day.day}
                onClick={() => setActiveDay(day.day)}
                className={`w-full flex items-center p-3 rounded-xl mb-1 transition-all ${
                  activeDay === day.day 
                    ? 'bg-primary-50 dark:bg-primary-900/20 shadow-sm border border-primary-100 dark:border-primary-800' 
                    : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'
                }`}
              >
                <div className={`w-3 h-3 rounded-full mr-3 shrink-0 ${getStatusColor(planStatus[day.day])}`}></div>
                <div className="text-left flex-1">
                  <div className={`font-bold ${activeDay === day.day ? 'text-primary-700 dark:text-primary-400' : ''}`}>
                    Day {day.day}
                  </div>
                  <div className="text-xs text-slate-500 truncate">{day.title}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:w-2/3">
          {currentDayData && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 md:p-8 h-full slide-up">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-400 mb-3">
                    Day {currentDayData.day}
                  </span>
                  <h2 className="text-3xl font-bold">{currentDayData.title}</h2>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-orange-50 dark:bg-orange-900/10 p-4 rounded-xl flex items-center">
                  <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg mr-4">
                    <Clock className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Duration</p>
                    <p className="text-lg font-bold">{currentDayData.duration}</p>
                  </div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl flex items-center">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg mr-4">
                    <BookOpen className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Practice</p>
                    <p className="text-lg font-bold">{currentDayData.questions} Qs</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold mb-4 flex items-center">
                    <span className="bg-slate-100 dark:bg-slate-700 w-8 h-8 rounded-full flex items-center justify-center mr-2 text-sm">1</span>
                    Topics to Cover
                  </h3>
                  <ul className="space-y-3">
                    {currentDayData.topics.map((topic, idx) => (
                      <li key={idx} className="flex items-start">
                        {currentStatus === 'completed' ? (
                          <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 shrink-0" />
                        ) : (
                          <Circle className="w-5 h-5 text-slate-300 dark:text-slate-600 mr-3 mt-0.5 shrink-0" />
                        )}
                        <span className="text-slate-700 dark:text-slate-300 font-medium">{topic}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-6 border-t border-slate-100 dark:border-slate-700">
                  <button 
                    onClick={toggleDayStatus}
                    className={`w-full py-3 rounded-xl font-bold transition-all shadow-sm ${
                    currentStatus === 'completed' 
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50' 
                      : 'bg-primary-600 text-white hover:bg-primary-700 hover:shadow-md'
                  }`}>
                    {currentStatus === 'completed' ? 'Marked as Completed (Click to Undo)' : 'Mark Day ' + currentDayData.day + ' as Completed'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudyPlan;
