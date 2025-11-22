import { Technique, TechniqueCategory } from './types';

export const TECHNIQUES: Technique[] = [
  // Shikake Waza (Left side of diagram)
  {
    id: 'ippon',
    name: '单发打击 (Ippon Uchi)',
    japanese: '一本打ち',
    category: TechniqueCategory.SHIKAKE,
    description: '最基本的直接打击 (面, 小手, 胴, 突)',
  },
  {
    id: 'renzoku',
    name: '连续技 (Renzoku Waza)',
    japanese: '連続技',
    category: TechniqueCategory.SHIKAKE,
    description: '如小手-面 (Kote-Men) 的二连击或三连击',
  },
  {
    id: 'debana',
    name: '出端技 (Debana Waza)',
    japanese: '出端技',
    category: TechniqueCategory.SHIKAKE,
    description: '在对手想要打击的瞬间先发制人',
  },
  {
    id: 'harai',
    name: '拂/卷/张技 (Harai/Maki/Hari)',
    japanese: '払い/巻き/張り技',
    category: TechniqueCategory.SHIKAKE,
    description: '破坏对手竹刀中心线后进行的打击',
  },
  {
    id: 'katsugi',
    name: '担技 (Katsugi Waza)',
    japanese: '担ぎ技',
    category: TechniqueCategory.SHIKAKE,
    description: '将竹刀担在肩上迷惑对手的奇袭',
  },
  {
    id: 'hiki',
    name: '退击技 (Hiki Waza)',
    japanese: '引き技',
    category: TechniqueCategory.SHIKAKE,
    description: '在近距离交锷时后退进行的打击',
  },

  // Oji Waza (Right side of diagram)
  {
    id: 'nuki',
    name: '拔技 (Nuki Waza)',
    japanese: '抜き技',
    category: TechniqueCategory.OJI,
    description: '避开对手打击的同时进行反击 (如面拔胴)',
  },
  {
    id: 'suriage',
    name: '磨上技 (Suriage Waza)',
    japanese: '擦り上げ技',
    category: TechniqueCategory.OJI,
    description: '用竹刀侧面画弧滑开对手打击并反击',
  },
  {
    id: 'kaeshi',
    name: '返技 (Kaeshi Waza)',
    japanese: '返し技',
    category: TechniqueCategory.OJI,
    description: '格挡后利用反作用力立即反击',
  },
  {
    id: 'uchiotoshi',
    name: '击落技 (Uchiotoshi Waza)',
    japanese: '打ち落とし技',
    category: TechniqueCategory.OJI,
    description: '将对手的竹刀从上往下击落并顺势打击',
  },
  {
    id: 'amashi',
    name: '余施技 (Amashi Waza)',
    japanese: '余し技',
    category: TechniqueCategory.OJI,
    description: '保持距离让对手打击落空，趁其力尽时反击',
  },
];

export const MOVEMENT_ACTIONS = [
  { id: 'move_forward', name: '前进 (Step In)' },
  { id: 'move_backward', name: '后退 (Step Back)' },
];
