export enum Stance {
  CHUDAN = 'Chudan (中段)',
  JODAN = 'Jodan (上段)',
}

export enum Distance {
  TOH_MA = 'Toh-ma (远距离)',
  ISSOKU_ITTO = 'Issoku-itto (一足一刀)',
  CHIKA_MA = 'Chika-ma (近距离)',
}

export enum TechniqueCategory {
  SHIKAKE = 'Shikake Waza (仕掛技)',
  OJI = 'Oji Waza (应击技)',
  MOVEMENT = 'Movement (移动)',
}

export interface Technique {
  id: string;
  name: string;
  japanese: string;
  category: TechniqueCategory;
  description: string;
}

export interface TurnResult {
  winner: 'PLAYER' | 'CPU' | 'NONE';
  reason: string; // The narrative explanation in Chinese
  techniqueUsed: string;
  counterTechnique: string;
  distanceCheck: boolean; // Was distance valid for the technique?
  rngRoll: number; // The random number generated
  isIppon: boolean; // Did it meet the > 0.6 threshold?
}

export interface GameState {
  playerStance: Stance;
  cpuStance: Stance;
  distance: Distance;
  playerScore: number;
  cpuScore: number;
  history: string[];
  recentPlayerActions: string[]; // Tracks IDs of recent player moves for AI analysis
  isLoading: boolean;
  gameOver: boolean;
  winner: string | null;
}