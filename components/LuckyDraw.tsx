
import React, { useState, useEffect, useRef } from 'react';
import { Participant, DrawResult } from '../types';
import { generateWinnerAnnouncement } from '../services/geminiService';

interface LuckyDrawProps {
  participants: Participant[];
}

const LuckyDraw: React.FC<LuckyDrawProps> = ({ participants }) => {
  const [pool, setPool] = useState<Participant[]>([...participants]);
  const [history, setHistory] = useState<DrawResult[]>([]);
  const [allowRepeat, setAllowRepeat] = useState(false);
  const [prizeName, setPrizeName] = useState("Big Prize");
  const [isDrawing, setIsDrawing] = useState(false);
  const [displayWinner, setDisplayWinner] = useState<Participant | null>(null);
  const [rollingName, setRollingName] = useState("---");
  const [aiMessage, setAiMessage] = useState<string | null>(null);

  useEffect(() => {
    // Sync pool with participants if pool is empty and repeats are allowed, 
    // or if participants changed significantly
    if (pool.length === 0 && allowRepeat) {
      setPool([...participants]);
    }
  }, [participants, pool.length, allowRepeat]);

  // Reset pool when participants change manually
  useEffect(() => {
    setPool([...participants]);
  }, [participants]);

  const createConfetti = () => {
    for (let i = 0; i < 50; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti';
      confetti.style.left = Math.random() * 100 + 'vw';
      confetti.style.backgroundColor = `hsl(${Math.random() * 360}, 70%, 50%)`;
      confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
      confetti.style.width = (Math.random() * 10 + 5) + 'px';
      confetti.style.height = confetti.style.width;
      document.body.appendChild(confetti);
      setTimeout(() => confetti.remove(), 4000);
    }
  };

  const handleDraw = async () => {
    if (pool.length === 0) {
      alert("No names left in the pool!");
      return;
    }
    if (isDrawing) return;

    setIsDrawing(true);
    setDisplayWinner(null);
    setAiMessage(null);

    // Rolling animation
    let count = 0;
    const maxCount = 40;
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * participants.length);
      setRollingName(participants[randomIndex].name);
      count++;

      if (count >= maxCount) {
        clearInterval(interval);
        finalizeDraw();
      }
    }, 50);
  };

  const finalizeDraw = async () => {
    const currentPool = [...pool];
    const winnerIndex = Math.floor(Math.random() * currentPool.length);
    const winner = currentPool[winnerIndex];

    if (!allowRepeat) {
      currentPool.splice(winnerIndex, 1);
      setPool(currentPool);
    }

    setDisplayWinner(winner);
    setRollingName(winner.name);
    
    const result: DrawResult = {
      timestamp: Date.now(),
      winner,
      prizeName
    };
    setHistory(prev => [result, ...prev]);
    setIsDrawing(false);
    createConfetti();

    // Get AI fun message
    const msg = await generateWinnerAnnouncement(winner.name, prizeName);
    setAiMessage(msg);
  };

  const clearHistory = () => {
    setHistory([]);
    setPool([...participants]);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
      {/* Settings & Draw Control */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
          <div className="bg-indigo-600 p-8 text-white text-center">
            <h2 className="text-3xl font-black mb-2 uppercase tracking-widest italic">
              Lucky Draw
            </h2>
            <div className="h-24 flex items-center justify-center">
              <span className={`text-4xl md:text-6xl font-bold transition-all duration-75 ${isDrawing ? 'scale-110 opacity-70' : 'scale-100'}`}>
                {isDrawing ? rollingName : (displayWinner ? displayWinner.name : "Ready?")}
              </span>
            </div>
            {aiMessage && (
              <div className="mt-4 bg-indigo-500/30 p-3 rounded-lg text-sm italic border border-white/20 animate-bounce">
                "{aiMessage}"
              </div>
            )}
          </div>
          
          <div className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Prize Name</label>
                <input 
                  type="text" 
                  value={prizeName}
                  onChange={(e) => setPrizeName(e.target.value)}
                  className="w-full border-slate-300 rounded-lg focus:ring-indigo-500 px-4 py-2 border"
                  placeholder="e.g. Starbucks Gift Card"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Options</label>
                <div className="flex items-center space-x-4 h-10">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={allowRepeat} 
                      onChange={(e) => setAllowRepeat(e.target.checked)}
                      className="rounded text-indigo-600 w-5 h-5"
                    />
                    <span className="text-sm text-slate-600">Allow Duplicates</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center pt-4">
              <button
                onClick={handleDraw}
                disabled={isDrawing || participants.length === 0}
                className={`w-full md:w-64 py-4 rounded-full font-black text-xl shadow-lg transform transition active:scale-95 ${
                  isDrawing || participants.length === 0 
                  ? 'bg-slate-300 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 hover:shadow-indigo-200'
                }`}
              >
                {isDrawing ? "DRAWING..." : "START DRAW"}
              </button>
              <p className="text-slate-400 text-xs mt-3">
                {pool.length} names currently in pool.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* History Sidebar */}
      <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 h-[600px] flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-800 flex items-center">
            <i className="fas fa-history mr-2 text-indigo-500"></i>
            Winners History
          </h3>
          <button onClick={clearHistory} className="text-xs text-slate-400 hover:text-slate-600">Clear</button>
        </div>
        
        <div className="flex-grow overflow-y-auto space-y-3 pr-2 custom-scrollbar">
          {history.length === 0 ? (
            <div className="text-center py-10 text-slate-400">
              <i className="fas fa-trophy text-4xl mb-3 opacity-20"></i>
              <p className="text-sm">No winners yet. Time to draw!</p>
            </div>
          ) : (
            history.map((res, idx) => (
              <div key={res.timestamp} className="bg-white p-3 rounded-lg shadow-sm border-l-4 border-indigo-500 animate-slide-in">
                <div className="flex justify-between items-start">
                  <span className="font-bold text-slate-800">{res.winner.name}</span>
                  <span className="text-[10px] text-slate-400">
                    {new Date(res.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="text-xs text-indigo-600 font-medium">
                  {res.prizeName}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default LuckyDraw;
