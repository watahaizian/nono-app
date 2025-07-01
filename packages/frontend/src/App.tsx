import type React from "react";
import { useState } from "react";
import EditScreen from "./components/EditScreen";
import GameScreen from "./components/GameScreen";
import TitleScreen from "./components/TitleScreen";
import { fetchPuzzles } from "./lib/api";

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState("title");
  const [puzzleId, setPuzzleId] = useState(0);
  const [puzzleSize, setPuzzleSize] = useState(0);

  const startGame = async () => {
    try {
      const puzzles = await fetchPuzzles();
      console.log(puzzles);
      const randomPuzzle = puzzles[Math.floor(Math.random() * puzzles.length)];
      setPuzzleId(randomPuzzle.puzzle_id);
      setPuzzleSize(randomPuzzle.puzzle_size);
      setCurrentScreen("game");
    } catch (error) {
      console.error(error);
      alert("Failed to start the game");
    }
  };

  const startEdit = () => {
    setCurrentScreen("edit");
  };

  // タイトルに戻る
  const backToTitle = () => {
    setCurrentScreen("title");
  };

  return (
    <>
      {currentScreen === "title" && (
        <TitleScreen onStart={startGame} onEdit={startEdit} />
      )}
      {currentScreen === "game" && (
        <GameScreen
          puzzleId={puzzleId}
          puzzleSize={puzzleSize}
          onBack={backToTitle}
        />
      )}
      {currentScreen === "edit" && <EditScreen onBack={backToTitle} />}
    </>
  );
};

export default App;
