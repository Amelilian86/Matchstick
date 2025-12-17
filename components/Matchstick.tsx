import React from 'react';
import clsx from 'clsx';

interface MatchstickProps {
  active: boolean;
  onClick: () => void;
  vertical?: boolean;
  className?: string;
  isGhost?: boolean;
  style?: React.CSSProperties;
}

export const Matchstick: React.FC<MatchstickProps> = ({ 
  active, 
  onClick, 
  vertical = false,
  className,
  isGhost = false,
  style
}) => {
  
  return (
    <div
      onClick={onClick}
      style={style}
      className={clsx(
        "absolute cursor-pointer transition-all duration-300 group select-none flex items-center justify-center",
        vertical ? "w-3 h-full py-1" : "w-full h-3 px-1",
        className
      )}
      role="button"
      aria-label="Matchstick"
    >
      {/* Hitbox area for easier clicking */}
      <div className="absolute -inset-3 z-10" />

      {/* The Stick Visual */}
      <div 
        className={clsx(
          "relative rounded-full transition-all duration-300 matchstick-shadow",
          vertical ? "w-2 h-full" : "w-full h-2",
          active 
            ? "opacity-100 scale-100" 
            : isGhost ? "opacity-10 scale-95 bg-white/20" : "opacity-0 scale-50",
        )}
      >
        {/* Wood Shaft - using gradient for 3D effect */}
        <div className={clsx(
            "absolute inset-0 rounded-full overflow-hidden",
            active ? "bg-gradient-to-r from-amber-200 via-amber-300 to-amber-400" : isGhost ? "hidden" : "hidden"
        )}>
             {/* Subtle wood grain or highlight */}
             <div className="absolute inset-0 bg-black/5"></div>
        </div>

        {/* Match Head */}
        {active && (
            <div className={clsx(
                "absolute bg-red-600 rounded-full z-20 shadow-sm",
                // Gradient for head
                "bg-gradient-to-br from-red-500 to-red-700",
                vertical 
                    ? "top-0 left-1/2 -translate-x-1/2 w-3 h-5" 
                    : "left-0 top-1/2 -translate-y-1/2 w-5 h-3"
            )} />
        )}
        
        {/* Hover Highlight (Ghost or Active) */}
        <div className={clsx(
            "absolute inset-0 rounded-full transition-colors duration-200",
            "group-hover:bg-yellow-400/40"
        )} />
      </div>
    </div>
  );
};