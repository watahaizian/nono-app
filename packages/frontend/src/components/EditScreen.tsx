import { useEditLogic } from "../hooks/useEditLogic";
import type { EditScreenProps, puzzleSizes } from "../lib/interface";

const buttonClass =
  "bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-blue-600 transition duration-300 disabled:opacity-50";

const EditScreen = ({ onBack }: EditScreenProps) => {
  const sizes = [5, 10, 15, 20, 25];
  const {
    puzzleSize,
    paintColor,
    currentCell,
    title,
    isLoading,
    isMouseDown,
    selectPuzzleSize,
    setPaintColor,
    cellLeftClick,
    resetAllCells,
    createPuzzleHandler,
    setTitle,
    setIsMouseDown,
  } = useEditLogic(onBack);

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
                backgroundColor: cell || "#FFFFFF",
                width: "100%",
                height: "100%",
                borderTop:
                  rowIndex === 0
                    ? "1px solid gray"
                    : rowIndex % 5 === 0
                      ? "1px solid gray"
                      : "none",
                borderLeft:
                  colIndex === 0
                    ? "1px solid gray"
                    : colIndex % 5 === 0
                      ? "1px solid gray"
                      : "none",
                borderRight:
                  (colIndex + 1) % 5 === 0
                    ? "1px solid gray"
                    : "1px solid gray",
                borderBottom:
                  (rowIndex + 1) % 5 === 0
                    ? "1px solid gray"
                    : "1px solid gray",
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
