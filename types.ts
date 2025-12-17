export type SegmentId = string;

export enum CharType {
  DIGIT = 'DIGIT',
  OPERATOR = 'OPERATOR',
}

export interface EquationChar {
  id: string;
  type: CharType;
  value: string; // The char '9', '+', etc.
  segments: boolean[]; // Array of segment states
}

export interface PuzzleState {
  equation: EquationChar[];
  targetSolution?: string; // Optional known solution
}

export interface Move {
  fromCharIndex: number;
  fromSegmentIndex: number;
  toCharIndex: number;
  toSegmentIndex: number;
}
