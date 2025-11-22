import React, { useRef, useEffect } from 'react';
import { Distance, Stance } from '../types';

interface KendoCanvasProps {
  playerStance: Stance;
  cpuStance: Stance;
  distance: Distance;
  lastAction: string | null; // To trigger animations
}

const KendoCanvas: React.FC<KendoCanvasProps> = ({ playerStance, cpuStance, distance, lastAction }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number>(0);
  const tickRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Animation loop
    const render = () => {
      tickRef.current += 1;
      
      // Reset Canvas
      ctx.fillStyle = '#1e1b4b'; // Dark Indigo background (Dojo wall)
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw Floor
      ctx.fillStyle = '#d97706'; // Wood floor
      ctx.beginPath();
      ctx.moveTo(0, canvas.height * 0.7);
      ctx.lineTo(canvas.width, canvas.height * 0.7);
      ctx.lineTo(canvas.width, canvas.height);
      ctx.lineTo(0, canvas.height);
      ctx.fill();

      // Draw Perspective Lines on Floor
      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 2;
      for (let i = 0; i < canvas.width; i += 40) {
        ctx.beginPath();
        ctx.moveTo(i + (tickRef.current % 40) * 0.1, canvas.height * 0.7);
        ctx.lineTo(i - 100 + (tickRef.current % 40) * 2, canvas.height);
        ctx.stroke();
      }

      // Calculate positions based on distance
      let gap = 100;
      if (distance === Distance.TOH_MA) gap = 200;
      if (distance === Distance.CHIKA_MA) gap = 40;

      const centerX = canvas.width / 2;
      const playerX = centerX - gap;
      const cpuX = centerX + gap;
      const groundY = canvas.height * 0.75;

      // Bobbing animation
      const bob = Math.sin(tickRef.current * 0.1) * 2;

      // --- Draw Player (Left) ---
      drawKendoka(ctx, playerX, groundY + bob, true, playerStance, lastAction === 'PLAYER_HIT');

      // --- Draw CPU (Right) ---
      drawKendoka(ctx, cpuX, groundY + bob, false, cpuStance, lastAction === 'CPU_HIT');

      frameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(frameRef.current);
  }, [playerStance, cpuStance, distance, lastAction]);

  const drawKendoka = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    isPlayer: boolean,
    stance: Stance,
    isHit: boolean
  ) => {
    const scale = 4; // Pixel scale
    const facing = isPlayer ? 1 : -1;
    
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(facing * scale, scale); // Flip for CPU

    // Determine arm position based on stance
    const isJodan = stance === Stance.JODAN;

    // Colors
    const hakamaColor = '#172554'; // Dark Blue
    const boguColor = '#111827'; // Black armor
    const skinColor = '#fca5a5';
    const swordColor = '#fcd34d'; // Bamboo

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(0, 0, 12, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Legs (Hakama)
    ctx.fillStyle = hakamaColor;
    // Left leg
    ctx.fillRect(-6, -15, 5, 15);
    // Right leg (stepped back usually)
    ctx.fillRect(1, -15, 5, 15);
    // Hakama pleats body
    ctx.beginPath();
    ctx.moveTo(-8, -15);
    ctx.lineTo(8, -15);
    ctx.lineTo(6, -30);
    ctx.lineTo(-6, -30);
    ctx.fill();

    // Torso (Do)
    ctx.fillStyle = boguColor;
    ctx.fillRect(-7, -42, 14, 14); // Chest
    // Tare (Flap)
    ctx.fillRect(-6, -28, 12, 6);

    // Head (Men)
    ctx.fillStyle = boguColor;
    ctx.fillRect(-5, -54, 10, 10);
    // Men Grille (Metal)
    ctx.fillStyle = '#9ca3af';
    ctx.fillRect(-4, -52, 8, 4);
    
    // Red/White Ribbon (Tasuki) on back
    ctx.fillStyle = isPlayer ? '#ef4444' : '#ffffff'; // Red for player, White for CPU
    ctx.fillRect(-6, -40, 3, 8);

    // Arms & Sword
    // Simplistic pixel arms
    ctx.fillStyle = hakamaColor; // Keikogi sleeve

    if (isJodan) {
        // Arms Up
        ctx.fillRect(-8, -48, 4, 10); // Left arm
        ctx.fillRect(4, -48, 4, 10);  // Right arm
        
        // Sword (Shinai) - Held high vertically/angled
        ctx.strokeStyle = swordColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(6, -50); // Hands
        ctx.lineTo(15, -75); // Tip
        ctx.stroke();
    } else {
        // Chudan (Mid)
        ctx.fillRect(-8, -38, 4, 10);
        ctx.fillRect(4, -38, 4, 10); // Forward arm

        // Sword (Shinai) - Pointing at throat
        ctx.strokeStyle = swordColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(6, -35); // Hands
        ctx.lineTo(25, -38); // Tip
        ctx.stroke();
    }

    // Hit Flash effect
    if (isHit) {
        ctx.globalCompositeOperation = 'source-atop';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.fillRect(-20, -80, 40, 80);
    }

    ctx.restore();
  };

  return (
    <div className="w-full h-full border-4 border-neutral-800 rounded-lg overflow-hidden shadow-2xl bg-black relative">
      <canvas
        ref={canvasRef}
        width={640}
        height={360}
        className="w-full h-full object-contain pixelated"
        style={{ imageRendering: 'pixelated' }}
      />
      {/* Scanline effect */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 bg-[length:100%_2px,3px_100%] pointer-events-none"></div>
    </div>
  );
};

export default KendoCanvas;
