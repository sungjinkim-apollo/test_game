
import React, { useState, useEffect } from 'react';
import { GameState, Unit, MapNode, Grade } from './types';
import { BASE_UNITS, MAX_FLOORS } from './constants';
import { generateMap } from './services/gameService';
import Lobby from './components/Lobby';
import MapView from './components/MapView';
import CombatScene from './components/CombatScene';
import ShopScene from './components/ShopScene';
import BarracksScene from './components/BarracksScene';

type Scene = 'LOBBY' | 'MAP' | 'COMBAT' | 'SHOP' | 'BARRACKS' | 'REWARD';

const App: React.FC = () => {
  const [scene, setScene] = useState<Scene>('LOBBY');
  const [gameState, setGameState] = useState<GameState>({
    gold: 1000,
    essence: 0,
    magicStones: 500,
    deck: [],
    currentFloor: 1,
    currentNodeId: null,
    map: [],
    boardSize: 2,
    rouletteSlots: 3,
    boardUpgrades: 0,
    rouletteUpgrades: 0,
  });

  const [battleNode, setBattleNode] = useState<MapNode | null>(null);
  const [activeUnits, setActiveUnits] = useState<Unit[]>([]);

  useEffect(() => {
    const initialMap = generateMap();
    setGameState(prev => ({ ...prev, map: initialMap }));
  }, []);

  const startRun = (initialDeck: Unit[]) => {
    setGameState(prev => ({
      ...prev,
      deck: initialDeck,
      gold: 500,
      currentFloor: 1,
      currentNodeId: null,
    }));
    setScene('MAP');
  };

  const onNodeSelect = (node: MapNode) => {
    setBattleNode(node);
    if (node.type === 'Battle' || node.type === 'Elite' || node.type === 'Boss') {
      setScene('COMBAT');
    } else if (node.type === 'Shop') {
      setScene('SHOP');
    } else if (node.type === 'Barracks') {
      setScene('BARRACKS');
    }
  };

  const onBattleEnd = (victory: boolean, goldEarned: number, survivingUnits: Unit[]) => {
    if (victory) {
      setGameState(prev => {
        const newMap = prev.map.map(floor => 
          floor.map(n => n.id === battleNode?.id ? { ...n, completed: true } : n)
        );
        return {
          ...prev,
          gold: prev.gold + goldEarned,
          essence: prev.essence + (battleNode?.type === 'Boss' ? 100 : 10),
          map: newMap,
          currentNodeId: battleNode?.id || null,
          currentFloor: Math.min(MAX_FLOORS, (battleNode?.floor || 1) + 1)
        };
      });
      setActiveUnits(survivingUnits);
      setScene('REWARD');
    } else {
      alert('전투에서 패배했습니다. 로비로 돌아갑니다.');
      setScene('LOBBY');
    }
  };

  const onRewardSelect = (rewardUnit: Unit) => {
    setGameState(prev => ({
      ...prev,
      deck: [...prev.deck, rewardUnit]
    }));
    setScene('MAP');
  };

  return (
    <div className="w-full h-[100dvh] bg-black text-white relative overflow-hidden select-none touch-none">
      {/* Global Header - Mobile Optimized Pill */}
      <div className="fixed top-2 left-1/2 -translate-x-1/2 w-[95%] max-w-md flex justify-around items-center bg-zinc-900/80 backdrop-blur-lg px-4 py-2 rounded-full border border-white/10 z-[100] shadow-2xl safe-top">
        <div className="flex items-center gap-1.5">
          <span className="text-yellow-500 text-sm">🪙</span>
          <span className="font-mono text-xs font-bold">{gameState.gold}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-blue-400 text-sm">💎</span>
          <span className="font-mono text-xs font-bold">{gameState.magicStones}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-purple-500 text-sm">🟣</span>
          <span className="font-mono text-xs font-bold">{gameState.essence}</span>
        </div>
      </div>

      <div className="w-full h-full scene-transition">
        {scene === 'LOBBY' && (
          <Lobby 
            gameState={gameState} 
            setGameState={setGameState} 
            onStartRun={startRun} 
          />
        )}

        {scene === 'MAP' && (
          <MapView 
            gameState={gameState} 
            onNodeSelect={onNodeSelect} 
          />
        )}

        {scene === 'COMBAT' && battleNode && (
          <CombatScene 
            gameState={gameState}
            setGameState={setGameState}
            node={battleNode}
            initialActiveUnits={activeUnits}
            onBattleEnd={onBattleEnd}
          />
        )}

        {scene === 'REWARD' && (
          <div className="absolute inset-0 bg-black/95 flex flex-col items-center justify-center p-6 z-[110]">
            <h2 className="text-2xl font-cinzel text-yellow-500 mb-8 text-center">전투 승리!<br/>전리품 선택</h2>
            <div className="w-full flex flex-col gap-4">
              {[...Array(3)].map((_, i) => {
                const u = BASE_UNITS[Math.floor(Math.random() * BASE_UNITS.length)];
                const reward = { ...u, id: `reward-${Date.now()}-${i}`, grade: Grade.MAGIC };
                return (
                  <div 
                    key={i}
                    className="w-full p-4 bg-zinc-900 border border-zinc-700 active:border-yellow-500 rounded-xl flex items-center gap-4 transition-all"
                    onClick={() => onRewardSelect(reward)}
                  >
                    <span className="text-4xl">{reward.icon}</span>
                    <div className="flex-1">
                      <p className="font-bold text-lg leading-tight">{reward.name}</p>
                      <p className="text-xs text-green-400">매직 등급</p>
                    </div>
                    <div className="text-right text-[10px] text-zinc-400">
                      <p>ATK: {reward.atk}</p>
                      <p>HP: {reward.hp}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {scene === 'SHOP' && (
          <ShopScene 
            gameState={gameState} 
            setGameState={setGameState} 
            onExit={() => setScene('MAP')} 
          />
        )}

        {scene === 'BARRACKS' && (
          <BarracksScene 
            gameState={gameState} 
            setGameState={setGameState} 
            onExit={() => setScene('MAP')} 
          />
        )}
      </div>
    </div>
  );
};

export default App;
