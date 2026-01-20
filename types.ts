
export enum Grade {
  NORMAL = '노멀',
  MAGIC = '매직',
  RARE = '레어',
  EPIC = '에픽',
  UNIQUE = '유니크',
  LEGEND = '레전드',
  ETERNAL = '이터널',
  BEYOND = '비욘드'
}

export type NodeType = 'Battle' | 'Elite' | 'Boss' | 'Shop' | 'Barracks';

export interface Unit {
  id: string;
  name: string;
  grade: Grade;
  hp: number;
  maxHp: number;
  atk: number;
  def: number;
  range: number;
  speed: number;
  level: number;
  icon: string;
  color: string;
}

export interface MapNode {
  id: string;
  floor: number;
  type: NodeType;
  connections: string[]; // Connected IDs in the next floor
  completed: boolean;
}

export interface GameState {
  gold: number;
  essence: number;
  magicStones: number;
  deck: Unit[];
  currentFloor: number;
  currentNodeId: string | null;
  map: MapNode[][]; // Array of floors, each floor is an array of nodes
  boardSize: number; // 2 to 5
  rouletteSlots: number; // 3 to 5
  boardUpgrades: number; // current upgrade progress
  rouletteUpgrades: number; // current upgrade progress
}
