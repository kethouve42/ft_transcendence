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
	if (location.pathname === '/') pageClass = ''
	else if (location.pathname === '/game') pageClass = ''
	else if (location.pathname === '/error') pageClass = ''
	else if (location.pathname === '/login') pageClass = ''

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
	<nav className="bg-gradient-to-r from-[#0f2027] via-[#2c5364] to-[#232526] shadow-xl py-4 px-0 border-b-2 border-cyan-400/40 backdrop-blur-md">
	<div className="w-full flex justify-between items-center">
		<div className="flex gap-10 items-center">
		<Link to="/" className={`text-lg ${isActive('/')} font-extrabold tracking-widest text-cyan-300 hover:text-cyan-400 transition`}>Accueil</Link>
		<Link to="/game" className={`text-lg ${isActive('/game')} font-extrabold tracking-widest text-cyan-300 hover:text-cyan-400 transition`}>Jeu</Link>
		</div>
		<div className="flex gap-8 items-center">
		{isLogged ? (
			<>
			<Link
				to="/dashboard"
				className={`flex items-center gap-2 ${isActive('/dashboard')} font-semibold text-cyan-200 hover:text-cyan-400 transition`}
			>
				<span className="inline-block w-9 h-9 rounded-full bg-cyan-900 border-2 border-cyan-400 shadow-cyan-400/40 shadow-lg overflow-hidden">
				{userData?.avatar
					? <img src={userData.avatar} alt="avatar" className="w-full h-full object-cover" />
					: <span className="flex items-center justify-center h-full text-cyan-300 font-bold text-xl">{userData?.login?.[0]?.toUpperCase() || "?"}</span>
				}
				</span>
				<span className="uppercase tracking-wider">{userData?.alias || userData?.login || "Profil"}</span>
			</Link>
			<button
				className="bg-cyan-700/80 text-white border border-cyan-400 px-5 py-2 rounded-full font-semibold shadow-cyan-400/30 shadow-md hover:bg-cyan-500/80 hover:text-black transition"
				onClick={() => { localStorage.removeItem("token"); navigate("/login"); }}
			>
				Déconnexion
			</button>
			</>
		) : (
			<>
			<Link to="/login" className={`text-lg ${isActive('/login')} font-semibold text-cyan-200 hover:text-cyan-400 transition`}>Connexion</Link>
			<Link to="/register" className={`text-lg ${isActive('/register')} font-semibold text-cyan-200 hover:text-cyan-400 transition`}>Inscription</Link>
			</>
		)}
		</div>
	</div>
	</nav>
	<div className="min-h-[90vh] bg-gradient-to-br from-[#232526] via-[#0f2027] to-[#2c5364] py-10 px-2">
	<div className="w-full rounded-2xl bg-white/5 backdrop-blur-md shadow-2xl border border-cyan-400/20 p-8">
     	<Routes>
          <Route path="/" element={<Home />} />
          <Route path="/game" element={<Game />} />
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="*" element={<Error />} />
        </Routes>
    </div>
    </div>
  </>
)
}