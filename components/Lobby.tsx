
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
    <div className="w-full h-full flex flex-col items-center bg-[url('https://picsum.photos/id/111/1920/1080')] bg-cover bg-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      
      <div className="relative z-10 w-full max-w-6xl h-full flex flex-col p-8">
        <header className="mb-8 text-center">
          <h1 className="text-6xl font-cinzel font-black text-red-700 drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]">ANGEL SLAYER</h1>
          <p className="text-zinc-400 mt-2">격퇴하라, 빛의 침략자들을.</p>
        </header>

        <div className="flex-1 flex gap-8 overflow-hidden">
          {/* Left: Unit Management */}
          <div className="flex-1 flex flex-col bg-black/40 border border-zinc-800 rounded-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-cinzel text-white">유닛 저장소</h2>
              <button 
                onClick={handleGacha}
                className="bg-red-900 hover:bg-red-800 px-4 py-2 rounded-lg font-bold transition-colors flex items-center gap-2"
              >
                <span>🔮 유닛 소환</span>
                <span className="text-xs text-zinc-300">(100 💎)</span>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto grid grid-cols-4 gap-3 pr-2">
              {ownedUnits.map(unit => (
                <div 
                  key={unit.id}
                  onClick={() => toggleSelect(unit.id)}
                  className={`relative p-3 rounded-lg border-2 transition-all cursor-pointer flex flex-col items-center ${
                    selectedForStart.includes(unit.id) ? 'border-red-500 bg-red-900/20' : 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-600'
                  }`}
                >
                  <span className="text-4xl mb-2">{unit.icon}</span>
                  <p className="text-xs font-bold text-center">{unit.name}</p>
                  <p className={`text-[10px] ${GRADE_COLORS[unit.grade]}`}>{unit.grade}</p>
                  {selectedForStart.includes(unit.id) && (
                    <div className="absolute top-1 right-1 bg-red-600 rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold">
                      {selectedForStart.indexOf(unit.id) + 1}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right: Start Run */}
          <div className="w-80 flex flex-col bg-zinc-900/80 border border-zinc-700 rounded-xl p-6">
            <h2 className="text-2xl font-cinzel text-white mb-6">전투 준비</h2>
            <div className="flex-1">
              <p className="text-sm text-zinc-400 mb-2">선택된 유닛 ({selectedForStart.length}/5)</p>
              <div className="space-y-2">
                {selectedForStart.map(id => {
                  const unit = ownedUnits.find(u => u.id === id);
                  return (
                    <div key={id} className="flex items-center gap-3 p-2 bg-black/40 rounded border border-zinc-700">
                      <span className="text-2xl">{unit?.icon}</span>
                      <span className="flex-1 text-sm font-bold">{unit?.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            <button 
              onClick={handleStart}
              className="w-full mt-6 py-4 bg-red-700 hover:bg-red-600 text-white font-black text-xl rounded-lg shadow-lg transform transition active:scale-95 disabled:opacity-50"
              disabled={selectedForStart.length < 3}
            >
              맵 진입
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Lobby;
