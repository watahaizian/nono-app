import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import type React from "react";
import { useEffect, useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { version } from "../../package.json";
import type { TitleScreenProps } from "../lib/interface";
import LoadingSpinner from "./LoadingSpinner";

interface UserInfo {
	user_name: string;
}

const TitleScreen: React.FC<TitleScreenProps> = ({ onStart, onEdit }) => {
	const authUrl = `${import.meta.env.VITE_BACKEND_URL}/auth/google`;
	const [userInfo, setUserInfo] = useState<UserInfo | "login" | null>(null);

	useEffect(() => {
		const fetchUserInfo = async () => {
			const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/user`, {
				credentials: "include",
			});
			const data = await res.json();
			if (data.message === "no session_id" || data.message === "no user") {
				setUserInfo("login");
			} else {
				setUserInfo(data);
			}
		};
		fetchUserInfo();
	}, []);

	useEffect(() => {
		const handleMessage = (event: MessageEvent) => {
			if (event.data === "auth-success") {
				window.location.reload();
			}
		};

		window.addEventListener("message", handleMessage);
		return () => window.removeEventListener("message", handleMessage);
	}, []);

	const handleLogout = async () => {
		const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/logout`, {
			credentials: "include",
		});
		if (res.ok) {
			window.location.reload();
		} else {
			console.error("Failed to logout");
		}
	};

	return (
		<div className="relative flex flex-col items-center justify-center h-screen bg-gradient-to-r from-blue-500 to-purple-600">
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
				onClick={onEdit}
			>
				作成
			</button>
			{userInfo ? (
				userInfo === "login" ? (
					<Button
						variant="outline"
						className="mt-4 text-blue-500 shadow-md"
						onClick={() =>
							window.open(authUrl, "_blank", "width=500,height=600")
						}
					>
						<FcGoogle /> Googleでログイン
					</Button>
				) : (
					<AlertDialog>
						<AlertDialogTrigger asChild>
							<Button
								variant="outline"
								className="mt-4 text-blue-500 shadow-md"
							>
								<FcGoogle /> {userInfo.user_name}としてログイン中
							</Button>
						</AlertDialogTrigger>
						<AlertDialogContent>
							<AlertDialogHeader>
								<AlertDialogTitle>ログアウトしますか？</AlertDialogTitle>
								<AlertDialogDescription />
							</AlertDialogHeader>
							<AlertDialogFooter>
								<AlertDialogCancel>キャンセル</AlertDialogCancel>
								<AlertDialogAction
									className="bg-red-500 text-white"
									onClick={handleLogout}
								>
									ログアウト
								</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>
				)
			) : (
				<LoadingSpinner />
			)}
			{/* バージョン番号を左下に表示 */}
			<div className="absolute left-2 bottom-2 text-sm text-white opacity-75">
				Version {version}
			</div>
		</div>
	);
};

export default TitleScreen;
