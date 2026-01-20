
import { Grade, Unit } from './types';

export const GRADE_COLORS: Record<Grade, string> = {
  [Grade.NORMAL]: 'text-gray-400',
  [Grade.MAGIC]: 'text-green-400',
  [Grade.RARE]: 'text-blue-400',
  [Grade.EPIC]: 'text-purple-400',
  [Grade.UNIQUE]: 'text-yellow-400',
  [Grade.LEGEND]: 'text-orange-500',
  [Grade.ETERNAL]: 'text-red-500',
  [Grade.BEYOND]: 'text-pink-500',
};

export const GRADE_BG: Record<Grade, string> = {
  [Grade.NORMAL]: 'bg-gray-800',
  [Grade.MAGIC]: 'bg-green-900',
  [Grade.RARE]: 'bg-blue-900',
  [Grade.EPIC]: 'bg-purple-900',
  [Grade.UNIQUE]: 'bg-yellow-900',
  [Grade.LEGEND]: 'bg-orange-900',
  [Grade.ETERNAL]: 'bg-red-900',
  [Grade.BEYOND]: 'bg-pink-900',
};

export const BASE_UNITS: Unit[] = [
  { id: 'u1', name: '하급 검사', grade: Grade.NORMAL, hp: 100, maxHp: 100, atk: 15, def: 5, range: 40, speed: 60, level: 1, icon: '⚔️', color: 'gray' },
  { id: 'u2', name: '하급 마법사', grade: Grade.NORMAL, hp: 60, maxHp: 60, atk: 25, def: 2, range: 200, speed: 40, level: 1, icon: '🔮', color: 'blue' },
  { id: 'u3', name: '하급 궁수', grade: Grade.NORMAL, hp: 70, maxHp: 70, atk: 18, def: 3, range: 150, speed: 50, level: 1, icon: '🏹', color: 'green' },
  { id: 'u4', name: '하급 도끼병', grade: Grade.NORMAL, hp: 130, maxHp: 130, atk: 12, def: 8, range: 35, speed: 45, level: 1, icon: '🪓', color: 'red' },
];

export const SPECIAL_UNITS: Record<string, Unit> = {
  '마검사': { id: 's1', name: '마검사', grade: Grade.MAGIC, hp: 150, maxHp: 150, atk: 35, def: 10, range: 45, speed: 65, level: 1, icon: '✨', color: 'indigo' },
  '흑검사': { id: 's2', name: '흑검사', grade: Grade.MAGIC, hp: 180, maxHp: 180, atk: 40, def: 12, range: 45, speed: 70, level: 1, icon: '🌑', color: 'black' },
  '암흑검사': { id: 's3', name: '암흑검사', grade: Grade.RARE, hp: 300, maxHp: 300, atk: 65, def: 20, range: 50, speed: 75, level: 1, icon: '🔥', color: 'red' },
  '대천사': { id: 'e1', name: '대천사', grade: Grade.RARE, hp: 500, maxHp: 500, atk: 50, def: 25, range: 100, speed: 50, level: 1, icon: '👼', color: 'white' },
};

export const COMBINATIONS = [
  { ingredients: ['하급 검사', '하급 검사', '하급 마법사', '하급 마법사'], result: '마검사' },
  { ingredients: ['흑검사', '하급 마법사', '하급 마법사'], result: '암흑검사' },
];

export const MAX_FLOORS = 25;
