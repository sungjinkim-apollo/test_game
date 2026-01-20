
import React from 'react';
import { GameState, Unit, Grade } from '../types';
import { BASE_UNITS, GRADE_COLORS } from '../constants';

interface Props {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  onExit: () => void;
}

const ShopScene: React.FC<Props> = ({ gameState, setGameState, onExit }) => {
  const shopUnits = [
    { ...BASE_UNITS[0], id: 'shop-1', price: 200, grade: Grade.RARE },
    { ...BASE_UNITS[1], id: 'shop-2', price: 300, grade: Grade.EPIC },
    { ...BASE_UNITS[2], id: 'shop-3', price: 150, grade: Grade.MAGIC },
    { ...BASE_UNITS[3], id: 'shop-4', price: 400, grade: Grade.UNIQUE },
  ];

  const buyUnit = (unit: any) => {
    if (gameState.gold < unit.price) return alert('골드가 부족합니다');
    setGameState(prev => ({
      ...prev,
      gold: prev.gold - unit.price,
      deck: [...prev.deck, { ...unit, price: undefined }]
    }));
    alert(`${unit.name}을(를) 영입했습니다!`);
  };

  return (
    <div className="w-full h-full bg-black flex flex-col pt-16 px-6 pb-10">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-cinzel text-yellow-500">ABYSSAL MARKET</h2>
        <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Trade your souls for power</p>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {shopUnits.map((u) => (
          <div 
            key={u.id}
            className="p-4 bg-zinc-900/80 border border-zinc-800 active:border-yellow-500 rounded-2xl flex items-center gap-4 transition-all"
            onClick={() => buyUnit(u)}
          >
            <span className="text-5xl">{u.icon}</span>
            <div className="flex-1">
              <p className="font-bold text-lg">{u.name}</p>
              <p className={`text-xs ${GRADE_COLORS[u.grade]}`}>{u.grade}</p>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-yellow-500 font-mono font-bold">🪙 {u.price}</span>
              <span className="text-[8px] text-zinc-500">TAP TO BUY</span>
            </div>
          </div>
        ))}
      </div>

      <button 
        onClick={onExit}
        className="mt-8 w-full py-4 bg-zinc-800 active:bg-zinc-700 text-white rounded-2xl font-bold flex items-center justify-center gap-2"
      >
        <span>원정으로 돌아가기</span>
        <span>🚪</span>
      </button>
    </div>
  );
};

export default ShopScene;
