
import React, { useRef, useEffect } from 'react';
import { GameState, MapNode } from '../types';
// Import MAX_FLOORS to fix reference error on line 99
import { MAX_FLOORS } from '../constants';

interface Props {
  gameState: GameState;
  onNodeSelect: (node: MapNode) => void;
}

const MapView: React.FC<Props> = ({ gameState, onNodeSelect }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto scroll to current floor
  useEffect(() => {
    if (scrollRef.current) {
      const currentFloorElement = document.getElementById(`floor-${gameState.currentFloor}`);
      if (currentFloorElement) {
        currentFloorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }
  }, [gameState.currentFloor]);

  const canSelectNode = (node: MapNode) => {
    if (node.floor === 1 && !gameState.currentNodeId) return true;
    if (gameState.currentNodeId) {
      const currentNode = gameState.map.flat().find(n => n.id === gameState.currentNodeId);
      return currentNode?.connections.includes(node.id) && !node.completed;
    }
    return false;
  };

  const getNodeIcon = (type: string) => {
    switch(type) {
      case 'Battle': return '⚔️';
      case 'Elite': return '💀';
      case 'Boss': return '👑';
      case 'Shop': return '💰';
      case 'Barracks': return '⛺';
      default: return '❓';
    }
  };

  return (
    <div className="w-full h-full bg-[#0a0a0a] overflow-hidden relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-900/10 via-transparent to-transparent opacity-50" />
      
      <div 
        ref={scrollRef}
        className="w-full h-full overflow-y-auto px-12 py-32 flex flex-col-reverse items-center relative z-10 space-y-reverse space-y-16"
      >
        {gameState.map.map((floor, fIdx) => (
          <div key={fIdx} id={`floor-${fIdx + 1}`} className="flex justify-center items-center gap-12 min-w-[600px] relative">
            <div className="absolute -left-16 text-zinc-700 font-cinzel font-bold text-4xl select-none">F{fIdx + 1}</div>
            
            {floor.map((node) => {
              const selectable = canSelectNode(node);
              const isCurrent = gameState.currentNodeId === node.id;
              
              return (
                <div key={node.id} className="relative group">
                  <button
                    disabled={!selectable}
                    onClick={() => onNodeSelect(node)}
                    className={`
                      w-16 h-16 rounded-full border-4 flex items-center justify-center text-2xl transition-all relative z-20
                      ${node.completed ? 'bg-zinc-800 border-zinc-700 grayscale opacity-50' : ''}
                      ${selectable ? 'bg-red-900 border-red-500 scale-110 shadow-[0_0_20px_rgba(185,28,28,0.5)] cursor-pointer hover:scale-125' : 'bg-zinc-900 border-zinc-800 opacity-60'}
                      ${isCurrent ? 'ring-4 ring-yellow-500 ring-offset-4 ring-offset-black' : ''}
                    `}
                  >
                    {getNodeIcon(node.type)}
                  </button>

                  <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-bold text-zinc-500 group-hover:text-zinc-200 uppercase tracking-widest">
                    {node.type}
                  </div>

                  {/* Draw Lines to connections */}
                  <svg className="absolute top-1/2 left-1/2 pointer-events-none -z-10 overflow-visible" width="0" height="0">
                    {node.connections.map(targetId => {
                      const targetNode = gameState.map.flat().find(n => n.id === targetId);
                      if (!targetNode) return null;
                      // Logic to draw lines would ideally use refs to get true positions
                      // Simplified placeholder line logic
                      return null;
                    })}
                  </svg>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div className="absolute bottom-8 left-8 p-4 bg-zinc-900/80 border border-zinc-700 rounded-lg backdrop-blur-md">
        <h3 className="text-red-500 font-cinzel font-bold text-xl mb-1">CURRENT STATUS</h3>
        <p className="text-sm text-zinc-300">Floor: {gameState.currentFloor} / {MAX_FLOORS}</p>
        <p className="text-xs text-zinc-500 mt-2">다음 스테이지를 선택하여 전진하세요.</p>
      </div>
    </div>
  );
};

export default MapView;
