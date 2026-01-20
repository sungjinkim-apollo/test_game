
import React, { useRef, useEffect } from 'react';
import { GameState, MapNode } from '../types';
import { MAX_FLOORS } from '../constants';

interface Props {
  gameState: GameState;
  onNodeSelect: (node: MapNode) => void;
}

const MapView: React.FC<Props> = ({ gameState, onNodeSelect }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

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

  const getNodeColor = (type: string) => {
    switch(type) {
      case 'Elite': return 'from-purple-900 to-indigo-950 border-purple-500';
      case 'Boss': return 'from-red-900 to-black border-yellow-500';
      case 'Shop': return 'from-yellow-900 to-orange-950 border-yellow-500';
      case 'Barracks': return 'from-green-900 to-emerald-950 border-green-500';
      default: return 'from-zinc-900 to-black border-zinc-500';
    }
  };

  return (
    <div className="w-full h-full bg-black overflow-hidden relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-950/40 via-transparent to-transparent opacity-60" />
      
      <div 
        ref={scrollRef}
        className="w-full h-full overflow-y-auto pt-40 pb-32 flex flex-col-reverse items-center relative z-10 space-y-reverse space-y-12"
      >
        {gameState.map.map((floor, fIdx) => (
          <div key={fIdx} id={`floor-${fIdx + 1}`} className="flex justify-center items-center gap-6 w-full px-4 relative">
            <div className="absolute left-4 text-zinc-800 font-cinzel font-black text-2xl select-none -rotate-90">FLOOR {fIdx + 1}</div>
            
            <div className="flex flex-wrap justify-center gap-6">
              {floor.map((node) => {
                const selectable = canSelectNode(node);
                const isCurrent = gameState.currentNodeId === node.id;
                
                return (
                  <div key={node.id} className="relative flex flex-col items-center">
                    <button
                      disabled={!selectable && !node.completed}
                      onClick={() => onNodeSelect(node)}
                      className={`
                        w-14 h-14 rounded-2xl border-2 flex items-center justify-center text-xl transition-all relative z-20 bg-gradient-to-br
                        ${getNodeColor(node.type)}
                        ${node.completed ? 'grayscale opacity-30 scale-90' : ''}
                        ${selectable ? 'scale-110 shadow-[0_0_15px_rgba(239,68,68,0.4)] border-red-500 active:scale-125 active-node' : 'opacity-60'}
                        ${isCurrent ? 'ring-2 ring-yellow-400 ring-offset-2 ring-offset-black' : ''}
                      `}
                    >
                      {getNodeIcon(node.type)}
                    </button>
                    <span className={`mt-1 text-[8px] font-bold uppercase tracking-tighter ${selectable ? 'text-red-500' : 'text-zinc-600'}`}>
                      {node.type}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] p-3 bg-zinc-900/90 border border-white/5 rounded-2xl backdrop-blur-md flex justify-between items-center shadow-2xl">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
          <span className="text-[10px] font-cinzel text-zinc-400">Current Progress</span>
        </div>
        <span className="text-xs font-bold font-mono text-white">FLOOR {gameState.currentFloor} / {MAX_FLOORS}</span>
      </div>
    </div>
  );
};

export default MapView;
