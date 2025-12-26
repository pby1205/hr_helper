
import React, { useState, useRef, useMemo } from 'react';
import { Participant } from '../types';

interface RosterInputProps {
  participants: Participant[];
  onUpdate: (newList: Participant[]) => void;
}

const MOCK_NAMES = [
  "Alice Chen", "Bob Wang", "Charlie Lin", "Diana Lee", "Edward Ho", 
  "Fiona Wong", "George Chang", "Hannah Hsu", "Ivan Lu", "Jenny Kao",
  "Kevin Tsai", "Laura Yeh", "Mike Sung", "Nancy Cheng", "Oscar Pan"
];

const RosterInput: React.FC<RosterInputProps> = ({ participants, onUpdate }) => {
  const [textInput, setTextInput] = useState(participants.map(p => p.name).join('\n'));
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Identify duplicate names
  // Explicitly type the useMemo return to Map<string, number> to ensure correct type inference
  const duplicates = useMemo<Map<string, number>>(() => {
    const counts = new Map<string, number>();
    participants.forEach(p => {
      const name = p.name.trim().toLowerCase();
      counts.set(name, (counts.get(name) || 0) + 1);
    });
    return counts;
  }, [participants]);

  // Use explicit type for the callback argument to fix the 'unknown' error
  const hasDuplicates = useMemo(() => {
    return Array.from(duplicates.values()).some((count: number) => count > 1);
  }, [duplicates]);

  const processNames = (rawText: string) => {
    const names = rawText
      .split(/\n|,/)
      .map(n => n.trim())
      .filter(n => n.length > 0);
    
    const newList: Participant[] = names.map((name, index) => ({
      id: `${Date.now()}-${index}-${Math.random().toString(36).substr(2, 5)}`,
      name
    }));
    
    onUpdate(newList);
    setTextInput(names.join('\n'));
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTextInput(e.target.value);
  };

  const handleApply = () => {
    processNames(textInput);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      processNames(content);
    };
    reader.readAsText(file);
  };

  const clearRoster = () => {
    if (confirm("Are you sure you want to clear the entire list?")) {
      onUpdate([]);
      setTextInput("");
    }
  };

  const generateMockData = () => {
    const mockList = MOCK_NAMES.map((name, index) => ({
      id: `mock-${index}-${Date.now()}`,
      name
    }));
    onUpdate(mockList);
    setTextInput(MOCK_NAMES.join('\n'));
  };

  const removeDuplicates = () => {
    const seen = new Set<string>();
    const uniqueParticipants = participants.filter(p => {
      const normalized = p.name.trim().toLowerCase();
      if (seen.has(normalized)) return false;
      seen.add(normalized);
      return true;
    });
    onUpdate(uniqueParticipants);
    setTextInput(uniqueParticipants.map(p => p.name).join('\n'));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 space-y-3 md:space-y-0">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Roster Management</h2>
            <p className="text-slate-500">Paste names, upload CSV, or try our mock data.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={generateMockData}
              className="bg-amber-50 text-amber-700 px-3 py-2 rounded-lg border border-amber-200 hover:bg-amber-100 transition text-sm font-medium"
            >
              <i className="fas fa-magic mr-2"></i>
              Try Mock Data
            </button>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="bg-indigo-50 text-indigo-700 px-3 py-2 rounded-lg border border-indigo-200 hover:bg-indigo-100 transition text-sm font-medium"
            >
              <i className="fas fa-file-csv mr-2"></i>
              Upload CSV
            </button>
            <input 
              type="file" 
              accept=".csv,.txt" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
            />
          </div>
        </div>

        <div className="relative">
          <textarea
            value={textInput}
            onChange={handleTextChange}
            placeholder="Enter one name per line, or separate by commas..."
            className="w-full h-64 p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none font-mono text-sm"
          />
          <div className="absolute bottom-4 right-4 text-xs text-slate-400">
            {textInput.split('\n').filter(l => l.trim()).length} names detected
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center mt-4 gap-4">
          <div className="flex items-center space-x-4">
            <button 
              onClick={clearRoster}
              className="text-red-500 hover:text-red-700 text-sm font-medium transition"
            >
              <i className="fas fa-trash-alt mr-1"></i> Clear List
            </button>
            {hasDuplicates && (
              <button 
                onClick={removeDuplicates}
                className="bg-rose-500 text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow hover:bg-rose-600 transition animate-pulse"
              >
                <i className="fas fa-broom mr-1"></i> Remove Duplicates
              </button>
            )}
          </div>
          <button 
            onClick={handleApply}
            className="w-full sm:w-auto bg-indigo-600 text-white px-8 py-2 rounded-lg font-bold shadow-md hover:bg-indigo-700 transition"
          >
            Apply Changes
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {participants.slice(0, 24).map((p) => {
          const isDup = duplicates.get(p.name.trim().toLowerCase())! > 1;
          return (
            <div 
              key={p.id} 
              className={`px-4 py-2 rounded-lg flex items-center border transition-all ${
                isDup 
                ? 'bg-red-50 border-red-200 ring-1 ring-red-100' 
                : 'bg-slate-100 border-slate-200'
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 font-bold text-xs ${
                isDup ? 'bg-red-200 text-red-700' : 'bg-indigo-200 text-indigo-700'
              }`}>
                {p.name.charAt(0).toUpperCase()}
              </div>
              <span className={`truncate font-medium flex-grow ${isDup ? 'text-red-700' : 'text-slate-700'}`}>
                {p.name}
              </span>
              {isDup && (
                <i className="fas fa-exclamation-circle text-red-500 text-xs" title="Duplicate Name"></i>
              )}
            </div>
          );
        })}
        {participants.length > 24 && (
          <div className="bg-slate-50 px-4 py-2 rounded-lg flex items-center justify-center text-slate-400 border border-slate-100 border-dashed">
            + {participants.length - 24} more names
          </div>
        )}
      </div>
    </div>
  );
};

export default RosterInput;
