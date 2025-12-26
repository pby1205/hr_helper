
import React, { useState } from 'react';
import { Participant, Group } from '../types';
import { generateTeamNames } from '../services/geminiService';

interface AutoGroupingProps {
  participants: Participant[];
}

const AutoGrouping: React.FC<AutoGroupingProps> = ({ participants }) => {
  const [groupSize, setGroupSize] = useState(4);
  const [groups, setGroups] = useState<Group[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [namingStyle, setNamingStyle] = useState<'classic' | 'ai'>('ai');

  const shuffleArray = <T,>(array: T[]): T[] => {
    const newArr = [...array];
    for (let i = newArr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
  };

  const handleGroup = async () => {
    if (participants.length === 0) {
      alert("Please add some names first!");
      return;
    }
    
    setIsGenerating(true);
    const shuffled = shuffleArray<Participant>(participants);
    const numGroups = Math.ceil(shuffled.length / groupSize);
    
    let groupNames: string[] = [];
    if (namingStyle === 'ai') {
      groupNames = await generateTeamNames(numGroups);
    } else {
      groupNames = Array.from({ length: numGroups }, (_, i) => `Group ${i + 1}`);
    }

    const newGroups: Group[] = [];
    for (let i = 0; i < numGroups; i++) {
      const members = shuffled.slice(i * groupSize, (i + 1) * groupSize);
      newGroups.push({
        id: `group-${i}-${Date.now()}`,
        name: groupNames[i] || `Team ${i + 1}`,
        members
      });
    }

    setGroups(newGroups);
    setIsGenerating(false);
  };

  const handleDownloadCSV = () => {
    if (groups.length === 0) return;

    // Define CSV header
    let csvContent = "Team Name,Member Name\n";

    // Build rows
    groups.forEach(group => {
      group.members.forEach(member => {
        // Escape commas in names if any
        const escapedMember = member.name.includes(',') ? `"${member.name}"` : member.name;
        const escapedTeam = group.name.includes(',') ? `"${group.name}"` : group.name;
        csvContent += `${escapedTeam},${escapedMember}\n`;
      });
    });

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `group_results_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Controls */}
      <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200 flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
        <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-8">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Members per group</label>
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => setGroupSize(Math.max(2, groupSize - 1))}
                className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition"
              >
                <i className="fas fa-minus"></i>
              </button>
              <span className="text-xl font-bold w-12 text-center">{groupSize}</span>
              <button 
                onClick={() => setGroupSize(Math.min(participants.length, groupSize + 1))}
                className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition"
              >
                <i className="fas fa-plus"></i>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Naming Style</label>
            <div className="flex bg-slate-100 p-1 rounded-lg">
              <button 
                onClick={() => setNamingStyle('classic')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${namingStyle === 'classic' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}
              >
                Classic
              </button>
              <button 
                onClick={() => setNamingStyle('ai')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${namingStyle === 'ai' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}
              >
                AI Creative
              </button>
            </div>
          </div>
        </div>

        <button 
          onClick={handleGroup}
          disabled={isGenerating || participants.length === 0}
          className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition disabled:bg-slate-300 flex items-center"
        >
          {isGenerating ? (
            <>
              <i className="fas fa-spinner fa-spin mr-2"></i>
              Organizing...
            </>
          ) : (
            <>
              <i className="fas fa-layer-group mr-2"></i>
              Generate Teams
            </>
          )}
        </button>
      </div>

      {/* Results Header with Download */}
      {groups.length > 0 && (
        <div className="flex justify-between items-center px-2">
          <h3 className="text-xl font-bold text-slate-800">Results Visualization</h3>
          <button 
            onClick={handleDownloadCSV}
            className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-lg border border-emerald-200 hover:bg-emerald-100 transition flex items-center text-sm font-bold"
          >
            <i className="fas fa-file-export mr-2"></i>
            Download CSV
          </button>
        </div>
      )}

      {/* Results Visualization */}
      {groups.length === 0 ? (
        <div className="bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 py-20 flex flex-col items-center justify-center text-slate-400">
          <i className="fas fa-users text-6xl mb-4 opacity-20"></i>
          <p className="text-lg">Set your group size and click generate!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in pb-10">
          {groups.map((group) => (
            <div key={group.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition">
              <div className="bg-indigo-50 px-4 py-3 border-b border-slate-100 flex justify-between items-center">
                <h4 className="font-bold text-indigo-800 text-sm truncate pr-2">{group.name}</h4>
                <span className="text-[10px] bg-indigo-200 text-indigo-700 px-2 py-0.5 rounded-full font-bold whitespace-nowrap">
                  {group.members.length} People
                </span>
              </div>
              <div className="p-4 space-y-2">
                {group.members.map((member) => (
                  <div key={member.id} className="flex items-center text-sm text-slate-600 py-1 border-b border-slate-50 last:border-0">
                    <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center mr-2 text-[10px] font-bold text-slate-400">
                      {member.name.charAt(0)}
                    </div>
                    <span className="truncate">{member.name}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AutoGrouping;
