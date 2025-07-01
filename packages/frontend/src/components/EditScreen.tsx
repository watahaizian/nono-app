import { useState } from "react";
import { postPuzzle } from "../lib/api";
import type {
  createCellData,
  createPuzzle,
  EditScreenProps,
  puzzleSizes,
} from "../lib/interface";
import { getCellStyle } from "../lib/utils";

const buttonClass =
  "bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-blue-600 transition duration-300 disabled:opacity-50";

const EditScreen = ({ onBack }: EditScreenProps) => {
  const sizes = [5, 10, 15, 20, 25];
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

  const selectPuzzleSize = (size: puzzleSizes) => {
    // サイズ選択時にcurrentCellがすべてnullでなければ、確認ダイアログを表示
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
    // currentCellが全てnullでない場合は確認ダイアログを表示
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
    // タイトルが入力されていない場合はアラートを表示
    if (!title) {
      alert("タイトルを入力してください");
      return;
    }
    // currentCellがすべてnullの場合はアラートを表示
    if (currentCell.every((row) => row.every((cell) => cell === null))) {
      alert("何か描いてください");
      return;
    }
    // createCellDataに合わせてパズルデータを作成
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
    // パズルデータをfetchで送信
    const puzzle: createPuzzle = {
      name: title,
      size: puzzleSize,
      cells: puzzleData,
    };

    setIsLoading(true); // ローディング開始
    try {
      await postPuzzle(puzzle);
      alert("パズルを作成しました");
      onBack();
    } catch (error) {
      console.error("パズル作成エラー:", error);
      alert("パズルの作成に失敗しました。再度お試しください。");
    } finally {
      setIsLoading(false); // ローディング終了
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-end space-x-4 mt-6">
        <h2>サイズ選択</h2>
        <select
          value={puzzleSize}
          onChange={(e) =>
            selectPuzzleSize(Number(e.target.value) as puzzleSizes)
          }
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {sizes.map((size) => (
            <option key={size} value={size}>
              {size} x {size}
            </option>
          ))}
        </select>
        <div className="mt-4">
          塗色：
          <input
            type="color"
            value={paintColor}
            onChange={(e) => setPaintColor(e.target.value)}
            className="ml-2 cursor-pointer"
          />
          <button
            type="button"
            className="ml-4 px-3 py-1 border border-gray-300 rounded-md"
            onClick={resetAllCells}
          >
            リセット
          </button>
        </div>
      </div>
      <div
        className="grid gap-0 mt-4"
        style={{
          gridTemplateColumns: `repeat(${puzzleSize}, 1fr)`,
          height: "min(70vh, 100vw)",
          width: "min(70vh, 100vw)",
        }}
      >
        {currentCell.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <button
              type="button"
              key={`cell-${rowIndex}-${colIndex}-${cell ?? "empty"}`}
              className="flex items-center justify-center cursor-pointer border border-gray-300 p-0 m-0"
              style={{
                ...getCellStyle(rowIndex, colIndex),
                backgroundColor: cell || "#FFFFFF",
                width: "100%",
                height: "100%",
              }}
              aria-label={`セル (${rowIndex + 1}, ${colIndex + 1})`}
              tabIndex={0}
              onClick={() => cellLeftClick(rowIndex, colIndex)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  cellLeftClick(rowIndex, colIndex);
                }
              }}
              onMouseDown={(e) => {
                e.preventDefault();
                setIsMouseDown(true);
                cellLeftClick(rowIndex, colIndex);
              }}
              onMouseEnter={() => {
                if (isMouseDown) {
                  cellLeftClick(rowIndex, colIndex);
                }
              }}
              onMouseUp={() => setIsMouseDown(false)}
            />
          )),
        )}
      </div>
      <div>
        <input
          type="text"
          className="mt-4 px-3 py-1 border border-gray-300 rounded-md"
          placeholder="タイトル"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <button
          type="button"
          className={buttonClass}
          onClick={createPuzzleHandler}
          disabled={isLoading}
        >
          {isLoading ? "作成中..." : "作成"}
        </button>
      </div>
      <button
        type="button"
        // EditScreenで使ったスタイルを流用すると統一感が出るわ
        className="bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-gray-400 transition duration-300"
        onClick={onBack}
      >
        タイトルに戻る
      </button>
    </div>
  );
};

export default EditScreen;
