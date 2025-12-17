import { DIGIT_SEGMENTS, OPERATOR_LAYOUTS } from '../constants';
import { EquationChar, CharType } from '../types';

export const parseEquationString = (eq: string): EquationChar[] => {
  const chars: EquationChar[] = [];
  
  // Very basic parser for single digit numbers and operators
  // We assume space separation isn't strictly necessary for single digits, 
  // but let's handle the initial "9+9=15" which has multi-digit "15"
  
  // To keep it simple for the grid system, we treat every character as a block.
  // "15" is two blocks: "1" and "5".
  
  for (let i = 0; i < eq.length; i++) {
    const char = eq[i];
    if (char === ' ') continue;

    if (/[0-9]/.test(char)) {
      chars.push({
        id: `char-${i}`,
        type: CharType.DIGIT,
        value: char,
        segments: [...DIGIT_SEGMENTS[char]],
      });
    } else if (['+', '-', '='].includes(char)) {
      // Initialize operator segments as all true (default view)
      // We map the visual existence to the boolean array length based on layout
      const layoutCount = OPERATOR_LAYOUTS[char]?.length || 0;
      chars.push({
        id: `char-${i}`,
        type: CharType.OPERATOR,
        value: char,
        segments: Array(layoutCount).fill(true),
      });
    }
  }
  return chars;
};

export const isValidDigit = (segments: boolean[]): string | null => {
  for (const [digit, pattern] of Object.entries(DIGIT_SEGMENTS)) {
    if (segments.length === pattern.length && segments.every((v, i) => v === pattern[i])) {
      return digit;
    }
  }
  return null;
};

export const checkEquation = (chars: EquationChar[]): boolean => {
  let equationString = "";
  
  for (const char of chars) {
    if (char.type === CharType.DIGIT) {
      const digit = isValidDigit(char.segments);
      if (digit === null) return false; // Invalid number formation
      equationString += digit;
    } else {
        // For operators, we must ensure they are fully intact.
        // E.g. a Plus sign missing a vertical bar is a Minus sign.
        if (char.value === '+') {
             if (char.segments[0] && char.segments[1]) equationString += '+';
             else if (!char.segments[0] && char.segments[1]) equationString += '-';
             else return false; // Invalid symbol
        } else if (char.value === '=') {
            if (char.segments[0] && char.segments[1]) equationString += '=='; // JS logic
            else if (!char.segments[0] && char.segments[1]) equationString += '-'; // Bottom only? Weird.
            else if (char.segments[0] && !char.segments[1]) equationString += '-'; // Top only
            else return false; 
        } else if (char.value === '-') {
            if (char.segments[0]) equationString += '-';
            else return false;
        }
    }
  }

  try {
    // Safety check: only allow digits and basic operators
    if (!/^[0-9+\-= ]+$/.test(equationString)) return false;
    
    // Replace single = with === for evaluation, but handle existing ==
    const evalString = equationString.replace(/={1,2}/, '===');
    
    // eslint-disable-next-line no-new-func
    return Function(`"use strict"; return (${evalString})`)();
  } catch (e) {
    return false;
  }
};

export const countSticks = (chars: EquationChar[]): number => {
    return chars.reduce((acc, char) => acc + char.segments.filter(Boolean).length, 0);
};
