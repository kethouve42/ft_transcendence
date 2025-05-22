import {Routes, Route, Link, useLocation, useNavigate} from 'react-router-dom'
import { useEffect, useState } from "react"
import Home from './pages/home'
import Game from './pages/game'
import Error from './pages/error'
import Login from './pages/login'
import Register from './pages/register'
import Dashboard from './pages/dashboard'
import fetchUserId from './auth/authHelpers'
import PublicRoute from './auth/PublicRoute'
import ProtectedRoute from './auth/ProtectedRoute'

type User = {
  id: number;
  login: string;
  email: string;
  alias?: string;
  avatar?: string;
  log_data?: string;
};

export default function Navbar() {
	const location = useLocation()
	const isActive = (path: string) =>
	location.pathname === path
	? 'text-blue-600 font-semibold border-b-2 border-blue-600'
	: 'text-gray-700 hover:text-blue-500'
	let pageClass = ''
	if (location.pathname === '/') pageClass = 'bg-pink-800'
	else if (location.pathname === '/game') pageClass = 'bg-pink-800'
	else if (location.pathname === '/error') pageClass = 'bg-pink-800'
	else if (location.pathname === '/login') pageClass = 'bg-pink-800'

	const [userData, setUserData] = useState<User | null>(null);
	const isLogged = !!localStorage.getItem("token");
	const token = localStorage.getItem("token");
	useEffect(() => {
		const fetchData = async () => {
			if (!token) return;
			const userId = await fetchUserId(token);
			if (!userId) return;
			const res = await fetch(`/api/users/${userId}`);
			const data = await res.json();
			setUserData(data);
		};
		fetchData();
	}, [token]);

	const navigate = useNavigate();

	return (
		<>
		
		<nav className="bg-pink-600 shadow-md p-4">
			<div className="max-w-7xl mx-auto flex justify-between items-center">
				<div className="flex gap-8">
					<Link to="/" className={`${isActive('/')} transition`}>
						Accueil
					</Link>
					<Link to="/game" className={`${isActive('/game')} transition`}>
						Jeu
					</Link>
				</div>
				<div>
					{isLogged ? (
						<>
							<Link to="/dashboard" className={`${isActive('/dashboard')} transition`}>
								{userData?.alias || "Profil"}
							</Link>
							<button
							className="ml-4 bg-red-500 text-white px-2 py-1 rounded"
							onClick={() => {localStorage.removeItem("token"); navigate("/login");}}>
							Déconnexion
							</button>
						</>
					) : (
					<div className="flex gap-8">
						<Link to="/login" className={`${isActive('/login')} transition`}>
							Connexion
						</Link>
						<Link to="/register" className={`${isActive('/register')} transition`}>
							Inscription
						</Link>
					</div>
					)}
				</div>
			</div>
		</nav>
		<div className={pageClass}>
			<Routes>
				<Route path="/" element={<Home />} />
				<Route path="/game" element={<Game />} />
				<Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
				<Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
				<Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
				<Route path="*" element={<Error />} />
			</Routes>
		</div>
	</>
)
}