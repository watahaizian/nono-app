import { useEffect, useState } from "react";
import { RxCross2, RxPencil1 } from "react-icons/rx";
import { fetchCells } from "../lib/api";
import type { cellData, GameScreenProps, hintss } from "../lib/interface";
import { calculateHints, getCellStyle } from "../lib/utils";

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

	// ヒントの最大数を取得
	const maxRowHints = Math.max(...hints.rowHints.map((h) => h.length));
	const maxColHints = Math.max(...hints.colHints.map((h) => h.length));

	return (
		<div className="flex flex-col items-center justify-center h-screen bg-gray-100 overflow-auto">
			{error && <div className="text-red-500">{error}</div>}
			<h2 className="text-3xl font-bold mb-4">
				ゲームが始まりました！ パズルID: {puzzleId}, サイズ: {puzzleSize}
			</h2>
			<div className="text-xl mb-4">残機: {life}</div>

			{/* パズルエリア全体 */}
			<div
				className="relative"
				style={{
					width: `${(maxRowHints + puzzleSize) * 24}px`,
					height: `${(maxColHints + puzzleSize) * 24}px`,
					margin: "0 auto",
					transform: `translateX(-${maxRowHints * 12}px)`,
				}}
			>
				{/* 列ヒント（上部） */}
				<div
					className="absolute"
					style={{
						top: 0,
						left: `${maxRowHints * 24}px`,
						width: `${puzzleSize * 24}px`,
						height: `${maxColHints * 24}px`,
					}}
				>
					{hints.colHints.map((colHint, colIndex) => (
						<div
							key={`column-hint-${puzzleId}-${colIndex}-${colHint.join("-")}`}
							className="absolute flex flex-col items-center justify-end"
							style={{
								width: "24px",
								height: "100%",
								left: `${colIndex * 24}px`,
							}}
						>
							{colHint.map((hint, hintIndex) => (
								<div
									key={`col-hint-${puzzleId}-${colIndex}-${hintIndex}-${hint}`}
									className="text-sm h-6 flex items-center"
								>
									{hint || ""}
								</div>
							))}
						</div>
					))}
				</div>

				{/* 行ヒント（左側）とパズルグリッド */}
				<div
					className="absolute"
					style={{
						top: `${maxColHints * 24}px`,
						left: 0,
						display: "flex",
					}}
				>
					{/* 行ヒント */}
					<div style={{ width: `${maxRowHints * 24}px` }}>
						{hints.rowHints.map((rowHint, rowIndex) => (
							<div
								key={`row-hint-${puzzleId}-${rowIndex}-${rowHint.join("-")}`}
								className="flex justify-end items-center h-6"
							>
								{rowHint.map((hint, hintIndex) => (
									<div
										key={`row-hint-${puzzleId}-${rowIndex}-${hintIndex}-${hint}`}
										className="text-sm w-6 text-center"
									>
										{hint || ""}
									</div>
								))}
							</div>
						))}
					</div>

					{/* パズルグリッド */}
					<div className="flex flex-col">
						{Array.from({ length: puzzleSize }).map((_, rowIndex) => (
							<div
								key={`row-${puzzleId}-${rowIndex}-${currentCell[rowIndex].join("-")}`}
								className="flex"
							>
								{Array.from({ length: puzzleSize }).map((_, colIndex) => (
									<button
										type="button"
										key={`cell-${puzzleId}-${rowIndex}-${colIndex}-${currentCell[rowIndex][colIndex]}`}
										className="flex items-center justify-center cursor-pointer border border-gray-300 p-0"
										style={{
											...getCellStyle(rowIndex, colIndex),
											backgroundColor:
												currentCell[rowIndex][colIndex] === null
													? "white"
													: currentCell[rowIndex][colIndex],
											width: "24px",
											height: "24px",
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
								))}
							</div>
						))}
					</div>
				</div>
			</div>

			{/* ボタンの配置 */}
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
