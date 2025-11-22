import React from 'react';
import { TECHNIQUES, MOVEMENT_ACTIONS } from '../constants';
import { TechniqueCategory, Distance } from '../types';

interface ControlsProps {
  onAction: (actionId: string) => void;
  disabled: boolean;
  distance: Distance;
}

const Controls: React.FC<ControlsProps> = ({ onAction, disabled, distance }) => {
  
  const shikake = TECHNIQUES.filter(t => t.category === TechniqueCategory.SHIKAKE);
  const oji = TECHNIQUES.filter(t => t.category === TechniqueCategory.OJI);

  const isTohMa = distance === Distance.TOH_MA;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-neutral-900 rounded-t-xl border-t border-neutral-700">
      
      {/* Left: Shikake Waza */}
      <div className="space-y-2">
        <h3 className="text-red-500 font-bold text-center border-b border-red-900 pb-1 mb-2">仕掛技 (Shikake Waza)</h3>
        <div className="grid grid-cols-2 gap-2">
          {shikake.map(tech => (
            <button
              key={tech.id}
              onClick={() => onAction(tech.id)}
              disabled={disabled}
              className={`p-2 text-xs md:text-sm rounded font-medium transition-all 
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}
                ${tech.id === 'hiki' && distance !== Distance.CHIKA_MA ? 'bg-gray-800 text-gray-500' : 'bg-red-900/40 hover:bg-red-800 text-red-100 border border-red-800'}
              `}
              title={tech.description}
            >
              <div className="font-bold">{tech.name.split(' ')[0]}</div>
              <div className="text-[10px] opacity-75">{tech.japanese}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Center: Movement & Status */}
      <div className="flex flex-col justify-between space-y-2">
        <h3 className="text-yellow-500 font-bold text-center border-b border-yellow-900 pb-1 mb-2">移动 (Movement)</h3>
        <div className="flex flex-col gap-2 flex-grow justify-center">
           {MOVEMENT_ACTIONS.map(action => (
             <button
               key={action.id}
               onClick={() => onAction(action.id)}
               disabled={disabled}
               className={`p-3 rounded font-bold text-yellow-100 border border-yellow-700 transition-all
                ${disabled ? 'opacity-50' : 'hover:bg-yellow-900 active:bg-yellow-800'}
                bg-yellow-900/40
               `}
             >
               {action.name}
             </button>
           ))}
        </div>
        <div className="text-center text-gray-400 text-xs mt-2">
            {isTohMa && <span className="text-blue-400 animate-pulse">远距离 (Toh-ma): 请先缩短距离或使用远距离突刺</span>}
        </div>
      </div>

      {/* Right: Oji Waza */}
      <div className="space-y-2">
        <h3 className="text-purple-500 font-bold text-center border-b border-purple-900 pb-1 mb-2">应击技 (Oji Waza)</h3>
        <div className="grid grid-cols-2 gap-2">
          {oji.map(tech => (
            <button
              key={tech.id}
              onClick={() => onAction(tech.id)}
              disabled={disabled}
              className={`p-2 text-xs md:text-sm rounded font-medium transition-all
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}
                bg-purple-900/40 hover:bg-purple-800 text-purple-100 border border-purple-800
              `}
              title={tech.description}
            >
              <div className="font-bold">{tech.name.split(' ')[0]}</div>
              <div className="text-[10px] opacity-75">{tech.japanese}</div>
            </button>
          ))}
        </div>
      </div>

    </div>
  );
};

export default Controls;
