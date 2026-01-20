
import React, { useState, useEffect, useRef } from 'react';
import { GameState, Unit, MapNode } from '../types';
import { BASE_UNITS, SPECIAL_UNITS, COMBINATIONS } from '../constants';
import { UPGRADE_GOLD_COST, getUpgradeRequirement } from '../services/gameService';

interface Props {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  node: MapNode;
  initialActiveUnits: Unit[];
  onBattleEnd: (victory: boolean, gold: number, survivors: Unit[]) => void;
}

const CombatScene: React.FC<Props> = ({ gameState, setGameState, node, initialActiveUnits, onBattleEnd }) => {
  const [phase, setPhase] = useState<'SUMMON' | 'BATTLE'>('SUMMON');
  const [board, setBoard] = useState<Unit[]>([]);
  const [rouletteResults, setRouletteResults] = useState<Unit[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [summons, setSummons] = useState<Unit[]>([]);
  const [enemyUnits, setEnemyUnits] = useState<Unit[]>([]);
  const [battleUnits, setBattleUnits] = useState<{ id: string; unit: Unit; pos: { x: number; y: number }; isEnemy: boolean; currentHp: number }[]>([]);
  
  useEffect(() => {
    const units = [];
    const boardTotal = gameState.boardSize * gameState.boardSize;
    for (let i = 0; i < boardTotal; i++) {
      const randUnit = gameState.deck[Math.floor(Math.random() * gameState.deck.length)];
      units.push({ ...randUnit, id: `board-${i}-${Date.now()}` });
    }
    setBoard(units);

    const enemies = [];
    const enemyCount = 2 + node.floor;
    for (let i = 0; i < enemyCount; i++) {
      const u = BASE_UNITS[Math.floor(Math.random() * BASE_UNITS.length)];
      enemies.push({ ...u, id: `enemy-${i}`, name: '타락한 천사' });
    }
    setEnemyUnits(enemies);
  }, [gameState.boardSize, gameState.deck, node.floor]);

  const handleRoulette = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    
    setTimeout(() => {
      const results: Unit[] = [];
      for (let i = 0; i < gameState.rouletteSlots; i++) {
        results.push(board[Math.floor(Math.random() * board.length)]);
      }
      setRouletteResults(results);
      setIsSpinning(false);
      
      const newSummons = [...results];
      const counts: Record<string, number> = {};
      results.forEach(u => counts[u.name] = (counts[u.name] || 0) + 1);
      
      COMBINATIONS.forEach(combo => {
        let canCombine = true;
        const requiredCounts: Record<string, number> = {};
        combo.ingredients.forEach(ing => requiredCounts[ing] = (requiredCounts[ing] || 0) + 1);
        for (const [ing, count] of Object.entries(requiredCounts)) {
          if ((counts[ing] || 0) < count) { canCombine = false; break; }
        }
        if (canCombine) newSummons.push({ ...SPECIAL_UNITS[combo.result], id: `special-${Date.now()}` });
      });

      setSummons([...initialActiveUnits, ...newSummons]);
    }, 1200);
  };

  const startCombat = () => {
    setPhase('BATTLE');
    const screenW = window.innerWidth;
    const screenH = window.innerHeight;
    
    const initialBattleUnits = [
      ...summons.map((u, i) => ({
        id: u.id,
        unit: u,
        pos: { x: 20 + (i * 40) % (screenW - 60), y: screenH * 0.7 + Math.floor(i / 8) * 40 },
        isEnemy: false,
        currentHp: u.hp
      })),
      ...enemyUnits.map((u, i) => ({
        id: u.id,
        unit: u,
        pos: { x: 20 + (i * 40) % (screenW - 60), y: screenH * 0.15 - Math.floor(i / 8) * 40 },
        isEnemy: true,
        currentHp: u.hp
      }))
    ];
    setBattleUnits(initialBattleUnits);
  };

  useEffect(() => {
    if (phase !== 'BATTLE') return;
    const interval = setInterval(() => {
      setBattleUnits(prev => {
        if (prev.length === 0) return prev;
        const next = prev.map(u => {
          const target = prev.find(t => t.isEnemy !== u.isEnemy && t.currentHp > 0);
          if (!target) return u;
          const dx = target.pos.x - u.pos.x;
          const dy = target.pos.y - u.pos.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < u.unit.range / 2) {
            target.currentHp -= Math.max(1, u.unit.atk - target.unit.def);
            return u;
          } else {
            const moveX = (dx / dist) * (u.unit.speed / 25);
            const moveY = (dy / dist) * (u.unit.speed / 25);
            return { ...u, pos: { x: u.pos.x + moveX, y: u.pos.y + moveY } };
          }
        }).filter(u => u.currentHp > 0);

        const friendlyLeft = next.some(u => !u.isEnemy);
        const enemyLeft = next.some(u => u.isEnemy);
        if (!enemyLeft) { clearInterval(interval); onBattleEnd(true, node.floor * 100, next.filter(u => !u.isEnemy).map(u => u.unit)); }
        else if (!friendlyLeft) { clearInterval(interval); onBattleEnd(false, 0, []); }
        return next;
      });
    }, 40);
    return () => clearInterval(interval);
  }, [phase, onBattleEnd, node.floor]);

  const upgradeBoard = () => {
    const cost = UPGRADE_GOLD_COST;
    if (gameState.gold < cost) return alert('골드가 부족합니다');
    if (gameState.boardSize >= 5) return alert('최대 크기입니다');
    setGameState(prev => {
      const nextProgress = prev.boardUpgrades + 1;
      if (nextProgress >= getUpgradeRequirement(prev.boardSize)) {
        return { ...prev, gold: prev.gold - cost, boardSize: prev.boardSize + 1, boardUpgrades: 0 };
      }
      return { ...prev, gold: prev.gold - cost, boardUpgrades: nextProgress };
    });
  };

  const upgradeRoulette = () => {
    const cost = UPGRADE_GOLD_COST;
    if (gameState.gold < cost) return alert('골드가 부족합니다');
    if (gameState.rouletteSlots >= 5) return alert('최대 슬롯입니다');
    setGameState(prev => {
      const nextProgress = prev.rouletteUpgrades + 1;
      if (nextProgress >= getUpgradeRequirement(prev.rouletteSlots)) {
        return { ...prev, gold: prev.gold - cost, rouletteSlots: prev.rouletteSlots + 1, rouletteUpgrades: 0 };
      }
      return { ...prev, gold: prev.gold - cost, rouletteUpgrades: nextProgress };
    });
  };

  return (
    <div className="w-full h-full flex flex-col items-center bg-zinc-950 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80')] bg-cover" />

      {phase === 'SUMMON' && (
        <div className="w-full h-full flex flex-col pt-16 px-4 pb-10 z-10">
          <h2 className="text-center text-xl font-cinzel text-red-500 mb-6 tracking-widest">SUMMONING PHASE</h2>
          
          {/* Summoning Board */}
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <div 
              className="grid gap-1.5 p-3 bg-zinc-900/60 border border-white/5 rounded-2xl shadow-inner"
              style={{ gridTemplateColumns: `repeat(${gameState.boardSize}, minmax(0, 1fr))` }}
            >
              {board.map((u, i) => {
                const isActive = rouletteResults.some(r => r.id === u.id);
                const size = gameState.boardSize === 2 ? 'w-24 h-24 text-5xl' : gameState.boardSize === 3 ? 'w-16 h-16 text-3xl' : 'w-12 h-12 text-2xl';
                return (
                  <div 
                    key={u.id}
                    className={`${size} flex items-center justify-center rounded-xl border transition-all ${
                      isActive ? 'bg-red-600 border-yellow-400 scale-105 shadow-[0_0_15px_rgba(255,255,0,0.3)]' : 'bg-black/40 border-white/5'
                    }`}
                  >
                    {u.icon}
                  </div>
                );
              })}
            </div>
            <button 
              onClick={upgradeBoard}
              className="px-4 py-1.5 bg-zinc-900 border border-zinc-800 rounded-full text-[10px] text-zinc-400 active:scale-95"
            >
              보드 확장 ({gameState.boardUpgrades}/{getUpgradeRequirement(gameState.boardSize)}) • 500G
            </button>
          </div>

          {/* Roulette Slots */}
          <div className="flex flex-col items-center gap-6 mt-4">
            <div className="flex justify-center gap-2">
              {Array.from({ length: gameState.rouletteSlots }).map((_, i) => (
                <div key={i} className={`w-14 h-20 rounded-xl border-2 flex flex-col items-center justify-center overflow-hidden relative ${isSpinning ? 'bg-zinc-900 border-red-900 animate-pulse' : 'bg-black border-white/10'}`}>
                  {isSpinning ? (
                    <span className="text-xl animate-bounce">?</span>
                  ) : (
                    <span className="text-3xl">{rouletteResults[i]?.icon || ''}</span>
                  )}
                </div>
              ))}
            </div>

            <div className="w-full max-w-xs flex flex-col gap-3">
              <button 
                onClick={handleRoulette}
                disabled={isSpinning || rouletteResults.length > 0}
                className="w-full py-4 bg-red-700 active:bg-red-600 disabled:opacity-30 text-white font-black text-xl rounded-2xl shadow-xl transition-all"
              >
                {isSpinning ? '소환 중...' : '소환 룰렛 가동'}
              </button>
              
              <div className="flex justify-between items-center gap-4">
                <button 
                  onClick={upgradeRoulette}
                  className="flex-1 py-1.5 bg-zinc-900 border border-zinc-800 rounded-full text-[10px] text-zinc-400"
                >
                  슬롯 확장 ({gameState.rouletteUpgrades}/{getUpgradeRequirement(gameState.rouletteSlots)})
                </button>
                {rouletteResults.length > 0 && !isSpinning && (
                  <button 
                    onClick={startCombat}
                    className="flex-1 py-1.5 bg-yellow-600 active:bg-yellow-500 text-black font-bold rounded-full text-xs shadow-lg animate-bounce"
                  >
                    전투 개시 ⚔️
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {phase === 'BATTLE' && (
        <div className="w-full h-full relative z-10 flex flex-col">
          <div className="flex-1 relative overflow-hidden">
            {battleUnits.map((u) => (
              <div 
                key={u.id}
                className="absolute transition-all duration-75"
                style={{ left: u.pos.x, top: u.pos.y }}
              >
                <div className="flex flex-col items-center">
                  <div className="w-6 h-1 bg-black/50 border border-white/10 rounded-full mb-1 overflow-hidden">
                    <div 
                      className={`h-full ${u.isEnemy ? 'bg-white' : 'bg-red-500'}`} 
                      style={{ width: `${(u.currentHp / u.unit.hp) * 100}%` }}
                    />
                  </div>
                  <span className="text-2xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">{u.unit.icon}</span>
                </div>
              </div>
            ))}
            
            {/* Field Indicators */}
            <div className="absolute top-1/2 left-0 w-full h-[2px] bg-red-900/10" />
            <div className="absolute top-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[8px] font-cinzel text-white/40 tracking-widest uppercase">
              Hostile Territory
            </div>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-red-900/10 border border-red-900/20 rounded-full text-[8px] font-cinzel text-red-500/40 tracking-widest uppercase">
              Abyssal Defense
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CombatScene;
