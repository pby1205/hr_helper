
import React, { useState, useCallback } from 'react';
import { Participant, AppTab } from './types';
import RosterInput from './components/RosterInput';
import LuckyDraw from './components/LuckyDraw';
import AutoGrouping from './components/AutoGrouping';

const App: React.FC = () => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.Roster);

  const handleUpdateRoster = useCallback((newList: Participant[]) => {
    setParticipants(newList);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-indigo-700 text-white shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <i className="fas fa-users-gear text-2xl"></i>
            <h1 className="text-xl font-bold tracking-tight">HR Team & Draw Master</h1>
          </div>
          <div className="hidden md:flex space-x-6">
            <button 
              onClick={() => setActiveTab(AppTab.Roster)}
              className={`px-3 py-2 rounded-md transition ${activeTab === AppTab.Roster ? 'bg-indigo-800' : 'hover:bg-indigo-600'}`}
            >
              Roster Management
            </button>
            <button 
              onClick={() => setActiveTab(AppTab.LuckyDraw)}
              className={`px-3 py-2 rounded-md transition ${activeTab === AppTab.LuckyDraw ? 'bg-indigo-800' : 'hover:bg-indigo-600'}`}
            >
              Lucky Draw
            </button>
            <button 
              onClick={() => setActiveTab(AppTab.Grouping)}
              className={`px-3 py-2 rounded-md transition ${activeTab === AppTab.Grouping ? 'bg-indigo-800' : 'hover:bg-indigo-600'}`}
            >
              Auto Grouping
            </button>
          </div>
          <div className="text-sm bg-indigo-800 px-3 py-1 rounded-full border border-indigo-400">
            {participants.length} Members
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <nav className="md:hidden bg-indigo-600 text-white flex justify-around p-2 shadow-inner">
        <button onClick={() => setActiveTab(AppTab.Roster)} className={`p-2 rounded-lg ${activeTab === AppTab.Roster ? 'bg-indigo-800' : ''}`}>
          <i className="fas fa-list"></i>
        </button>
        <button onClick={() => setActiveTab(AppTab.LuckyDraw)} className={`p-2 rounded-lg ${activeTab === AppTab.LuckyDraw ? 'bg-indigo-800' : ''}`}>
          <i className="fas fa-gift"></i>
        </button>
        <button onClick={() => setActiveTab(AppTab.Grouping)} className={`p-2 rounded-lg ${activeTab === AppTab.Grouping ? 'bg-indigo-800' : ''}`}>
          <i className="fas fa-layer-group"></i>
        </button>
      </nav>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-8">
        {activeTab === AppTab.Roster && (
          <RosterInput participants={participants} onUpdate={handleUpdateRoster} />
        )}
        
        {activeTab === AppTab.LuckyDraw && (
          <LuckyDraw participants={participants} />
        )}
        
        {activeTab === AppTab.Grouping && (
          <AutoGrouping participants={participants} />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-800 text-slate-400 py-6 mt-auto">
        <div className="container mx-auto px-4 text-center text-sm">
          <p>&copy; 2024 HR Excellence Suite. Powered by Gemini AI for creative insights.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
