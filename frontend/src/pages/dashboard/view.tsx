import '../../css/App.css';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

type User = {
  id: number;
  login: string;
  email: string;
  alias?: string;
  avatar?: string;
};

type Match = {
  id: number;
  date: string;
  duration: number;
  user1_id: number;
  user2_id: number | null;
  winner_id: number;
  score: string;
};

type UserStats = {
  global: {
    totalMatches: number;
    wins: number;
    losses: number;
    winRate: number;
    averageDuration: number;
    totalGameTime: number;
  };
  vsAI: {
    matches: number;
    wins: number;
    losses: number;
    winRate: number;
    totalIaTime: number;
  };
  vsPlayer: {
    matches: number;
    wins: number;
    losses: number;
    winRate: number;
    totalMultiTime: number;
  };
};

type UserMap = Record<number, { alias?: string; login: string }>;

function View({ userData }: { userData: User | null }) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [users, setUsers] = useState<UserMap>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!userData) return;

    const fetchData = async () => {
      try {
        // 1. Récupère tous les utilisateurs
        const userRes = await fetch(`/api/users`);
        if (!userRes.ok) throw new Error("Erreur lors du chargement des utilisateurs");
        const usersList: User[] = await userRes.json();
        const userMap: UserMap = {};
        usersList.forEach(u => {
          userMap[u.id] = { alias: u.alias, login: u.login };
        });
        setUsers(userMap);

      // 2. Récupère tous les matchs de l'utilisateur connecté
      const matchRes = await fetch(`/api/matchs/user/${userData.id}`, {      
        method: "GET",
        headers: { 
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      });
      if (!matchRes.ok) throw new Error("Erreur lors du chargement des matchs");
      const matchsData: Match[] = await matchRes.json();
      setMatches(matchsData);

      // 3. Récupère les stats de l'utilisateur connecté
      const statsRes = await fetch(`/api/matchs/user/${userData.id}/stats`, {      
        method: "GET",
        headers: { 
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      });
        if (statsRes.ok) {
          const statsData: UserStats = await statsRes.json();
          setUserStats(statsData);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userData]);

  
  const handleUserClick = (id: number) => {
    navigate(`/profile/${id}`);
  };
  const renderUser = (id: number | null) => {
    if (!id) return <span className="italic text-cyan-400">IA</span>;
    const user = users[id];
    if (!user) return <span>{id}</span>;
    return (
      <span
        className="text-cyan-300 hover:underline cursor-pointer"
        onClick={() => handleUserClick(id)}
      >
        {user.alias || user.login}
      </span>
    );
  };

  return (
    <div>
      <div className="max-w-xl mx-auto bg-white/10 border border-cyan-400/20 rounded-2xl shadow-lg p-8 mt-8 backdrop-blur-md">
        <h2 className="text-3xl font-extrabold text-cyan-300 drop-shadow-[0_0_10px_cyan] tracking-widest uppercase mb-8">
          Mon profil
        </h2>
        {userData ? (
          <>
            <div className="mb-6">
              <span className="block font-semibold mb-1 text-cyan-200">Login</span>
              <span className="text-cyan-100">{userData.login}</span>
            </div>
            <div className="mb-6">
              <span className="block font-semibold mb-1 text-cyan-200">Email</span>
              <span className="text-cyan-100">{userData.email}</span>
            </div>
            <div className="mb-6">
              <span className="block font-semibold mb-1 text-cyan-200">Alias</span>
              <span className="text-cyan-100">{userData.alias}</span>
            </div>
            <div className="mb-6">
              <span className="block font-semibold mb-1 text-cyan-200">Avatar</span>
              <span className="text-cyan-100">{userData.avatar}</span>
            </div>

            {userStats && (
              <div className="mb-10">
                <h3 className="text-xl font-bold text-cyan-200 mb-4">Statistiques</h3>
                <div className="mb-4">
                  <h4 className="font-semibold text-cyan-300 mb-2">Global</h4>
                  <div className="grid grid-cols-2 gap-4 text-cyan-100">
                    <div><b>Matchs joués :</b> {userStats.global.totalMatches}</div>
                    <div><b>Victoires :</b> {userStats.global.wins}</div>
                    <div><b>Défaites :</b> {userStats.global.losses}</div>
                    <div><b>Winrate :</b> {userStats.global.winRate}%</div>
                    <div><b>Durée moyenne :</b> {userStats.global.averageDuration} sec</div>
                    <div><b>Temps de jeu total :</b> {Math.round(userStats.global.totalGameTime / 60)} min</div>
                  </div>
                </div>
                <div className="mb-4">
                  <h4 className="font-semibold text-cyan-300 mb-2">Contre IA</h4>
                  <div className="grid grid-cols-2 gap-4 text-cyan-100">
                    <div><b>Matchs :</b> {userStats.vsAI.matches}</div>
                    <div><b>Victoires :</b> {userStats.vsAI.wins}</div>
                    <div><b>Défaites :</b> {userStats.vsAI.losses}</div>
                    <div><b>Winrate :</b> {userStats.vsAI.winRate}%</div>
                    <div className="col-span-2"><b>Temps contre IA :</b> {Math.round(userStats.vsAI.totalIaTime / 60)} min</div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-cyan-300 mb-2">Contre Joueurs</h4>
                  <div className="grid grid-cols-2 gap-4 text-cyan-100">
                    <div><b>Matchs :</b> {userStats.vsPlayer.matches}</div>
                    <div><b>Victoires :</b> {userStats.vsPlayer.wins}</div>
                    <div><b>Défaites :</b> {userStats.vsPlayer.losses}</div>
                    <div><b>Winrate :</b> {userStats.vsPlayer.winRate}%</div>
                    <div className="col-span-2"><b>Temps multi :</b> {Math.round(userStats.vsPlayer.totalMultiTime / 60)} min</div>
                  </div>
                </div>
              </div>
            )}

            <div className="max-w-2xl mx-auto mt-8">
              <h2 className="text-2xl font-bold text-cyan-300 mb-4">Historique des matchs</h2>
              {loading ? (
                <p className="text-cyan-200">Chargement…</p>
              ) : error ? (
                <p className="text-red-500">{error}</p>
              ) : matches.length === 0 ? (
                <p className="text-cyan-400">Aucun match trouvé.</p>
              ) : (
                <ul className="space-y-4">
                  {matches.map((match) => (
                    <li key={match.id} className="bg-cyan-900/40 border border-cyan-500 rounded-xl p-4 shadow-md text-cyan-100">
                      <p><strong>Date :</strong> {new Date(match.date).toLocaleString()}</p>
                      <p><strong>Durée :</strong> {match.duration} secondes</p>
                      <p><strong>Joueurs :</strong> {renderUser(match.user1_id)} vs {renderUser(match.user2_id)}</p>
                      <p><strong>Score :</strong> {match.score}</p>
                      <p><strong>Gagnant :</strong> {renderUser(match.winner_id)}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        ) : (
          <div className="text-cyan-100">Aucune donnée utilisateur disponible.</div>
        )}
      </div>
    </div>
  );
}

export default View;
