/* ============================================
   Protocol - Stats Component
   Bodyweight tracker and weekly overview
   ============================================ */

import { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import type { WeightEntry } from '../types';
import {
  saveWeight,
  getAllWeights,
  getWeeklyStats,
  getTodayDate,
  generateId,
  formatDate,
  getMealLogsForDays,
  getNutritionTargets,
} from '../utils/storage';
import { calculateWeeklyAverage } from '../utils/calculations';
import { calculateTotalMacros } from '../types/mealTemplates';
import type { MealLogEntry } from '../types/mealTemplates';

export default function Stats() {
  // ============================================
  // State
  // ============================================
  
  const [weights, setWeights] = useState<WeightEntry[]>(() => getAllWeights());
  const [newWeight, setNewWeight] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'weight' | 'overview'>('overview');
  
  // Weekly stats
  const weeklyStats = useMemo(() => getWeeklyStats(), []);
  const targets = useMemo(() => getNutritionTargets(), []);
  
  // Get meal logs for the week
  const weeklyMealLogs = useMemo(() => getMealLogsForDays(7), []);
  
  // Calculate nutrition stats from meal logs
  const nutritionStats = useMemo(() => {
    // Group logs by date
    const logsByDate = weeklyMealLogs.reduce((acc, log) => {
      if (!acc[log.date]) acc[log.date] = [];
      acc[log.date].push(log);
      return acc;
    }, {} as Record<string, MealLogEntry[]>);
    
    const dates = Object.keys(logsByDate);
    const daysWithLogs = dates.length;
    
    if (daysWithLogs === 0) {
      return {
        avgProtein: 0,
        avgCalories: 0,
        daysHitProtein: 0,
        daysHitCalories: 0,
      };
    }
    
    let totalProtein = 0;
    let totalCalories = 0;
    let daysHitProtein = 0;
    let daysHitCalories = 0;
    
    dates.forEach(date => {
      const dayMacros = calculateTotalMacros(logsByDate[date]);
      totalProtein += dayMacros.protein;
      totalCalories += dayMacros.calories;
      if (dayMacros.protein >= targets.protein) daysHitProtein++;
      if (dayMacros.calories >= targets.calories * 0.9) daysHitCalories++; // 90% threshold
    });
    
    return {
      avgProtein: Math.round(totalProtein / daysWithLogs),
      avgCalories: Math.round(totalCalories / daysWithLogs),
      daysHitProtein,
      daysHitCalories,
    };
  }, [weeklyMealLogs, targets]);
  
  // Weekly average weight
  const weeklyAvgWeight = useMemo(
    () => calculateWeeklyAverage(weights),
    [weights]
  );
  
  // Chart data (last 14 entries)
  const chartData = useMemo(() => {
    return weights.slice(-14).map(w => ({
      date: formatDate(w.date).split(',')[0], // Short format
      weight: w.weight,
    }));
  }, [weights]);
  
  // ============================================
  // Handlers
  // ============================================
  
  function handleSaveWeight() {
    const weightValue = parseFloat(newWeight);
    if (isNaN(weightValue) || weightValue <= 0) return;
    
    const entry: WeightEntry = {
      id: generateId(),
      date: getTodayDate(),
      weight: weightValue,
      createdAt: new Date().toISOString(),
    };
    
    saveWeight(entry);
    setWeights(getAllWeights());
    setNewWeight('');
  }
  
  // ============================================
  // Render
  // ============================================
  
  return (
    <div className="p-4 pb-24 space-y-4">
      {/* ============================================
          Header
          ============================================ */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-1">Stats</h1>
        <p className="text-gray-400 text-sm">Track your progress</p>
      </div>
      
      {/* ============================================
          Tab Selector
          ============================================ */}
      <div className="flex gap-2 p-1 bg-[#1a1a1a] rounded-xl">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
            activeTab === 'overview'
              ? 'bg-[#2a2a2a] text-white'
              : 'text-gray-400'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('weight')}
          className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
            activeTab === 'weight'
              ? 'bg-[#2a2a2a] text-white'
              : 'text-gray-400'
          }`}
        >
          Bodyweight
        </button>
      </div>
      
      {/* ============================================
          Weekly Overview Tab
          ============================================ */}
      {activeTab === 'overview' && (
        <div className="space-y-3">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* Workouts Completed */}
            <div className="bg-[#1f1f1f] rounded-2xl p-4 border border-[#2a2a2a]">
              <p className="text-gray-400 text-xs mb-2">Workouts</p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-white">
                  {weeklyStats.workoutsCompleted}
                </span>
                <span className="text-gray-400 text-sm">this week</span>
              </div>
              <div className="mt-2 text-green-400">
                <svg className="w-5 h-5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            
            {/* Average Protein */}
            <div className="bg-[#1f1f1f] rounded-2xl p-4 border border-[#2a2a2a]">
              <p className="text-gray-400 text-xs mb-2">Avg Protein</p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-white">
                  {nutritionStats.avgProtein || '--'}
                </span>
                <span className="text-gray-400 text-sm">g/day</span>
              </div>
              <p className="text-xs mt-2 text-gray-500">
                Target: {targets.protein}g
              </p>
            </div>
            
            {/* Average Weight */}
            <div className="bg-[#1f1f1f] rounded-2xl p-4 border border-[#2a2a2a]">
              <p className="text-gray-400 text-xs mb-2">Avg Weight</p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-white">
                  {weeklyAvgWeight || '--'}
                </span>
                <span className="text-gray-400 text-sm">kg</span>
              </div>
              <p className="text-xs mt-2 text-gray-500">
                Weekly average
              </p>
            </div>
            
            {/* Average Calories */}
            <div className="bg-[#1f1f1f] rounded-2xl p-4 border border-[#2a2a2a]">
              <p className="text-gray-400 text-xs mb-2">Avg Calories</p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-white">
                  {nutritionStats.avgCalories || '--'}
                </span>
                <span className="text-gray-400 text-sm">kcal</span>
              </div>
              <p className="text-xs mt-2 text-gray-500">
                Target: {targets.calories}
              </p>
            </div>
          </div>
          
          {/* Weekly Summary Card */}
          <div className="bg-[#1f1f1f] rounded-2xl p-5 border border-[#2a2a2a]">
            <h3 className="text-white font-medium mb-4">Weekly Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Protein Target Hit</span>
                <span className="text-white font-medium">
                  {nutritionStats.daysHitProtein}/7 days
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Calorie Target Hit</span>
                <span className="text-white font-medium">
                  {nutritionStats.daysHitCalories}/7 days
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Workout Consistency</span>
                <span className="text-white font-medium">
                  {Math.round((weeklyStats.workoutsCompleted / 7) * 100)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Meals Logged</span>
                <span className="text-white font-medium">
                  {weeklyMealLogs.length} this week
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* ============================================
          Bodyweight Tab
          ============================================ */}
      {activeTab === 'weight' && (
        <div className="space-y-4">
          {/* Weight Input Card */}
          <div className="bg-[#1f1f1f] rounded-2xl p-5 border border-[#2a2a2a]">
            <p className="text-gray-400 text-sm mb-3">Log Today's Weight</p>
            <div className="flex gap-3">
              <input
                type="number"
                step="0.1"
                placeholder="e.g., 75.5"
                value={newWeight}
                onChange={(e) => setNewWeight(e.target.value)}
                className="flex-1 bg-[#2a2a2a] text-white text-xl font-bold rounded-xl p-4 border border-[#3a3a3a] text-center"
              />
              <button
                onClick={handleSaveWeight}
                disabled={!newWeight}
                className={`px-6 rounded-xl font-medium transition-all ${
                  newWeight
                    ? 'bg-green-500 text-white active:scale-95'
                    : 'bg-[#2a2a2a] text-gray-500'
                }`}
              >
                Save
              </button>
            </div>
            <p className="text-gray-500 text-xs text-center mt-2">Weight in kg</p>
          </div>
          
          {/* Weekly Average Card */}
          <div className="bg-[#1f1f1f] rounded-2xl p-5 border border-[#2a2a2a]">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-400 text-sm">Weekly Average</p>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-3xl font-bold text-white">
                    {weeklyAvgWeight || '--'}
                  </span>
                  <span className="text-gray-400 text-sm">kg</span>
                </div>
              </div>
              {weights.length >= 2 && (
                <div className="text-right">
                  <p className="text-gray-400 text-sm">Change</p>
                  <p className={`text-lg font-medium ${
                    weights[weights.length - 1].weight > weights[weights.length - 2].weight
                      ? 'text-red-400'
                      : weights[weights.length - 1].weight < weights[weights.length - 2].weight
                        ? 'text-green-400'
                        : 'text-gray-400'
                  }`}>
                    {(weights[weights.length - 1].weight - weights[weights.length - 2].weight).toFixed(1)}kg
                  </p>
                </div>
              )}
            </div>
          </div>
          
          {/* Weight Chart */}
          {chartData.length > 0 ? (
            <div className="bg-[#1f1f1f] rounded-2xl p-4 border border-[#2a2a2a]">
              <p className="text-gray-400 text-sm mb-4">Weight Trend</p>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <XAxis 
                      dataKey="date" 
                      stroke="#6b7280"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      stroke="#6b7280"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                      domain={['auto', 'auto']}
                      width={35}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1f1f1f',
                        border: '1px solid #2a2a2a',
                        borderRadius: '8px',
                        color: '#fff',
                      }}
                      labelStyle={{ color: '#9ca3af' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="weight"
                      stroke="#22c55e"
                      strokeWidth={2}
                      dot={{ fill: '#22c55e', strokeWidth: 0, r: 4 }}
                      activeDot={{ r: 6, fill: '#22c55e' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
            <div className="bg-[#1f1f1f] rounded-2xl p-8 border border-[#2a2a2a] text-center">
              <div className="w-16 h-16 rounded-full bg-[#2a2a2a] flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <p className="text-gray-400">No weight data yet</p>
              <p className="text-gray-500 text-sm mt-1">Start logging to see your trend</p>
            </div>
          )}
          
          {/* Recent Entries */}
          {weights.length > 0 && (
            <div className="bg-[#1f1f1f] rounded-2xl p-4 border border-[#2a2a2a]">
              <p className="text-gray-400 text-sm mb-3">Recent Entries</p>
              <div className="space-y-2">
                {weights.slice(-5).reverse().map(w => (
                  <div key={w.id} className="flex justify-between items-center py-2 border-b border-[#2a2a2a] last:border-0">
                    <span className="text-gray-400 text-sm">{formatDate(w.date)}</span>
                    <span className="text-white font-medium">{w.weight} kg</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
