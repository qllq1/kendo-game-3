import React, { useState, useEffect } from 'react';
import KendoCanvas from './components/KendoCanvas';
import Controls from './components/Controls';
import GameLog from './components/GameLog';
import { Stance, Distance, GameState, TechniqueCategory } from './types';
import { TECHNIQUES, MOVEMENT_ACTIONS } from './constants';
import { judgeTurn } from './services/geminiService';
import { decideCpuAction } from './services/cpuStrategy';

const INITIAL_STATE: GameState = {
  playerStance: Stance.CHUDAN,
  cpuStance: Stance.JODAN,
  distance: Distance.TOH_MA,
  playerScore: 0,
  cpuScore: 0,
  history: [],
  recentPlayerActions: [],
  isLoading: false,
  gameOver: false,
  winner: null,
};

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(INITIAL_STATE);
  const [setupComplete, setSetupComplete] = useState(false);
  const [lastEvent, setLastEvent] = useState<string | null>(null);

  const handleSetup = (stance: Stance) => {
    setGameState(prev => ({ ...prev, playerStance: stance }));
    setSetupComplete(true);
  };

  const handleAction = async (playerActionId: string) => {
    if (gameState.gameOver || gameState.isLoading) return;

    setGameState(prev => ({ ...prev, isLoading: true }));

    // CPU Logic: Advanced Adaptive Strategy
    const cpuActionId = decideCpuAction(
        gameState.distance,
        gameState.playerStance,
        gameState.cpuStance,
        gameState.recentPlayerActions
    );

    // 1. Handle Pure Movement (Pre-Judgment)
    // This ensures basic distance mechanics work deterministically without AI hallucination
    let newDistance = gameState.distance;
    let distanceChanged = false;

    const pMove = MOVEMENT_ACTIONS.find(m => m.id === playerActionId);
    const cMove = MOVEMENT_ACTIONS.find(m => m.id === cpuActionId);

    if (pMove && cMove) {
        // Both moving
        if (playerActionId === 'move_forward' && cpuActionId === 'move_forward') {
            newDistance = Distance.CHIKA_MA; // Crash into each other
        } else if (playerActionId === 'move_backward' && cpuActionId === 'move_backward') {
            newDistance = Distance.TOH_MA;
        }
        // Else stay same roughly or intermediate logic
        distanceChanged = true;
    } else if (pMove) {
        if (playerActionId === 'move_forward') {
             if (gameState.distance === Distance.TOH_MA) newDistance = Distance.ISSOKU_ITTO;
             else if (gameState.distance === Distance.ISSOKU_ITTO) newDistance = Distance.CHIKA_MA;
        } else {
             if (gameState.distance === Distance.CHIKA_MA) newDistance = Distance.ISSOKU_ITTO;
             else if (gameState.distance === Distance.ISSOKU_ITTO) newDistance = Distance.TOH_MA;
        }
        distanceChanged = true;
    } else if (cMove) {
         if (cpuActionId === 'move_forward') {
             if (gameState.distance === Distance.TOH_MA) newDistance = Distance.ISSOKU_ITTO;
             else if (gameState.distance === Distance.ISSOKU_ITTO) newDistance = Distance.CHIKA_MA;
        } else {
             if (gameState.distance === Distance.CHIKA_MA) newDistance = Distance.ISSOKU_ITTO;
             else if (gameState.distance === Distance.ISSOKU_ITTO) newDistance = Distance.TOH_MA;
        }
        distanceChanged = true;
    }

    // If strictly movement, skip Gemini heavy judging for points, just log it.
    // UNLESS one moved and the other attacked.
    
    let turnResult;
    
    if (pMove && cMove) {
         // Both just moved
         turnResult = {
             winner: 'NONE',
             reason: '双方调整了距离。',
             techniqueUsed: '移动',
             counterTechnique: '移动',
             distanceCheck: true,
             rngRoll: 0,
             isIppon: false
         };
    } else {
        // Interaction happened (Attack vs Attack, Attack vs Move, etc)
        turnResult = await judgeTurn(
            gameState.playerStance,
            playerActionId,
            gameState.cpuStance,
            cpuActionId,
            gameState.distance
        );
    }

    // Update State
    setGameState(prev => {
        let pScore = prev.playerScore;
        let cScore = prev.cpuScore;
        let gameOver = prev.gameOver;
        let winner = prev.winner;

        if (turnResult.winner === 'PLAYER') {
            pScore++;
            setLastEvent('PLAYER_HIT');
            // Reset distance on hit? Usually strictly back to center/distance.
            newDistance = Distance.TOH_MA;
        } else if (turnResult.winner === 'CPU') {
            cScore++;
            setLastEvent('CPU_HIT');
            newDistance = Distance.TOH_MA;
        } else {
            setLastEvent(null);
        }

        if (pScore >= 2) {
            gameOver = true;
            winner = 'PLAYER';
        } else if (cScore >= 2) {
            gameOver = true;
            winner = 'CPU';
        }

        // Format log
        const logEntry = `${turnResult.reason}`;
        
        // Update History
        const updatedRecentActions = [...prev.recentPlayerActions, playerActionId].slice(-5);

        return {
            ...prev,
            playerScore: pScore,
            cpuScore: cScore,
            distance: newDistance,
            history: [...prev.history, logEntry],
            recentPlayerActions: updatedRecentActions,
            isLoading: false,
            gameOver,
            winner
        };
    });
  };

  const resetGame = () => {
    setGameState(INITIAL_STATE);
    setSetupComplete(false);
  };

  // Setup Screen
  if (!setupComplete) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col items-center justify-center font-sans p-4">
         <h1 className="text-4xl md:text-6xl font-black text-red-600 mb-8 tracking-tighter uppercase">Kendo Master</h1>
         <div className="max-w-md w-full bg-neutral-900 border border-neutral-800 p-8 rounded-2xl shadow-2xl">
            <h2 className="text-xl mb-6 text-center font-bold text-gray-300">Choose your Kamae (Stance)</h2>
            <div className="space-y-4">
                <button 
                    onClick={() => handleSetup(Stance.CHUDAN)}
                    className="w-full p-4 bg-indigo-900 hover:bg-indigo-800 border border-indigo-700 rounded-xl transition flex items-center justify-between group"
                >
                    <span className="font-bold text-lg">Chudan (中段)</span>
                    <span className="text-xs text-indigo-300 group-hover:text-white">Standard / Defensive</span>
                </button>
                <button 
                    onClick={() => handleSetup(Stance.JODAN)}
                    className="w-full p-4 bg-red-900 hover:bg-red-800 border border-red-700 rounded-xl transition flex items-center justify-between group"
                >
                    <span className="font-bold text-lg">Jodan (上段)</span>
                    <span className="text-xs text-red-300 group-hover:text-white">Aggressive / High Risk</span>
                </button>
            </div>
         </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-gray-100 font-sans flex flex-col">
      {/* Header */}
      <header className="bg-neutral-900 border-b border-neutral-800 p-4 flex justify-between items-center shadow-lg z-10">
        <div className="flex items-center gap-4">
            <div className="flex flex-col">
                <span className="text-xs text-gray-500 uppercase tracking-widest">Player</span>
                <div className="flex gap-1">
                    <div className={`w-6 h-6 rounded-full ${gameState.playerScore >= 1 ? 'bg-red-600 shadow-[0_0_10px_red]' : 'bg-neutral-800'}`}></div>
                    <div className={`w-6 h-6 rounded-full ${gameState.playerScore >= 2 ? 'bg-red-600 shadow-[0_0_10px_red]' : 'bg-neutral-800'}`}></div>
                </div>
            </div>
        </div>

        <div className="text-center">
            <h1 className="font-bold text-xl tracking-widest">剣道</h1>
            <div className="text-xs px-2 py-1 bg-neutral-800 rounded mt-1 text-yellow-400 border border-neutral-700">
                {gameState.distance}
            </div>
        </div>

        <div className="flex items-center gap-4 text-right">
            <div className="flex flex-col items-end">
                <span className="text-xs text-gray-500 uppercase tracking-widest">CPU</span>
                <div className="flex gap-1">
                    <div className={`w-6 h-6 rounded-full ${gameState.cpuScore >= 1 ? 'bg-white shadow-[0_0_10px_white]' : 'bg-neutral-800'}`}></div>
                    <div className={`w-6 h-6 rounded-full ${gameState.cpuScore >= 2 ? 'bg-white shadow-[0_0_10px_white]' : 'bg-neutral-800'}`}></div>
                </div>
            </div>
        </div>
      </header>

      {/* Main Game Area */}
      <main className="flex-grow flex flex-col max-w-4xl w-full mx-auto p-2 md:p-4 gap-4">
        
        {/* Visuals */}
        <div className="relative w-full aspect-video">
             <KendoCanvas 
                playerStance={gameState.playerStance}
                cpuStance={gameState.cpuStance}
                distance={gameState.distance}
                lastAction={lastEvent}
             />
             
             {/* Game Over Overlay */}
             {gameState.gameOver && (
                 <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-20 backdrop-blur-sm">
                     <h2 className="text-6xl font-black text-white mb-4">
                        {gameState.winner === 'PLAYER' ? <span className="text-red-500">VICTORY</span> : 'DEFEAT'}
                     </h2>
                     <p className="text-xl text-gray-300 mb-8">
                        {gameState.winner === 'PLAYER' ? '胜负已分 (Shobu Ari) - Player Wins' : '胜负已分 (Shobu Ari) - CPU Wins'}
                     </p>
                     <button 
                        onClick={resetGame}
                        className="px-8 py-3 bg-white text-black font-bold text-lg rounded hover:bg-gray-200 transition"
                     >
                        Again
                     </button>
                 </div>
             )}

             {/* Loading Overlay */}
             {gameState.isLoading && !gameState.gameOver && (
                 <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                     <div className="bg-black/70 px-6 py-3 rounded text-white font-mono animate-pulse border border-white/20">
                         JUDGING... (判定中)
                     </div>
                 </div>
             )}
        </div>

        {/* Logs */}
        <GameLog history={gameState.history} />

        {/* Controls */}
        <Controls 
            onAction={handleAction} 
            disabled={gameState.isLoading || gameState.gameOver}
            distance={gameState.distance}
        />

      </main>
    </div>
  );
};

export default App;