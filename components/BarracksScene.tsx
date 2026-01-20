
import React from 'react';
import { GameState, Unit } from '../types';
import { GRADE_COLORS } from '../constants';

interface Props {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  onExit: () => void;
}

const BarracksScene: React.FC<Props> = ({ gameState, setGameState, onExit }) => {
  const removeUnit = (id: string) => {
    if (gameState.deck.length <= 3) return alert('최소 3마리의 유닛이 필요합니다.');
    setGameState(prev => ({
      ...prev,
      deck: prev.deck.filter(u => u.id !== id)
    }));
  };

  return (
    <div className="w-full h-full bg-black/95 flex flex-col p-16">
      <h2 className="text-4xl font-cinzel text-red-500 mb-8 text-center">군단 주둔지</h2>
      <p className="text-zinc-500 mb-12 text-center">불필요한 유닛을 덱에서 제외하여 보드 소환 효율을 높이십시오.</p>
      
      <div className="flex-1 overflow-y-auto grid grid-cols-6 gap-6 pr-4">
        {gameState.deck.map((unit) => (
          <div 
            key={unit.id}
            className="p-6 bg-zinc-900/60 border border-zinc-800 rounded-xl flex flex-col items-center group relative hover:bg-zinc-800/80 transition-all"
          >
            <span className="text-5xl mb-4">{unit.icon}</span>
            <p className="font-bold text-sm text-center">{unit.name}</p>
            <p className={`text-[10px] ${GRADE_COLORS[unit.grade]}`}>{unit.grade}</p>
            
            <button 
              onClick={() => removeUnit(unit.id)}
              className="mt-4 px-3 py-1 bg-red-900/20 text-red-500 text-xs border border-red-900/40 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-900/40"
            >
              덱에서 제외
            </button>
          </div>
        ))}
      </div>

      <div className="mt-12 flex justify-center">
        <button 
          onClick={onExit}
          className="px-12 py-4 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-bold"
        >
          원정 재개
        </button>
      </div>
    </div>
  );
};

export default BarracksScene;
