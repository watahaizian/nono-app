import type { cellData, createPuzzle } from "./interface";

export const fetchPuzzles = async () => {
	const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/puzzles`);
	if (!response.ok) {
		throw new Error("Failed to fetch puzzles");
	}
	const data = await response.json();
	return data;
};

export const postPuzzle = async (puzzle: createPuzzle, token?: string) => {
	const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/puzzles`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			...(token ? { Authorization: `Bearer ${token}` } : {}),
		},
		body: JSON.stringify(puzzle),
	});
	if (!response.ok) {
		throw new Error("Failed to post puzzle");
	}
	const data = await response.json();
	return data;
};

export const fetchCells = async (puzzleId: number): Promise<cellData[]> => {
	const response = await fetch(
		`${import.meta.env.VITE_BACKEND_URL}/puzzles/${puzzleId}/cells`,
	);
	if (!response.ok) {
		throw new Error("Failed to fetch cells");
	}
	const data: cellData[] = await response.json();
	// console.log(data);
	return data;
};

export const startNewGame = async () => {
	const response = await fetch(
		`${import.meta.env.VITE_BACKEND_URL}/puzzles/new-game`,
		{
			method: "POST",
		},
	);
	if (!response.ok) {
		throw new Error("Failed to start a new game");
	}
	const data = await response.json();
	return data;
};