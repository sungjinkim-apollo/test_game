
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
    <div className="w-full h-full bg-black/90 flex flex-col items-center justify-center p-12">
      <h2 className="text-4xl font-cinzel text-yellow-500 mb-12">마계 암시장</h2>
      <div className="flex gap-8 mb-12">
        {shopUnits.map((u) => (
          <div 
            key={u.id}
            className="p-8 bg-zinc-900 border-2 border-zinc-700 hover:border-yellow-500 cursor-pointer rounded-xl flex flex-col items-center min-w-[200px]"
            onClick={() => buyUnit(u)}
          >
            <span className="text-6xl mb-4">{u.icon}</span>
            <p className="font-bold text-xl">{u.name}</p>
            <p className={`${GRADE_COLORS[u.grade]} mb-4`}>{u.grade}</p>
            <div className="bg-yellow-900/40 px-4 py-2 rounded-full border border-yellow-700 text-yellow-500 font-bold">
              🪙 {u.price} G
            </div>
          </div>
        ))}
      </div>
      <button 
        onClick={onExit}
        className="px-12 py-4 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-bold"
      >
        마을로 돌아가기
      </button>
    </div>
  );
};

export default ShopScene;
