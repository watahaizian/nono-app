import { useEffect } from "react";
import LoadingSpinner from "./LoadingSpinner";

const AuthCallback = () => {
	useEffect(() => {
		fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/user`, {
			credentials: "include",
			headers: { "Content-Type": "application/json" },
		})
			.then((res) => res.json())
			.then((data) => {
				if (data) {
					if (window.opener) {
						window.opener.postMessage(
							"auth-success",
							import.meta.env.VITE_FRONTEND_URL || window.location.origin,
						);
						window.close();
					}
				} else {
					console.error("Failed to get user info");
				}
			})
			.catch((error) => {
				console.error("Failed to get user info:", error);
			});
	}, []);

	return <LoadingSpinner />;
};

export default AuthCallback;
