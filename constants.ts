// 7-segment display mapping
//   A(0)
// F(5)  B(1)
//   G(6)
// E(4)  C(2)
//   D(3)

export const DIGIT_SEGMENTS: Record<string, boolean[]> = {
  '0': [true, true, true, true, true, true, false],
  '1': [false, true, true, false, false, false, false],
  '2': [true, true, false, true, true, false, true],
  '3': [true, true, true, true, false, false, true],
  '4': [false, true, true, false, false, true, true],
  '5': [true, false, true, true, false, true, true],
  '6': [true, false, true, true, true, true, true],
  '7': [true, true, true, false, false, false, false],
  '8': [true, true, true, true, true, true, true],
  '9': [true, true, true, true, false, true, true],
};

// Operators
// Plus: Vert(0), Horiz(1) - Centered at 50,50
// Minus: Horiz(0) - Centered at 50,50
// Equals: Top(0), Bot(1) - Centered around 50

export const OPERATOR_LAYOUTS: Record<string, { x: number, y: number, vertical: boolean }[]> = {
  '+': [
    { x: 50, y: 50, vertical: true }, // Vertical stick (Index 0)
    { x: 50, y: 50, vertical: false }, // Horizontal stick (Index 1)
  ],
  '-': [
    { x: 50, y: 50, vertical: false },
  ],
  '=': [
    { x: 50, y: 42, vertical: false },
    { x: 50, y: 58, vertical: false },
  ]
};

// Initial standard puzzle: 9 + 9 = 15
export const INITIAL_PUZZLE_STRING = "9+9=15";
