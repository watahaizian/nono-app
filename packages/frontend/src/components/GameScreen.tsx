import { RxCross2, RxPencil1 } from "react-icons/rx";
import { useGameLogic } from "../hooks/useGameLogic";
import type { GameScreenProps } from "../lib/interface";

const GameScreen: React.FC<GameScreenProps> = ({
  puzzleId,
  puzzleSize,
  onBack,
}) => {
  const {
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
  } = useGameLogic(String(puzzleId), puzzleSize);

  if (!hints) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 overflow-auto">
      {error && <div className="text-red-500">{error}</div>}
      <h2 className="text-3xl font-bold mb-4">
        ゲームが始まりました！ パズルID: {puzzleId}, サイズ: {puzzleSize}
      </h2>
      <div className="text-xl mb-4">残機: {life}</div>

      {/* Main puzzle area using CSS Grid */}
      {playState === "playing" && (
        <>
          <div
            className="grid border border-gray-400"
            style={{
              gridTemplateColumns: `repeat(${maxRowHints}, ${cellSize}px) repeat(${puzzleSize}, ${cellSize}px)`,
              gridTemplateRows: `repeat(${maxColHints}, ${cellSize}px) repeat(${puzzleSize}, ${cellSize}px)`,
            }}
          >
            {/* Top-left empty corner (filler for hints) */}
            <div
              className="bg-gray-200"
              style={{
                gridColumn: `span ${maxRowHints}`,
                gridRow: `span ${maxColHints}`,
              }}
            ></div>

            {/* Column Hints (top) */}
            <div
              className="grid"
              style={{
                gridColumn: `span ${puzzleSize}`,
                gridRow: `span ${maxColHints}`,
                gridTemplateColumns: `repeat(${puzzleSize}, ${cellSize}px)`,
                gridTemplateRows: `repeat(${maxColHints}, ${cellSize}px)`,
              }}
            >
              {hints.colHints.map((colHint, colIndex) => (
                <div
                  key={`column-hint-${puzzleId}-${colIndex}-${colHint.join(
                    "-",
                  )}`}
                  className="flex flex-col items-center justify-end"
                  style={{
                    gridColumn: colIndex + 1,
                    gridRow: `span ${maxColHints}`,
                  }}
                >
                  {Array.from({ length: maxColHints - colHint.length }).map(
                    (_, i) => (
                      <div
                        key={`col-hint-filler-${colIndex}-${i}`}
                        style={{ height: `${cellSize}px` }}
                      ></div>
                    ),
                  )}
                  {colHint.map((hint, hintIndex) => (
                    <div
                      key={`col-hint-${puzzleId}-${colIndex}-${hintIndex}-${hint}`}
                      className="text-sm flex items-center justify-center"
                      style={{
                        width: `${cellSize}px`,
                        height: `${cellSize}px`,
                      }}
                    >
                      {hint || ""}
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Row Hints (left) */}
            <div
              className="grid"
              style={{
                gridColumn: `span ${maxRowHints}`,
                gridRow: `span ${puzzleSize}`,
                gridTemplateColumns: `repeat(${maxRowHints}, ${cellSize}px)`,
                gridTemplateRows: `repeat(${puzzleSize}, ${cellSize}px)`,
              }}
            >
              {hints.rowHints.map((rowHint, rowIndex) => (
                <div
                  key={`row-hint-${puzzleId}-${rowIndex}-${rowHint.join("-")}`}
                  className="flex justify-end items-center"
                  style={{
                    gridRow: rowIndex + 1,
                    gridColumn: `span ${maxRowHints}`,
                  }}
                >
                  {Array.from({ length: maxRowHints - rowHint.length }).map(
                    (_, i) => (
                      <div
                        key={`row-hint-filler-${rowIndex}-${i}`}
                        style={{ width: `${cellSize}px` }}
                      ></div>
                    ),
                  )}
                  {rowHint.map((hint, hintIndex) => (
                    <div
                      key={`row-hint-${puzzleId}-${rowIndex}-${hintIndex}-${hint}`}
                      className="text-sm flex items-center justify-center"
                      style={{
                        width: `${cellSize}px`,
                        height: `${cellSize}px`,
                      }}
                    >
                      {hint || ""}
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Puzzle Grid */}
            <div
              className="grid"
              style={{
                gridColumn: `span ${puzzleSize}`,
                gridRow: `span ${puzzleSize}`,
                gridTemplateColumns: `repeat(${puzzleSize}, ${cellSize}px)`,
                gridTemplateRows: `repeat(${puzzleSize}, ${cellSize}px)`,
              }}
            >
              {Array.from({ length: puzzleSize }).map((_, rowIndex) =>
                Array.from({ length: puzzleSize }).map((__, colIndex) => (
                  <button
                    type="button"
                    key={`cell-${puzzleId}-${rowIndex}-${colIndex}-${currentCell[rowIndex][colIndex]}`}
                    className="flex items-center justify-center cursor-pointer border border-gray-300 p-0"
                    style={{
                      backgroundColor:
                        currentCell[rowIndex][colIndex] === null
                          ? "white"
                          : currentCell[rowIndex][colIndex],
                      width: `${cellSize}px`,
                      height: `${cellSize}px`,
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
                    onClick={() => cellLeftClick(rowIndex, colIndex)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
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
                    tabIndex={0}
                    aria-label={`cell ${rowIndex + 1}, ${colIndex + 1}`}
                  >
                    {currentCell[rowIndex][colIndex] === "wrong" ? "x" : ""}
                  </button>
                )),
              )}
            </div>
          </div>

          {/* ... existing buttons and messages ... */}
          <div className="flex space-x-4 mt-4">
            <button
              type="button"
              className={`flex items-center justify-center bg-white text-black font-semibold w-12 h-12 rounded-lg shadow-lg transition duration-300 ${playType === "paint"
                  ? "border-4 border-blue-500"
                  : "border border-gray-300"
                }`}
              onClick={() => setPlayType("paint")}
            >
              <RxPencil1 />
            </button>
            <button
              type="button"
              className={`flex items-center justify-center bg-white text-black font-semibold w-12 h-12 rounded-lg shadow-lg transition duration-300 ${playType === "erase"
                  ? "border-4 border-blue-500"
                  : "border border-gray-300"
                }`}
              onClick={() => setPlayType("erase")}
            >
              <RxCross2 />
            </button>
          </div>
        </>
      )}

      {playState === "correct" && (
        <div className="text-2xl mt-4 text-green-500">ゲームクリア！</div>
      )}
      {playState === "gameover" && (
        <div className="text-2xl mt-4 text-red-500">ゲームオーバー！</div>
      )}
      <button
        type="button"
        className="bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-blue-700 transition duration-300 mt-4"
        onClick={resetGame}
      >
        ゲームリセット
      </button>
      <button
        type="button"
        onClick={onBack}
        className="absolute bottom-4 left-4 px-3 py-1 border border-gray-300 rounded-md bg-gray-200 hover:bg-gray-300"
      >
        戻る
      </button>
    </div>
  );
};

export default GameScreen;
