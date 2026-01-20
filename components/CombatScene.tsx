
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, Unit, MapNode, Grade } from '../types';
import { BASE_UNITS, GRADE_COLORS, SPECIAL_UNITS, COMBINATIONS } from '../constants';
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
  
  const battleAreaRef = useRef<HTMLDivElement>(null);

  // Init Summoning Board
  useEffect(() => {
    const units = [];
    const boardTotal = gameState.boardSize * gameState.boardSize;
    for (let i = 0; i < boardTotal; i++) {
      const randUnit = gameState.deck[Math.floor(Math.random() * gameState.deck.length)];
      units.push({ ...randUnit, id: `board-${i}-${Date.now()}` });
    }
    setBoard(units);

    // Init Enemies
    const enemies = [];
    const enemyCount = 3 + node.floor;
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
      
      // Calculate summons
      const newSummons = [...results];
      
      // Check for combinations
      const counts: Record<string, number> = {};
      results.forEach(u => counts[u.name] = (counts[u.name] || 0) + 1);
      
      COMBINATIONS.forEach(combo => {
        let canCombine = true;
        const requiredCounts: Record<string, number> = {};
        combo.ingredients.forEach(ing => requiredCounts[ing] = (requiredCounts[ing] || 0) + 1);
        
        for (const [ing, count] of Object.entries(requiredCounts)) {
          if ((counts[ing] || 0) < count) {
            canCombine = false;
            break;
          }
        }

        if (canCombine) {
          newSummons.push({ ...SPECIAL_UNITS[combo.result], id: `special-${Date.now()}` });
        }
      });

      setSummons([...initialActiveUnits, ...newSummons]);
    }, 1500);
  };

  const startCombat = () => {
    setPhase('BATTLE');
    const width = 800; // Mock width
    const initialBattleUnits = [
      ...summons.map((u, i) => ({
        id: u.id,
        unit: u,
        pos: { x: 50 + (i * 40) % 700, y: 500 + Math.floor(i / 10) * 40 },
        isEnemy: false,
        currentHp: u.hp
      })),
      ...enemyUnits.map((u, i) => ({
        id: u.id,
        unit: u,
        pos: { x: 50 + (i * 40) % 700, y: 100 - Math.floor(i / 10) * 40 },
        isEnemy: true,
        currentHp: u.hp
      }))
    ];
    setBattleUnits(initialBattleUnits);
  };

  // Combat Simulation Loop
  useEffect(() => {
    if (phase !== 'BATTLE') return;

    const interval = setInterval(() => {
      setBattleUnits(prev => {
        if (prev.length === 0) return prev;
        
        const next = prev.map(u => {
          // Find nearest enemy
          const target = prev.find(t => t.isEnemy !== u.isEnemy && t.currentHp > 0);
          if (!target) return u;

          const dx = target.pos.x - u.pos.x;
          const dy = target.pos.y - u.pos.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < u.unit.range) {
            // Attack!
            target.currentHp -= Math.max(1, u.unit.atk - target.unit.def);
            return u;
          } else {
            // Move
            const moveX = (dx / dist) * (u.unit.speed / 20);
            const moveY = (dy / dist) * (u.unit.speed / 20);
            return { ...u, pos: { x: u.pos.x + moveX, y: u.pos.y + moveY } };
          }
        }).filter(u => u.currentHp > 0);

        // Check Victory/Defeat
        const friendlyLeft = next.some(u => !u.isEnemy);
        const enemyLeft = next.some(u => u.isEnemy);

        if (!enemyLeft) {
          clearInterval(interval);
          onBattleEnd(true, node.floor * 100, next.filter(u => !u.isEnemy).map(u => u.unit));
        } else if (!friendlyLeft) {
          clearInterval(interval);
          onBattleEnd(false, 0, []);
        }

        return next;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [phase, onBattleEnd, node.floor]);

  const upgradeBoard = () => {
    const cost = UPGRADE_GOLD_COST;
    if (gameState.gold < cost) return alert('골드가 부족합니다');
    if (gameState.boardSize >= 5) return alert('이미 최대 크기입니다');

    setGameState(prev => {
      const nextProgress = prev.boardUpgrades + 1;
      const req = getUpgradeRequirement(prev.boardSize);
      if (nextProgress >= req) {
        return { ...prev, gold: prev.gold - cost, boardSize: prev.boardSize + 1, boardUpgrades: 0 };
      }
      return { ...prev, gold: prev.gold - cost, boardUpgrades: nextProgress };
    });
  };

  const upgradeRoulette = () => {
    const cost = UPGRADE_GOLD_COST;
    if (gameState.gold < cost) return alert('골드가 부족합니다');
    if (gameState.rouletteSlots >= 5) return alert('이미 최대 크기입니다');

    setGameState(prev => {
      const nextProgress = prev.rouletteUpgrades + 1;
      const req = getUpgradeRequirement(prev.rouletteSlots);
      if (nextProgress >= req) {
        return { ...prev, gold: prev.gold - cost, rouletteSlots: prev.rouletteSlots + 1, rouletteUpgrades: 0 };
      }
      return { ...prev, gold: prev.gold - cost, rouletteUpgrades: nextProgress };
    });
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-between p-12 bg-zinc-950 relative overflow-hidden">
      {/* World Background */}
      <div className="absolute inset-0 opacity-20 bg-[url('https://picsum.photos/id/102/1920/1080')] bg-cover" />

      {phase === 'SUMMON' && (
        <>
          <h2 className="text-4xl font-cinzel text-red-500 z-10 drop-shadow-lg mb-8">악마 소환 단계</h2>
          
          <div className="flex gap-12 z-10 w-full max-w-6xl items-start justify-center">
            {/* Board */}
            <div className="flex flex-col items-center">
              <div 
                className="grid gap-2 p-4 bg-zinc-900/80 border-4 border-zinc-700 rounded-xl shadow-2xl"
                style={{ gridTemplateColumns: `repeat(${gameState.boardSize}, minmax(0, 1fr))` }}
              >
                {board.map((u, i) => {
                  const isActive = rouletteResults.some(r => r.id === u.id);
                  return (
                    <div 
                      key={u.id}
                      className={`w-20 h-20 flex flex-col items-center justify-center rounded-lg border-2 transition-all ${
                        isActive ? 'bg-red-600 border-yellow-400 scale-105 shadow-[0_0_15px_rgba(255,255,0,0.5)]' : 'bg-black/60 border-zinc-700'
                      }`}
                    >
                      <span className="text-4xl">{u.icon}</span>
                    </div>
                  );
                })}
              </div>
              <button 
                onClick={upgradeBoard}
                className="mt-4 px-4 py-2 bg-zinc-800 border border-zinc-600 hover:bg-zinc-700 rounded text-xs"
              >
                보드 확장 ({gameState.boardUpgrades}/{getUpgradeRequirement(gameState.boardSize)}) - 500G
              </button>
            </div>

            {/* Roulette Control */}
            <div className="flex flex-col items-center gap-8">
              <div className="flex gap-4">
                {Array.from({ length: gameState.rouletteSlots }).map((_, i) => (
                  <div key={i} className={`w-24 h-32 rounded-lg border-4 flex flex-center items-center justify-center text-4xl overflow-hidden relative ${isSpinning ? 'bg-zinc-800 border-red-500' : 'bg-black border-zinc-700'}`}>
                    {isSpinning ? (
                      <div className="animate-bounce">❓</div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <span>{rouletteResults[i]?.icon || '💤'}</span>
                        <span className="text-[10px] uppercase font-bold text-zinc-500">{rouletteResults[i]?.name || ''}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              <button 
                onClick={handleRoulette}
                disabled={isSpinning || rouletteResults.length > 0}
                className="px-12 py-6 bg-red-700 hover:bg-red-600 disabled:opacity-50 text-3xl font-cinzel font-black rounded-full shadow-[0_8px_0_rgb(153,27,27)] active:translate-y-2 active:shadow-none transition-all"
              >
                {isSpinning ? '소환 중...' : '룰렛 가동!'}
              </button>

              <button 
                onClick={upgradeRoulette}
                className="px-4 py-2 bg-zinc-800 border border-zinc-600 hover:bg-zinc-700 rounded text-xs"
              >
                슬롯 추가 ({gameState.rouletteUpgrades}/{getUpgradeRequirement(gameState.rouletteSlots)}) - 500G
              </button>

              {rouletteResults.length > 0 && !isSpinning && (
                <div className="text-center animate-pulse">
                  <p className="text-yellow-400 text-xl font-bold mb-4">소환이 완료되었습니다!</p>
                  <button 
                    onClick={startCombat}
                    className="px-8 py-3 bg-yellow-600 hover:bg-yellow-500 text-black font-black text-xl rounded-lg"
                  >
                    전투 개시
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {phase === 'BATTLE' && (
        <div ref={battleAreaRef} className="w-full h-full relative z-10 bg-black/40 border-2 border-red-900/30 rounded-3xl p-4">
          <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/50 text-sm font-cinzel italic">
            AUTOMATIC COMBAT IN PROGRESS
          </div>
          
          {battleUnits.map((u) => (
            <div 
              key={u.id}
              className="absolute transition-all duration-300"
              style={{ left: u.pos.x, top: u.pos.y }}
            >
              <div className="relative group flex flex-col items-center">
                <div className="absolute -top-4 w-8 h-1 bg-zinc-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${u.isEnemy ? 'bg-white' : 'bg-red-500'}`} 
                    style={{ width: `${(u.currentHp / u.unit.hp) * 100}%` }}
                  />
                </div>
                <span className="text-4xl filter drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">{u.unit.icon}</span>
              </div>
            </div>
          ))}

          {/* Dividing Line */}
          <div className="absolute top-1/2 left-0 w-full h-px bg-red-900/20" />
        </div>
      )}
    </div>
  );
};

export default CombatScene;
