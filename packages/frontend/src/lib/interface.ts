export interface cellData {
  cell_id: number;
  puzzle_id: number;
  row_index: number;
  col_index: number;
  cell_value: number;
  color: string;
}

export interface GameScreenProps {
  puzzleId: number;
  puzzleSize: number;
  onBack: () => void;
}

export interface TitleScreenProps {
  onStart: () => void;
  onEdit: () => void;
}

export interface hintss {
  rowHints: number[][];
  colHints: number[][];
}

export type puzzleSizes = 5 | 10 | 15 | 20 | 25;

export interface createCellData {
  row_index: number;
  col_index: number;
  cell_value: number;
  color: string;
}

export interface createPuzzle {
  name: string;
  size: puzzleSizes;
  cells: createCellData[];
}

export interface EditScreenProps {
  onBack: () => void;
}
