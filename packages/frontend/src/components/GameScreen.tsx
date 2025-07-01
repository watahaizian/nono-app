import { useEffect, useState } from "react";
import { RxCross2, RxPencil1 } from "react-icons/rx";
import { fetchCells } from "../lib/api";
import type { cellData, GameScreenProps, hintss } from "../lib/interface";
import { calculateHints } from "../lib/utils";

const GameScreen: React.FC<GameScreenProps> = ({
  puzzleId,
  puzzleSize,
  onBack,
}) => {
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

  // Calculate max hints and cell size after hints are loaded
  const maxRowHints = hints
    ? Math.max(...hints.rowHints.map((h) => h.length))
    : 0;
  const maxColHints = hints
    ? Math.max(...hints.colHints.map((h) => h.length))
    : 0;

  useEffect(() => {
    if (!hints) return; // Wait for hints to be calculated

    const calculateAndSetCellSize = () => {
      // Available space for the entire grid (including hints)
      // Consider header/footer height, so use a percentage of viewport height
      const availableWidth = window.innerWidth * 0.9; // 90% of viewport width
      const availableHeight = window.innerHeight * 0.7; // 70% of viewport height

      const totalGridCols = puzzleSize + maxRowHints;
      const totalGridRows = puzzleSize + maxColHints;

      const cellSizeFromWidth = availableWidth / totalGridCols;
      const cellSizeFromHeight = availableHeight / totalGridRows;

      // Choose the smaller dimension to ensure the entire grid fits
      // Set a reasonable min/max for cell size for usability
      const newSize = Math.max(
        10,
        Math.min(30, Math.min(cellSizeFromWidth, cellSizeFromHeight)),
      );
      setCellSize(newSize);
    };

    calculateAndSetCellSize(); // Initial calculation
    window.addEventListener("resize", calculateAndSetCellSize); // Recalculate on resize

    return () => {
      window.removeEventListener("resize", calculateAndSetCellSize); // Cleanup
    };
  }, [hints, puzzleSize, maxRowHints, maxColHints]); // Dependencies for recalculation

  if (!hints) {
    return <div>Loading...</div>;
  }

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
          const newCell = prev.map((rowArr) => [...rowArr]); // 深いコピー
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
          const newCell = prev.map((rowArr) => [...rowArr]); // 深いコピー
          newCell[row][col] = "wrong";
          return newCell;
        });
        setLife((prev) => prev - 1);
      }
    } else if (playType === "erase") {
      if (cell.cell_value === 0) {
        setCurrentCell((prev) => {
          const newCell = prev.map((rowArr) => [...rowArr]); // 深いコピー
          newCell[row][col] = "wrong";
          return newCell;
        });
      } else {
        setCurrentCell((prev) => {
          const newCell = prev.map((rowArr) => [...rowArr]); // 深いコピー
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
