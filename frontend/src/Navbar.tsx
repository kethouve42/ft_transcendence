import {Routes, Route, Link, useLocation} from 'react-router-dom'
import Home from './pages/home'
import Game from './pages/game'
import Error from './pages/error'

export default function Navbar() {
  const location = useLocation()
  const isActive = (path: string) =>
    location.pathname === path
      ? 'text-blue-600 font-semibold border-b-2 border-blue-600'
      : 'text-gray-700 hover:text-blue-500'

      let pageClass = ''
      if (location.pathname === '/') pageClass = 'bg-pink-800 min-h-screen'
      else if (location.pathname === '/game') pageClass = 'bg-pink-800 min-h-screen'
      else if (location.pathname === '/error') pageClass = 'bg-pink-800 min-h-screen'

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
                    <Link to="/error" className={`${isActive('/error')} transition`}>
                        Erreur
                    </Link>
                </div>
                {/* Bouton optionnel à droite */}
                <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
                Connexion
                </button>
            </div>
        </nav>
        <div className={pageClass}>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/error" element={<Error />} />
                <Route path="/game" element={<Game />} />
            </Routes>
        </div>
    </>
  )
}
