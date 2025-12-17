import React, { useState, useEffect } from 'react';
import { EquationChar, CharType } from './types';
import { parseEquationString, checkEquation, countSticks } from './utils/matchstickLogic';
import { INITIAL_PUZZLE_STRING } from './constants';
import { CharBlock } from './components/CharBlock';
import { getHint, generatePuzzle } from './services/geminiService';
import { Sparkles, Lightbulb, RotateCcw, ArrowRight, Wand2, Eye } from 'lucide-react';
import clsx from 'clsx';

function App() {
  const [equation, setEquation] = useState<EquationChar[]>([]);
  const [selectedStick, setSelectedStick] = useState<{ charIdx: number; segIdx: number } | null>(null);
  const [message, setMessage] = useState<string>("Move exactly one matchstick to fix the equation.");
  const [messageType, setMessageType] = useState<'neutral' | 'success' | 'error'>('neutral');
  const [isWon, setIsWon] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const [debugMode, setDebugMode] = useState(false);

  // Initialize
  useEffect(() => {
    loadPuzzle(INITIAL_PUZZLE_STRING);
  }, []);

  const loadPuzzle = (eqString: string) => {
    const parsed = parseEquationString(eqString);
    setEquation(parsed);
    setIsWon(false);
    setMessage("Move exactly one matchstick to fix the equation.");
    setMessageType('neutral');
    setSelectedStick(null);
    setHint(null);
  };

  const handleGeneratePuzzle = async () => {
    setLoading(true);
    setMessage("Conjuring a new challenge...");
    setMessageType('neutral');
    try {
        const puzzle = await generatePuzzle();
        loadPuzzle(puzzle.start);
    } catch (e) {
        setMessage("Failed to generate. Please try again.");
        setMessageType('error');
    } finally {
        setLoading(false);
    }
  };

  const handleGetHint = async () => {
    if (isWon) return;
    setLoading(true);
    const eqStr = equation.map(c => c.value).join("");
    
    try {
      const hintText = await getHint(eqStr);
      setHint(hintText);
    } catch (e) {
      setHint("Try focusing on the operators.");
    }
    setLoading(false);
  };

  const handleSegmentClick = (charIdx: number, segIdx: number) => {
    if (isWon || loading) return;

    const targetChar = equation[charIdx];
    const isSegmentActive = targetChar.segments[segIdx];

    // Case 1: Picking up a stick
    if (selectedStick === null) {
      if (isSegmentActive) {
        const newEq = JSON.parse(JSON.stringify(equation));
        newEq[charIdx].segments[segIdx] = false;
        
        setEquation(newEq);
        setSelectedStick({ charIdx, segIdx });
        setMessage("Now place it in a new position.");
        setMessageType('neutral');
      }
      return;
    }

    // Case 2: Placing the stick
    if (selectedStick !== null) {
      // Cancel move (put back)
      if (selectedStick.charIdx === charIdx && selectedStick.segIdx === segIdx) {
        const newEq = JSON.parse(JSON.stringify(equation));
        newEq[charIdx].segments[segIdx] = true;
        setEquation(newEq);
        setSelectedStick(null);
        setMessage("Move cancelled.");
        setMessageType('neutral');
        return;
      }

      // Place in empty spot
      if (!isSegmentActive) {
        const newEq = JSON.parse(JSON.stringify(equation));
        newEq[charIdx].segments[segIdx] = true;
        
        setEquation(newEq);
        setSelectedStick(null);
        
        if (checkEquation(newEq)) {
          setIsWon(true);
          setMessage("Brilliant! The equation is correct.");
          setMessageType('success');
        } else {
          setMessage("That doesn't seem right. Try again.");
          setMessageType('error');
        }
      }
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center py-8 px-4 relative overflow-hidden">
      
      {/* Floating Hand Overlay (Visual feedback) */}
      {selectedStick && (
        <div className="fixed z-50 pointer-events-none left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="bg-amber-100/10 backdrop-blur-md p-6 rounded-full border border-amber-500/30 animate-pulse shadow-[0_0_30px_rgba(251,191,36,0.2)]">
                <div className="w-16 h-2 bg-gradient-to-r from-amber-300 to-amber-500 shadow-lg rounded relative -rotate-45">
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-3 bg-red-600 rounded-full" />
                </div>
            </div>
            <p className="mt-8 text-amber-300 font-bold text-center text-sm tracking-widest uppercase text-shadow-sm">Placing Matchstick</p>
        </div>
      )}

      {/* Header Bar */}
      <header className="w-full max-w-5xl flex flex-col md:flex-row justify-between items-center mb-10 gap-4 md:gap-0">
        <div className="flex items-center gap-3">
           <div className="bg-gradient-to-br from-amber-400 to-orange-600 p-2.5 rounded-lg shadow-lg shadow-orange-900/50">
             <Sparkles className="text-white w-6 h-6" />
           </div>
           <div>
             <h1 className="text-2xl md:text-3xl font-bold text-gray-100 tracking-tight">Matchstick Master</h1>
             <p className="text-gray-400 text-xs md:text-sm font-medium tracking-wide">LOGIC & MATH PUZZLES</p>
           </div>
        </div>
        
        <div className="flex items-center gap-3">
           <button 
             onClick={() => loadPuzzle(INITIAL_PUZZLE_STRING)}
             className="flex items-center gap-2 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-all border border-gray-700 hover:border-gray-600 text-sm font-medium"
           >
             <RotateCcw size={16} />
             Reset
           </button>
           <button 
             onClick={handleGetHint} 
             disabled={loading || isWon}
             className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 rounded-lg transition-all text-sm font-medium disabled:opacity-50"
           >
             <Lightbulb size={16} />
             Hint
           </button>
           <button 
             onClick={handleGeneratePuzzle} 
             disabled={loading}
             className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white shadow-lg shadow-orange-900/40 rounded-lg transition-all transform hover:-translate-y-0.5 text-sm font-bold disabled:opacity-50 disabled:transform-none"
           >
             <Wand2 size={16} />
             New Puzzle
           </button>
        </div>
      </header>

      {/* Main Game Area */}
      <main className="w-full max-w-6xl flex flex-col items-center gap-8">
        
        {/* Puzzle Board */}
        <div className="relative w-full overflow-x-auto pb-4 md:pb-0 flex justify-center">
            <div className={clsx(
                "game-board rounded-2xl p-8 md:p-16 min-w-max flex items-center justify-center gap-2 md:gap-4 transition-all duration-700",
                isWon && "ring-2 ring-green-500/50 shadow-[0_0_50px_rgba(34,197,94,0.1)]"
            )}>
              {equation.map((char, idx) => (
                  <CharBlock
                      key={char.id}
                      charIndex={idx}
                      type={char.type}
                      value={char.value}
                      segments={char.segments}
                      onSegmentClick={(segIdx) => handleSegmentClick(idx, segIdx)}
                      highlightedSegment={selectedStick?.charIdx === idx ? selectedStick.segIdx : null}
                      debug={debugMode}
                  />
              ))}
            </div>
        </div>

        {/* Status / Hint Area */}
        <div className="w-full max-w-2xl flex flex-col items-center gap-4 min-h-[100px]">
           <div className={clsx(
               "px-6 py-3 rounded-full flex items-center gap-3 shadow-xl backdrop-blur-sm border transition-all duration-300",
               messageType === 'neutral' && "bg-gray-800/80 border-gray-700 text-gray-200",
               messageType === 'success' && "bg-green-900/80 border-green-700/50 text-green-200",
               messageType === 'error' && "bg-red-900/80 border-red-700/50 text-red-200"
           )}>
               {loading && <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" />}
               <span className="font-medium">{message}</span>
               {isWon && <div className="w-2 h-2 bg-green-400 rounded-full" />}
           </div>

           {hint && (
             <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 max-w-lg text-center">
               <p className="text-indigo-300 italic text-lg leading-relaxed bg-indigo-900/20 px-6 py-3 rounded-xl border border-indigo-500/20">
                 "{hint}"
               </p>
             </div>
           )}
        </div>

      </main>

      <footer className="mt-auto pt-12 pb-4 w-full flex flex-col items-center text-gray-600 text-xs font-medium uppercase tracking-widest opacity-60">
         <p>Powered by Gemini 2.5</p>
         <button 
            onClick={() => setDebugMode(!debugMode)}
            className="mt-4 flex items-center gap-1 px-2 py-1 rounded bg-gray-900/50 hover:bg-gray-800 transition-colors text-[10px]"
         >
            <Eye size={10} />
            Debug Alignments
         </button>
      </footer>

    </div>
  );
}

export default App;
