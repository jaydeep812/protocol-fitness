/* ============================================
   Protocol - Fitness Tracking App
   Main application component
   ============================================ */

import { useState, useCallback } from 'react';
import type { TabType } from './types';
import Dashboard from './components/Dashboard';
import WorkoutTracker from './components/WorkoutTracker';
import NutritionTracker from './components/NutritionTracker';
import Stats from './components/Stats';
import Navigation from './components/Navigation';

function App() {
  // ============================================
  // State - Current active tab
  // ============================================
  
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  
  // ============================================
  // Navigation handler for Dashboard quick actions
  // ============================================
  
  const handleNavigate = useCallback((tab: TabType) => {
    setActiveTab(tab);
  }, []);
  
  // ============================================
  // Render current tab content
  // ============================================
  
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onNavigate={handleNavigate} />;
      case 'workout':
        return <WorkoutTracker />;
      case 'nutrition':
        return <NutritionTracker />;
      case 'stats':
        return <Stats />;
      default:
        return <Dashboard onNavigate={handleNavigate} />;
    }
  };
  
  // ============================================
  // Main App Layout
  // ============================================
  
  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      {/* Main Content Area */}
      <main className="max-w-lg mx-auto">
        {renderContent()}
      </main>
      
      {/* Bottom Navigation */}
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}

export default App;
