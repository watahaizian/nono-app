import { UserButton, useClerk, useUser } from "@clerk/clerk-react";
import type React from "react";
import { version } from "../../package.json";
import type { TitleScreenProps } from "../lib/interface";

const TitleScreen: React.FC<TitleScreenProps> = ({ onStart, onEdit }) => {
  const { isSignedIn } = useUser();
  const { openSignIn } = useClerk();

  const handleEditClick = () => {
    if (isSignedIn) {
      onEdit();
    } else {
      openSignIn();
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center h-screen bg-gradient-to-r from-blue-500 to-purple-600">
      <div className="absolute top-4 right-4">
        <UserButton />
      </div>

      <h1 className="text-5xl font-bold mb-6 text-white">nono</h1>
      <button
        type="button"
        className="bg-white text-blue-500 font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-gray-200 transition duration-300"
        onClick={onStart}
      >
        スタート
      </button>

      <button
        type="button"
        className="bg-white text-blue-500 font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-gray-200 transition duration-300 mt-4"
        onClick={handleEditClick}
      >
        作成
      </button>

      <div className="absolute left-2 bottom-2 text-sm text-white opacity-75">
        Version {version}
      </div>
    </div>
  );
};

export default TitleScreen;
