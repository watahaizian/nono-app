import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from "@clerk/clerk-react";
import type React from "react";
import { version } from "../../package.json";
import type { TitleScreenProps } from "../lib/interface";

const TitleScreen: React.FC<TitleScreenProps> = ({ onStart, onEdit }) => {
  return (
    <div className="relative flex flex-col items-center justify-center h-screen bg-gradient-to-r from-blue-500 to-purple-600">
      <h1 className="text-5xl font-bold mb-6 text-white">nono</h1>
      <button type="button" className="bg-white text-blue-500 font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-gray-200 transition duration-300" onClick={onStart}>
        スタート
      </button>

      <SignedIn>
        <button
          type="button"
          className="bg-white text-blue-500 font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-gray-200 transition duration-300 mt-4"
          onClick={onEdit}
        >
          作成
        </button>
        <div className="absolute top-4 right-4">
          <UserButton />
        </div>
      </SignedIn>

      <SignedOut>
        <p className="text-white mt-4">パズルを作成するにはログインしてください</p>
        <div className="mt-2">
          <SignInButton mode="modal">
            <button
              type="button"
              className="bg-white text-blue-500 font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-gray-200 transition duration-300"
            >
              ログイン
            </button>
          </SignInButton>
        </div>
      </SignedOut>

      <div className="absolute left-2 bottom-2 text-sm text-white opacity-75">
        Version {version}
      </div>
    </div>
  );
};

export default TitleScreen;
