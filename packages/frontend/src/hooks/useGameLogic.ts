import { useEffect, useState } from "react";
import { fetchCells } from "../lib/api";
import type { cellData, hintss } from "../lib/interface";
import { calculateHints } from "../lib/utils";

export const useGameLogic = (puzzleId: string, puzzleSize: number) => {
  const [cells, setCells] = useState<cellData[]>([]);
  const [hints, setHints] = useState<hintss | null>(null);
  const [currentCell, setCurrentCell] = useState<(string | null)[][]>(
    Array.from({ length: puzzleSize }, () =>
      Array<string | null>(puzzleSize).fill(null),
    ),
  );
  const [playState, setPlayState] = useState<
    "playing" | "correct" | "gameover"
  >("playing");
  const [life, setLife] = useState<number>(3);
  const [playType, setPlayType] = useState<"paint" | "erase">("paint");
  const [error, setError] = useState<string | null>(null);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [cellSize, setCellSize] = useState(24); // Initial default cell size

  useEffect(() => {
    const fetchCellsData = async () => {
      try {
        const data: cellData[] = await fetchCells(puzzleId);
        setCells(data);
        setHints(calculateHints(data, puzzleSize));
      } catch (error) {
        console.error(error);
        setError("セルの取得に失敗しました");
      }
    };
    fetchCellsData();
  }, [puzzleId, puzzleSize]);

  useEffect(() => {
    if (cells.length === 0) return;
    const answer = cells.every((cell) => {
      const row = cell.row_index;
      const col = cell.col_index;
      if (cell.cell_value === 1) {
        return currentCell[row][col] === cell.color;
      }
      return (
        currentCell[row][col] === null || currentCell[row][col] === "wrong"
      );
    });
    setPlayState(answer ? "correct" : "playing");
  }, [currentCell, cells]);

  useEffect(() => {
    if (life === 0) {
      setPlayState("gameover");
    }
  }, [life]);

  useEffect(() => {
    const handleMouseUp = () => {
      setIsMouseDown(false);
    };

    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  const maxRowHints = hints
    ? Math.max(...hints.rowHints.map((h) => h.length))
    : 0;
  const maxColHints = hints
    ? Math.max(...hints.colHints.map((h) => h.length))
    : 0;

  useEffect(() => {
    if (!hints) return; // Wait for hints to be calculated

    const calculateAndSetCellSize = () => {
      const availableWidth = window.innerWidth * 0.9;
      const availableHeight = window.innerHeight * 0.7;

      const totalGridCols = puzzleSize + maxRowHints;
      const totalGridRows = puzzleSize + maxColHints;

      const cellSizeFromWidth = availableWidth / totalGridCols;
      const cellSizeFromHeight = availableHeight / totalGridRows;

      const newSize = Math.max(
        10,
        Math.min(30, Math.min(cellSizeFromWidth, cellSizeFromHeight)),
      );
      setCellSize(newSize);
    };

    calculateAndSetCellSize();
    window.addEventListener("resize", calculateAndSetCellSize);

    return () => {
      window.removeEventListener("resize", calculateAndSetCellSize);
    };
  }, [hints, puzzleSize, maxRowHints, maxColHints]);

  const cellLeftClick = (row: number, col: number) => {
    if (playState !== "playing") return;
    const cell = cells.find((c) => c.row_index === row && c.col_index === col);
    if (!cell) {
      console.error("Cell not found");
      return;
    }
    if (currentCell[row][col] !== null) return;
    if (playType === "paint") {
      if (cell.cell_value === 1) {
        setCurrentCell((prev) => {
          const newCell = prev.map((rowArr) => [...rowArr]);
          const cellData = cells.find(
            (c) => c.row_index === row && c.col_index === col,
          );
          if (cellData) {
            newCell[row][col] = cellData.color;
          }
          return newCell;
        });
      } else {
        setCurrentCell((prev) => {
          const newCell = prev.map((rowArr) => [...rowArr]);
          newCell[row][col] = "wrong";
          return newCell;
        });
        setLife((prev) => prev - 1);
      }
    } else if (playType === "erase") {
      if (cell.cell_value === 0) {
        setCurrentCell((prev) => {
          const newCell = prev.map((rowArr) => [...rowArr]);
          newCell[row][col] = "wrong";
          return newCell;
        });
      } else {
        setCurrentCell((prev) => {
          const newCell = prev.map((rowArr) => [...rowArr]);
          const cellData = cells.find(
            (c) => c.row_index === row && c.col_index === col,
          );
          if (cellData) {
            newCell[row][col] = cellData.color;
          }
          return newCell;
        });
        setLife((prev) => prev - 1);
      }
    }
  };

  const resetGame = () => {
    setCurrentCell(
      Array.from({ length: puzzleSize }, () => Array(puzzleSize).fill(null)),
    );
    setLife(3);
    setPlayState("playing");
  };

  return {
    hints,
    currentCell,
    playState,
    life,
    playType,
    error,
    isMouseDown,
    cellSize,
    maxRowHints,
    maxColHints,
    cellLeftClick,
    setPlayType,
    resetGame,
    setIsMouseDown,
  };
};
