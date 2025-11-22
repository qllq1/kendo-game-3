import { GoogleGenAI, Type } from "@google/genai";
import { Stance, Distance, Technique, TurnResult } from '../types';
import { TECHNIQUES } from '../constants';

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const judgeTurn = async (
  playerStance: Stance,
  playerActionId: string,
  cpuStance: Stance,
  cpuActionId: string,
  distance: Distance
): Promise<TurnResult> => {
  
  const playerTech = TECHNIQUES.find(t => t.id === playerActionId) || { name: playerActionId, japanese: playerActionId, description: 'Movement' };
  const cpuTech = TECHNIQUES.find(t => t.id === cpuActionId) || { name: cpuActionId, japanese: cpuActionId, description: 'Movement' };

  const prompt = `
    You are a master Kendo referee (Shinpan). Analyze the following turn in a Kendo match between a Player and a CPU.
    
    Current State:
    - Distance: ${distance}
    - Player Stance: ${playerStance}
    - CPU Stance: ${cpuStance}
    
    Actions:
    - Player Action: ${playerTech.name} (${playerTech.japanese}) - ${playerTech.description}
    - CPU Action: ${cpuTech.name} (${cpuTech.japanese}) - ${cpuTech.description}

    Rules for Judgment:
    1. Distance matters heavily. 
       - 'Hiki Waza' (退击技) only works at 'Chika-ma' (Close). If used at Far/Mid, it fails automatically.
       - Most strikes require 'Issoku-itto' (Striking distance).
       - From 'Toh-ma' (Far), only movement or special long-range attempts work.
    2. Technique Interactions:
       - Oji Waza (Counter) generally beats Shikake Waza (Attack) IF executed correctly against the right target.
       - Debana Waza beats a standard strike start.
       - If both attack simultaneously (Ai-uchi), it's a clash (None wins) unless one has a clear superior timing (e.g., Debana).
       - If both move, no one scores.
    3. Stance Advantage:
       - Jodan is aggressive/strong against basic blocks but vulnerable to Kote (wrist) or Tsuki (throat).
    
    Task:
    Determine who has the THEORETICAL advantage (Player, CPU, or None).
    Explain the reasoning in CHINESE (Simulate a referee's commentary).
    
    Output JSON format adhering to this schema:
    {
      "theoreticalWinner": "PLAYER" | "CPU" | "NONE",
      "reasonChinese": "A short, dramatic explanation in Chinese of what happened and why one side prevailed or why it was a draw."
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            theoreticalWinner: { type: Type.STRING, enum: ['PLAYER', 'CPU', 'NONE'] },
            reasonChinese: { type: Type.STRING }
          },
          required: ['theoreticalWinner', 'reasonChinese']
        }
      }
    });

    const jsonText = response.text || '{}';
    const result = JSON.parse(jsonText);

    const rng = Math.random();
    const isIppon = rng > 0.6;

    // Determine final winner based on Theoretical Win AND RNG
    // If theoretical winner is NONE, RNG doesn't matter.
    // If theoretical winner is PLAYER, they only get point if isIppon is true.
    let finalWinner: 'PLAYER' | 'CPU' | 'NONE' = 'NONE';
    let reason = result.reasonChinese;

    if (result.theoreticalWinner === 'PLAYER') {
      if (isIppon) {
        finalWinner = 'PLAYER';
        reason += ` (气剑体一致! 有效得本! 判定值: ${rng.toFixed(2)})`;
      } else {
        finalWinner = 'NONE';
        reason += ` (虽然占据优势，但打击太浅或残心不足，未得本。判定值: ${rng.toFixed(2)})`;
      }
    } else if (result.theoreticalWinner === 'CPU') {
      if (isIppon) {
        finalWinner = 'CPU';
        reason += ` (气剑体一致! 有效得本! 判定值: ${rng.toFixed(2)})`;
      } else {
        finalWinner = 'NONE';
        reason += ` (虽然占据优势，但打击太浅或残心不足，未得本。判定值: ${rng.toFixed(2)})`;
      }
    } else {
        reason += " (双方均未造成有效打击。)";
    }

    return {
      winner: finalWinner,
      reason: reason,
      techniqueUsed: playerTech.name,
      counterTechnique: cpuTech.name,
      distanceCheck: true, 
      rngRoll: rng,
      isIppon: isIppon
    };

  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      winner: 'NONE',
      reason: '裁判正在商议中... (API Error, turn voided)',
      techniqueUsed: playerTech.name,
      counterTechnique: cpuTech.name,
      distanceCheck: false,
      rngRoll: 0,
      isIppon: false
    };
  }
};
