import '../../css/App.css'
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"

type User = {
  id: number;
  login: string;
  email: string;
  alias?: string;
  avatar?: string;
};

function Friends({ userData }: { userData: User | null }) {
  const [friends, setFriends] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userData) return;
    fetch(`/api/friends/${userData.id}/friends`)
      .then(res => res.json())
      .then(data => {
        setFriends(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [userData]);

  if (!userData) return <div>Chargement...</div>;
  if (loading) return <div>Chargement des amis...</div>;

  return (
    <div className="max-w-xl mx-auto bg-white/10 border border-cyan-400/20 rounded-2xl shadow-lg p-8 mt-8 backdrop-blur-md">
      <h2 className="text-3xl font-extrabold text-cyan-300 drop-shadow-[0_0_10px_cyan] tracking-widest uppercase mb-8">Mes amis</h2>
      {friends.length === 0 ? (
        <div className="text-cyan-100">Aucun ami pour le moment.</div>
      ) : (
        <ul className="space-y-4">
          {friends.map(friend => (
            <li key={friend.id} className="flex items-center gap-4">
              <span className="inline-block w-10 h-10 rounded-full bg-cyan-900 border-2 border-cyan-400 overflow-hidden">
                {friend.avatar
                  ? <img src={friend.avatar} alt="avatar" className="w-full h-full object-cover" />
                  : <span className="flex items-center justify-center h-full text-cyan-300 font-bold text-xl">{friend.login[0]?.toUpperCase() || "?"}</span>
                }
              </span>
              <span className="text-cyan-200 font-semibold">{friend.alias || friend.login}</span>
              <Link to={`/profile/${friend.id}`} className="ml-auto bg-cyan-600 hover:bg-cyan-400 text-white px-4 py-1 rounded-lg shadow transition">
                Voir profil
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default Friends