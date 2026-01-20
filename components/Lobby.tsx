
import React, { useState } from 'react';
import { GameState, Unit, Grade } from '../types';
import { BASE_UNITS, GRADE_COLORS } from '../constants';
import { performGacha } from '../services/gameService';

interface Props {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  onStartRun: (deck: Unit[]) => void;
}

const Lobby: React.FC<Props> = ({ gameState, setGameState, onStartRun }) => {
  const [selectedForStart, setSelectedForStart] = useState<string[]>([]);
  const [ownedUnits, setOwnedUnits] = useState<Unit[]>([...BASE_UNITS]);

  const handleGacha = () => {
    const result = performGacha(gameState.magicStones);
    if (result) {
      setGameState(prev => ({ ...prev, magicStones: prev.magicStones - result.cost }));
      setOwnedUnits(prev => [...prev, result.unit]);
    } else {
      alert('마석이 부족합니다!');
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedForStart(prev => 
      prev.includes(id) ? prev.filter(uid => uid !== id) : prev.length < 5 ? [...prev, id] : prev
    );
  };

  const handleStart = () => {
    if (selectedForStart.length < 3) {
      alert('최소 3마리의 유닛을 선택해야 합니다!');
      return;
    }
    const startingDeck = ownedUnits.filter(u => selectedForStart.includes(u.id));
    onStartRun(startingDeck);
  };

  return (
    <div className="w-full h-full flex flex-col items-center bg-black relative">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-30" />
      
      <div className="relative z-10 w-full h-full flex flex-col pt-16 px-4 pb-6">
        <header className="mb-6 text-center">
          <h1 className="text-4xl font-cinzel font-black text-red-700 tracking-tighter">ANGEL SLAYER</h1>
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">Defend the Abyss</p>
        </header>

        {/* Selection Tray */}
        <div className="mb-4 flex flex-col bg-zinc-900/60 border border-white/5 rounded-2xl p-4">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-sm font-cinzel text-zinc-300">출전 군단 ({selectedForStart.length}/5)</h2>
            <span className="text-[10px] text-zinc-500">최소 3마리 필요</span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide min-h-[60px]">
            {selectedForStart.map(id => {
              const unit = ownedUnits.find(u => u.id === id);
              return (
                <div key={id} className="flex-shrink-0 w-12 h-12 bg-black/40 rounded-lg border border-red-500/50 flex items-center justify-center text-2xl relative">
                  {unit?.icon}
                  <button onClick={() => toggleSelect(id)} className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 rounded-full text-[10px] flex items-center justify-center">×</button>
                </div>
              );
            })}
            {Array.from({ length: 5 - selectedForStart.length }).map((_, i) => (
              <div key={i} className="flex-shrink-0 w-12 h-12 bg-black/20 rounded-lg border border-dashed border-zinc-700 flex items-center justify-center text-zinc-700 text-xs">?</div>
            ))}
          </div>
        </div>

        {/* Unit List */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-sm font-cinzel text-white">보유 유닛</h2>
            <button 
              onClick={handleGacha}
              className="bg-red-800 active:bg-red-700 px-3 py-1.5 rounded-full text-[10px] font-bold flex items-center gap-1 shadow-lg shadow-red-900/20"
            >
              🔮 소환 (100💎)
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto grid grid-cols-3 gap-3 pr-1 pb-20">
            {ownedUnits.map(unit => (
              <div 
                key={unit.id}
                onClick={() => toggleSelect(unit.id)}
                className={`relative p-3 rounded-xl border-2 transition-all active:scale-95 flex flex-col items-center ${
                  selectedForStart.includes(unit.id) ? 'border-red-500 bg-red-900/20' : 'border-zinc-800 bg-zinc-900/40'
                }`}
              >
                <span className="text-3xl mb-1">{unit.icon}</span>
                <p className="text-[10px] font-bold text-center truncate w-full">{unit.name}</p>
                <p className={`text-[8px] ${GRADE_COLORS[unit.grade]}`}>{unit.grade}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Start Button Fixed at Bottom */}
        <div className="absolute bottom-6 left-0 w-full px-6">
          <button 
            onClick={handleStart}
            disabled={selectedForStart.length < 3}
            className="w-full py-4 bg-red-700 active:bg-red-600 disabled:bg-zinc-800 disabled:text-zinc-500 text-white font-black text-lg rounded-2xl shadow-xl transform transition-transform active:scale-95 flex items-center justify-center gap-3"
          >
            {selectedForStart.length < 3 ? '유닛을 더 선택하세요' : '심연의 문 열기'}
            <span className="text-xl">🔥</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Lobby;
