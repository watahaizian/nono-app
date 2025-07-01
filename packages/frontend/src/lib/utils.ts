import type { cellData } from "./interface";

export const calculateHints = (data: cellData[], puzzleSize: number) => {
  const grid = Array.from({ length: puzzleSize }, () =>
    Array(puzzleSize).fill(0),
  );

  for (const cell of data) {
    const row = cell.row_index;
    const col = cell.col_index;
    grid[row][col] = cell.cell_value;
  }

  const rowHints = grid.map((row) => {
    const hints = [];
    let count = 0;
    for (const cell of row) {
      if (cell === 1) {
        count++;
      } else {
        if (count > 0) {
          hints.push(count);
          count = 0;
        }
      }
    }
    if (count > 0) {
      hints.push(count);
    }
    return hints.length > 0 ? hints : [0];
  });

  const colHints = [];
  for (let col = 0; col < puzzleSize; col++) {
    const hints = [];
    let count = 0;
    for (let row = 0; row < puzzleSize; row++) {
      if (grid[row][col] === 1) {
        count++;
      } else {
        if (count > 0) {
          hints.push(count);
          count = 0;
        }
      }
    }
    if (count > 0) {
      hints.push(count);
    }
    colHints.push(hints.length > 0 ? hints : [0]);
  }
  // console.log(rowHints);
  // console.log(colHints);

  return { rowHints, colHints };
};
