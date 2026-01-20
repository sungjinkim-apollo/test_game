
import { MapNode, NodeType, Grade, Unit } from '../types';
import { BASE_UNITS, MAX_FLOORS } from '../constants';

export const generateMap = (): MapNode[][] => {
  const map: MapNode[][] = [];

  for (let f = 0; f < MAX_FLOORS; f++) {
    const floorNodes: MapNode[] = [];
    const numNodes = f === MAX_FLOORS - 1 ? 1 : Math.floor(Math.random() * 4) + 2; // 2-5 nodes, except boss floor

    for (let n = 0; n < numNodes; n++) {
      let type: NodeType = 'Battle';
      const rand = Math.random();
      if (f === MAX_FLOORS - 1) type = 'Boss';
      else if (rand < 0.15) type = 'Elite';
      else if (rand < 0.25) type = 'Shop';
      else if (rand < 0.35) type = 'Barracks';

      floorNodes.push({
        id: `f${f}n${n}`,
        floor: f + 1,
        type,
        connections: [],
        completed: false
      });
    }
    map.push(floorNodes);
  }

  // Connect floors
  for (let f = 0; f < MAX_FLOORS - 1; f++) {
    const currentFloor = map[f];
    const nextFloor = map[f + 1];
    
    currentFloor.forEach((node) => {
      // Each node connects to 1-3 random nodes in next floor
      const numConnections = Math.min(nextFloor.length, Math.floor(Math.random() * 3) + 1);
      const shuffledNext = [...nextFloor].sort(() => 0.5 - Math.random());
      for (let i = 0; i < numConnections; i++) {
        node.connections.push(shuffledNext[i].id);
      }
    });
  }

  return map;
};

export const performGacha = (magicStones: number): { unit: Unit; cost: number } | null => {
  if (magicStones < 100) return null;
  
  const rand = Math.random();
  let grade = Grade.NORMAL;
  if (rand < 0.01) grade = Grade.UNIQUE;
  else if (rand < 0.05) grade = Grade.EPIC;
  else if (rand < 0.15) grade = Grade.RARE;
  else if (rand < 0.40) grade = Grade.MAGIC;

  // Filter available units by grade (simplified for demo)
  const template = BASE_UNITS[Math.floor(Math.random() * BASE_UNITS.length)];
  return { 
    unit: { ...template, id: `u${Date.now()}`, grade },
    cost: 100 
  };
};

export const getUpgradeRequirement = (level: number) => {
  // Lvl 1->2: 3 times, Lvl 2->3: 5 times
  return (level * 2) + 1;
};

export const UPGRADE_GOLD_COST = 500;
