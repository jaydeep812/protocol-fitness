/* ============================================
   Protocol - Dashboard Component
   Main overview screen with today's info
   ============================================ */

import { useMemo } from 'react';
import {
  calculateStreak,
  getWeeklyCompletion,
  getLatestWeight,
  formatDateLong,
  getTodayDate,
} from '../utils/storage';
import { getTodayWorkoutType } from '../utils/calculations';

interface DashboardProps {
  onNavigate: (tab: 'workout' | 'nutrition' | 'stats') => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  // ============================================
  // Data Fetching
  // ============================================
  
  const todayDate = useMemo(() => formatDateLong(getTodayDate()), []);
  const workoutType = useMemo(() => getTodayWorkoutType(), []);
  const streak = useMemo(() => calculateStreak(), []);
  const latestWeight = useMemo(() => getLatestWeight(), []);
  const weeklyCompletion = useMemo(() => getWeeklyCompletion(), []);
  
  // Day labels for weekly view
  const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  
  // Get current day index (0 = Monday)
  const today = new Date();
  const currentDayIndex = (today.getDay() + 6) % 7; // Convert Sunday=0 to Monday=0
  
  return (
    <div className="p-4 pb-24 space-y-4">
      {/* ============================================
          Header Section
          ============================================ */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-1">Protocol</h1>
        <p className="text-gray-400 text-sm">{todayDate}</p>
      </div>
      
      {/* ============================================
          Today's Workout Card
          ============================================ */}
      <div 
        className="bg-[#1f1f1f] rounded-2xl p-5 border border-[#2a2a2a] cursor-pointer active:scale-[0.98] transition-transform"
        onClick={() => onNavigate('workout')}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm mb-1">Today's Workout</p>
            <p className="text-2xl font-bold text-white">{workoutType}</p>
          </div>
          <div className={`w-14 h-14 rounded-full flex items-center justify-center ${
            workoutType === 'Rest' 
              ? 'bg-blue-500/20 text-blue-400' 
              : 'bg-green-500/20 text-green-400'
          }`}>
            {workoutType === 'Push' && (
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            )}
            {workoutType === 'Pull' && (
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            )}
            {workoutType === 'Legs' && (
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            )}
            {workoutType === 'Rest' && (
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </div>
        </div>
        <p className="text-gray-500 text-xs mt-3">Tap to log workout →</p>
      </div>
      
      {/* ============================================
          Stats Grid (Streak & Weight)
          ============================================ */}
      <div className="grid grid-cols-2 gap-3">
        {/* Streak Card */}
        <div className="bg-[#1f1f1f] rounded-2xl p-4 border border-[#2a2a2a]">
          <p className="text-gray-400 text-xs mb-2">Streak</p>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-white">{streak}</span>
            <span className="text-gray-400 text-sm">days</span>
          </div>
          <div className="mt-2 text-orange-400">
            <svg className="w-5 h-5 inline" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 23c-3.866 0-7-2.239-7-5 0-1.384.56-2.672 1.572-3.748C7.588 13.138 8 12.106 8 11c0-.94-.222-1.811-.607-2.587A8.005 8.005 0 0112 2a8.005 8.005 0 014.607 6.413C16.222 9.189 16 10.06 16 11c0 1.106.412 2.138 1.428 3.252C18.44 15.328 19 16.616 19 18c0 2.761-3.134 5-7 5z"/>
            </svg>
          </div>
        </div>
        
        {/* Weight Card */}
        <div 
          className="bg-[#1f1f1f] rounded-2xl p-4 border border-[#2a2a2a] cursor-pointer active:scale-[0.98] transition-transform"
          onClick={() => onNavigate('stats')}
        >
          <p className="text-gray-400 text-xs mb-2">Bodyweight</p>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-white">
              {latestWeight ? latestWeight.weight : '--'}
            </span>
            <span className="text-gray-400 text-sm">kg</span>
          </div>
          <p className="text-gray-500 text-xs mt-2">
            {latestWeight ? 'Latest entry' : 'No data yet'}
          </p>
        </div>
      </div>
      
      {/* ============================================
          Weekly Completion Bar
          ============================================ */}
      <div className="bg-[#1f1f1f] rounded-2xl p-4 border border-[#2a2a2a]">
        <p className="text-gray-400 text-xs mb-3">This Week</p>
        <div className="flex justify-between gap-2">
          {weeklyCompletion.map((completed, index) => (
            <div key={index} className="flex-1 flex flex-col items-center gap-2">
              <div 
                className={`w-full h-10 rounded-lg flex items-center justify-center ${
                  completed 
                    ? 'bg-green-500' 
                    : index === 6 - (6 - currentDayIndex)
                      ? 'bg-[#2a2a2a] border-2 border-green-500/50'
                      : 'bg-[#2a2a2a]'
                }`}
              >
                {completed && (
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span className={`text-xs ${
                index === currentDayIndex ? 'text-green-400 font-bold' : 'text-gray-500'
              }`}>
                {dayLabels[index]}
              </span>
            </div>
          ))}
        </div>
      </div>
      
      {/* ============================================
          Quick Actions
          ============================================ */}
      <div className="grid grid-cols-2 gap-3">
        <button 
          onClick={() => onNavigate('nutrition')}
          className="bg-[#1f1f1f] rounded-2xl p-4 border border-[#2a2a2a] text-left active:scale-[0.98] transition-transform"
        >
          <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center mb-3">
            <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-white font-medium">Log Nutrition</p>
          <p className="text-gray-500 text-xs mt-1">Track protein intake</p>
        </button>
        
        <button 
          onClick={() => onNavigate('stats')}
          className="bg-[#1f1f1f] rounded-2xl p-4 border border-[#2a2a2a] text-left active:scale-[0.98] transition-transform"
        >
          <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center mb-3">
            <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-white font-medium">View Stats</p>
          <p className="text-gray-500 text-xs mt-1">Weekly overview</p>
        </button>
      </div>
    </div>
  );
}
