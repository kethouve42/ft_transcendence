import '../css/App.css'
import {Link} from 'react-router-dom';

function Error() {
    return (
        <>
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <h1 className="text-6xl font-extrabold text-cyan-400 drop-shadow-[0_0_20px_cyan] mb-4">404</h1>
            <p className="text-xl text-cyan-200 mb-8">Page non trouvée</p>
            <Link to="/" className="bg-cyan-600 hover:bg-cyan-400 text-white px-6 py-2 rounded-lg shadow-cyan-400/30 shadow transition">
                Retour à l'accueil
            </Link>
            </div>
        </>
    )
  }

export default Error