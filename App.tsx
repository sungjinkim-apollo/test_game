
import React, { useState, useEffect, useCallback } from 'react';
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

  // Initialize game
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
          currentFloor: (battleNode?.floor || 1) + 1
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
    <div className="w-full h-screen bg-black text-white relative overflow-hidden select-none">
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
        <div className="absolute inset-0 bg-black/90 flex flex-center flex-col items-center justify-center p-8">
          <h2 className="text-3xl font-cinzel text-yellow-500 mb-8">전투 승리! 유닛을 선택하세요</h2>
          <div className="flex gap-6">
            {[...Array(3)].map((_, i) => {
              const u = BASE_UNITS[Math.floor(Math.random() * BASE_UNITS.length)];
              const reward = { ...u, id: `reward-${Date.now()}-${i}`, grade: Grade.MAGIC };
              return (
                <div 
                  key={i}
                  className="p-6 bg-zinc-900 border-2 border-zinc-700 hover:border-yellow-500 cursor-pointer rounded-lg flex flex-col items-center transition-all transform hover:scale-105"
                  onClick={() => onRewardSelect(reward)}
                >
                  <span className="text-6xl mb-4">{reward.icon}</span>
                  <p className="font-bold text-lg">{reward.name}</p>
                  <p className="text-sm text-green-400">매직 등급</p>
                  <div className="mt-4 space-y-1 text-xs text-zinc-400">
                    <p>공격력: {reward.atk}</p>
                    <p>체력: {reward.hp}</p>
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

      {/* Global UI Elements */}
      <div className="fixed top-4 right-4 flex gap-4 bg-black/60 p-3 rounded-full border border-red-900/50 backdrop-blur-md z-50">
        <div className="flex items-center gap-2">
          <span className="text-yellow-500">🪙</span>
          <span className="font-mono">{gameState.gold}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-blue-400">💎</span>
          <span className="font-mono">{gameState.magicStones}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-purple-500">🟣</span>
          <span className="font-mono">{gameState.essence}</span>
        </div>
      </div>
    </div>
  );
};

export default App;
