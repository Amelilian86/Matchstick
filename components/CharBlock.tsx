import React from 'react';
import { Matchstick } from './Matchstick';
import { CharType } from '../types';
import { OPERATOR_LAYOUTS } from '../constants';
import clsx from 'clsx';

interface CharBlockProps {
  charIndex: number;
  type: CharType;
  value: string;
  segments: boolean[];
  onSegmentClick: (segmentIndex: number) => void;
  highlightedSegment: number | null;
  debug?: boolean;
}

export const CharBlock: React.FC<CharBlockProps> = ({
  type,
  value,
  segments,
  onSegmentClick,
  highlightedSegment,
  debug = false
}) => {
  // Container dimensions
  // Operators: w-20 (80px), h-36 (144px)
  // Digits: w-24 (96px), h-40 (160px)
  
  const debugStyle = debug ? "border border-pink-500/50 bg-pink-500/10" : "";
  const debugCenter = debug ? (
      <div className="absolute left-1/2 top-1/2 w-1 h-1 bg-cyan-400 -translate-x-1/2 -translate-y-1/2 z-50 rounded-full shadow-[0_0_4px_cyan]" />
  ) : null;

  if (type === CharType.OPERATOR) {
    // Operator Container: 80px x 144px
    const opWidth = 80; 
    const opHeight = 144;

    return (
        <div className={clsx("relative w-20 h-36 mx-2 flex-shrink-0 flex items-center justify-center select-none", debugStyle)}>
             {debugCenter}
             {OPERATOR_LAYOUTS[value]?.map((pos, idx) => {
                 // Calculate dimensions based on strict requirements
                 // Horizontal: opWidth * 0.55 = 44px
                 // Vertical: opHeight * 0.70 = 100.8px (~100px)
                 // Note: Matchstick vertical prop swaps width/height logic internally or via CSS classes,
                 // but here we define the container size for the matchstick.
                 
                 // However, Matchstick component logic is:
                 // vertical ? "w-3 h-full" : "w-full h-3"
                 // So we must set the container width/height to the desired length of the stick.
                 
                 const length = pos.vertical ? (opHeight * 0.70) : (opWidth * 0.55);
                 const styleWidth = pos.vertical ? '12px' : `${length}px`;
                 const styleHeight = pos.vertical ? `${length}px` : '12px';

                 // For Equals sign, we might want standard horizontal length (44px) too.
                 // The logic works for all operators currently.

                 return (
                    <div
                        key={idx}
                        className="absolute"
                        style={{ 
                            left: `${pos.x}%`, 
                            top: `${pos.y}%`,
                            transform: 'translate(-50%, -50%)', // Strictly center the stick anchor
                            width: styleWidth,
                            height: styleHeight
                        }}
                    >
                        {debug && (
                            <div className="absolute inset-0 border border-yellow-400/30 pointer-events-none" />
                        )}
                        <Matchstick
                            active={segments[idx]}
                            isGhost={!segments[idx]}
                            onClick={() => onSegmentClick(idx)}
                            vertical={pos.vertical}
                            className={highlightedSegment === idx ? "ring-2 ring-yellow-400 ring-offset-2 ring-offset-gray-800 rounded-full" : ""}
                        />
                    </div>
                 );
             })}
        </div>
    );
  }

  // Strict 7-segment grid for Digits
  // Container: 96px x 160px
  
  // Dimensions
  // H-Sticks: Top(A), Mid(G), Bot(D)
  // V-Sticks: TopLeft(F), TopRight(B), BotLeft(E), BotRight(C)

  const STICK_H_HEIGHT = '10px';
  const STICK_V_WIDTH = '10px';
  
  const segmentsConfig = [
    // A: Top Horizontal
    { horizontal: true, top: '5%', left: '15%', width: '70%', height: STICK_H_HEIGHT },
    // B: Top Right Vertical
    { horizontal: false, top: '12%', right: '5%', width: STICK_V_WIDTH, height: '38%' },
    // C: Bottom Right Vertical
    { horizontal: false, bottom: '12%', right: '5%', width: STICK_V_WIDTH, height: '38%' },
    // D: Bottom Horizontal
    { horizontal: true, bottom: '5%', left: '15%', width: '70%', height: STICK_H_HEIGHT },
    // E: Bottom Left Vertical
    { horizontal: false, bottom: '12%', left: '5%', width: STICK_V_WIDTH, height: '38%' },
    // F: Top Left Vertical
    { horizontal: false, top: '12%', left: '5%', width: STICK_V_WIDTH, height: '38%' },
    // G: Middle Horizontal
    { horizontal: true, top: '50%', left: '15%', width: '70%', height: STICK_H_HEIGHT, style: { transform: 'translateY(-50%)' } }
  ];

  return (
    <div className={clsx("relative w-24 h-40 mx-2 flex-shrink-0 select-none", debugStyle)}>
      {debugCenter}
      {segmentsConfig.map((config, idx) => (
        <div
            key={idx}
            className="absolute"
            style={{
                top: config.top,
                bottom: config.bottom,
                left: config.left,
                right: config.right,
                width: config.width,
                height: config.height,
                ...config.style
            }}
        >
            {debug && <div className="absolute inset-0 border border-green-400/20 pointer-events-none" />}
            <Matchstick 
                active={segments[idx]} 
                isGhost 
                vertical={!config.horizontal}
                onClick={() => onSegmentClick(idx)} 
                className={highlightedSegment === idx ? "ring-2 ring-yellow-400 ring-offset-2 ring-offset-gray-800 rounded-full" : ""}
            />
        </div>
      ))}
    </div>
  );
};
