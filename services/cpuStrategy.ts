import { Distance, Stance, TechniqueCategory } from '../types';
import { TECHNIQUES, MOVEMENT_ACTIONS } from '../constants';

/**
 * Determines the best action for the CPU based on current game state and player history.
 * Uses a weighted random approach heavily biased by tactical logic.
 */
export const decideCpuAction = (
    distance: Distance,
    playerStance: Stance,
    cpuStance: Stance,
    playerHistory: string[] // List of recent player action IDs
): string => {
    const weights: Record<string, number> = {};
    
    // Filter helper
    const shikakeIds = TECHNIQUES.filter(t => t.category === TechniqueCategory.SHIKAKE).map(t => t.id);
    const ojiIds = TECHNIQUES.filter(t => t.category === TechniqueCategory.OJI).map(t => t.id);
    const moveIds = MOVEMENT_ACTIONS.map(m => m.id);
    const allIds = [...shikakeIds, ...ojiIds, ...moveIds];

    // Initialize base weights (default low)
    allIds.forEach(id => weights[id] = 1);

    // --- 1. DISTANCE LOGIC ---
    if (distance === Distance.TOH_MA) {
        // FAR: Attacks are generally ineffective. Prioritize closing distance.
        weights['move_forward'] = 100; 
        weights['move_backward'] = 0; // Staying back is passive
        
        // Disable standard techniques as they can't reach
        shikakeIds.forEach(id => weights[id] = 0);
        ojiIds.forEach(id => weights[id] = 0);
        
        // Exceptions: Tactical waiting or long-range surprise
        weights['debana'] = 5; // Anticipating a rush
    } 
    else if (distance === Distance.CHIKA_MA) {
        // CLOSE: Tsubazeriai. Need to separate or use Hiki waza.
        weights['hiki'] = 80; // Prime range for Hiki
        weights['move_backward'] = 60; // Reset to neutral
        weights['move_forward'] = 0; // Cannot get closer
        
        // Regular attacks turn into shoves or are stuffed
        shikakeIds.forEach(id => { if(id !== 'hiki') weights[id] = 5; });
        ojiIds.forEach(id => weights[id] = 5);
    } 
    else {
        // ISSOKU-ITTO (Mid): The Combat Zone
        weights['move_forward'] = 15; // Pressure
        weights['move_backward'] = 10; // Create space
        
        // Standard engagement
        shikakeIds.forEach(id => weights[id] = 30);
        ojiIds.forEach(id => weights[id] = 20); // Counters are slightly harder/riskier

        // Specific Rule: Hiki only works at close range
        weights['hiki'] = 0;
        
        // --- 2. PLAYER PATTERN ADAPTATION ---
        // Analyze last 3 moves
        const recent = playerHistory.slice(-3);
        const attackCount = recent.filter(id => shikakeIds.includes(id)).length;
        const forwardCount = recent.filter(id => id === 'move_forward').length;

        if (attackCount >= 2) {
            // Player is spamming attacks -> COUNTER THEM
            // Increase Oji Waza (Nuki, Kaeshi, Suriage)
            ojiIds.forEach(id => weights[id] += 50);
            // Debana is also great (Interception)
            weights['debana'] += 60;
            // Reduce own initiative attacks to avoid Ai-uchi (clash)
            weights['ippon'] -= 10;
        }

        if (forwardCount >= 2) {
            // Player is rushing in -> Intercept
            weights['debana'] += 50; // Hit them as they move
            weights['nuki'] += 30; // Dodge and hit
            weights['ippon'] += 20; // Meet them (Men!)
        }

        // --- 3. STANCE MATCHUPS ---
        if (playerStance === Stance.JODAN) {
            // Player is Jodan (High Stance - Aggressive, weak vs Kote/Tsuki)
            // CPU needs to be careful of the big Men strike.
            
            // Debana is effective to catch them as they start the big swing
            weights['debana'] += 30;
            
            // Kaeshi (Parry-Riposte) is safer than blocking
            weights['kaeshi'] += 20;

            // Do not just walk into them
            weights['move_forward'] -= 10;
        } else {
            // Player is Chudan
            // Standard play. 
            // Katsugi (Surprise) works well against stable Chudan
            weights['katsugi'] += 10;
        }
        
        // --- 4. CPU STANCE LOGIC ---
        if (cpuStance === Stance.JODAN) {
            // If CPU is Jodan, it should be aggressive with Men (Ippon)
            weights['ippon'] += 25;
            // Oji waza is harder from Jodan
            ojiIds.forEach(id => weights[id] -= 10);
        }
    }

    // --- SELECTION ---
    // Convert weights to a flat array for selection
    const weightedList: string[] = [];
    Object.entries(weights).forEach(([id, weight]) => {
        const count = Math.floor(Math.max(0, weight));
        for (let i = 0; i < count; i++) {
            weightedList.push(id);
        }
    });

    // Fallback
    if (weightedList.length === 0) return 'move_forward';

    return weightedList[Math.floor(Math.random() * weightedList.length)];
};