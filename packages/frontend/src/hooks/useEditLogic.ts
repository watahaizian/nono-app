import { useAuth } from "@clerk/clerk-react";
import { useState } from "react";
import { postPuzzle } from "../lib/api";
import type {
  createCellData,
  createPuzzle,
  puzzleSizes,
} from "../lib/interface";

export const useEditLogic = (onBack: () => void) => {
  const [puzzleSize, setPuzzleSize] = useState<puzzleSizes>(5);
  const [paintColor, setPaintColor] = useState<string>("#000000");
  const [currentCell, setCurrentCell] = useState<(string | null)[][]>(
    Array.from({ length: puzzleSize }, () =>
      Array<string | null>(puzzleSize).fill(null),
    ),
  );
  const [title, setTitle] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const { getToken } = useAuth();

  const selectPuzzleSize = (size: puzzleSizes) => {
    if (currentCell.some((row) => row.some((cell) => cell !== null))) {
      if (
        !window.confirm("変更すると現在の編集内容が消えます。よろしいですか？")
      ) {
        return;
      }
    }
    setPuzzleSize(size);
    setCurrentCell(
      Array.from({ length: size }, () => Array<string | null>(size).fill(null)),
    );
  };

  const cellLeftClick = (rowIndex: number, colIndex: number) => {
    const newCell = [...currentCell];
    newCell[rowIndex][colIndex] = paintColor === "#ffffff" ? null : paintColor;
    setCurrentCell(newCell);
  };

  const resetAllCells = () => {
    if (
      currentCell.some((row) => row.some((cell) => cell !== null)) &&
      !window.confirm("全てがリセットされます。よろしいですか？")
    ) {
      return;
    }
    setCurrentCell(
      Array.from({ length: puzzleSize }, () =>
        Array<string | null>(puzzleSize).fill(null),
      ),
    );
  };

  const createPuzzleHandler = async () => {
    if (!title) {
      alert("タイトルを入力してください");
      return;
    }
    if (currentCell.every((row) => row.every((cell) => cell === null))) {
      alert("何か描いてください");
      return;
    }
    const puzzleData: createCellData[] = [];
    currentCell.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        puzzleData.push({
          row_index: rowIndex,
          col_index: colIndex,
          cell_value: cell ? 1 : 0,
          color: cell || "#FFFFFF",
        });
      });
    });
    const puzzle: createPuzzle = {
      name: title,
      size: puzzleSize,
      cells: puzzleData,
    };

    setIsLoading(true);
    try {
      const token = await getToken();
      await postPuzzle(puzzle, token || undefined);
      alert("パズルを作成しました");
      onBack();
    } catch (_error) {
      console.error("パズル作成エラー:", _error);
      alert("パズルの作成に失敗しました。再度お試しください。");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    puzzleSize,
    paintColor,
    currentCell,
    title,
    isLoading,
    isMouseDown,
    selectPuzzleSize,
    setPaintColor,
    setCurrentCell,
    cellLeftClick,
    resetAllCells,
    createPuzzleHandler,
    setTitle,
    setIsMouseDown,
  };
};
