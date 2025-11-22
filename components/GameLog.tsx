import React, { useEffect, useRef } from 'react';

interface GameLogProps {
  history: string[];
}

const GameLog: React.FC<GameLogProps> = ({ history }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  return (
    <div className="bg-neutral-900 border border-neutral-700 rounded-lg p-4 h-48 overflow-y-auto font-mono text-sm custom-scrollbar" ref={scrollRef}>
      {history.length === 0 ? (
        <div className="text-gray-500 italic text-center mt-10">比赛开始... 双方行礼...</div>
      ) : (
        history.map((entry, idx) => (
          <div key={idx} className="mb-2 pb-2 border-b border-neutral-800 last:border-0">
            <span className="text-gray-400 mr-2">[{idx + 1}]</span>
            <span className={entry.includes('Player得分') ? 'text-red-400 font-bold' : entry.includes('CPU得分') ? 'text-white font-bold' : 'text-gray-300'}>
              {entry}
            </span>
          </div>
        ))
      )}
    </div>
  );
};

export default GameLog;
