import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

type User = {
  id: number;
  login: string;
  email: string;
  alias?: string;
  avatar?: string;
};

export default function Profile({ userData }: { userData: User | null }) {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [isFriend, setIsFriend] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState("");
  const currentUserId =  userData?.id

  // Récupère les infos du profil
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`/api/users/${id}`)
      .then(res => res.json())
      .then(data => {
        setUser(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  // Vérifie si c'est déjà un ami
  useEffect(() => {
    if (!id || !currentUserId) return;
    fetch(`/api/friends/${currentUserId}/friends`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setIsFriend(data.some((u: User) => String(u.id) === id));
        }
      });
  }, [id, currentUserId]);

  // Ajout d'ami
  const handleAddFriend = async () => {
    setActionMsg("");
    const res = await fetch("/api/friends", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: Number(currentUserId), friend_id: Number(id) }),
    });
    if (res.ok) {
      setIsFriend(true);
      setActionMsg("Ami ajouté !");
    } else {
      setActionMsg("Erreur lors de l'ajout.");
    }
  };

  // Suppression d'ami
  const handleRemoveFriend = async () => {
    setActionMsg("");
    const res = await fetch(`/api/friends/`, { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({user_id: currentUserId, friend_id: id}),});
    if (res.ok) {
      setIsFriend(false);
      setActionMsg("Ami retiré.");
    } else {
      setActionMsg("Erreur lors de la suppression.");
    }
  };

  if (loading) return <div>Chargement du profil...</div>;
  if (!user) return <div>Utilisateur introuvable.</div>;

  return (
    <div className="max-w-xl mx-auto bg-white/10 border border-cyan-400/20 rounded-2xl shadow-lg p-8 mt-8 backdrop-blur-md">
      <div className="flex items-center gap-6 mb-8">
        <span className="inline-block w-20 h-20 rounded-full bg-cyan-900 border-2 border-cyan-400 overflow-hidden">
          {user.avatar
            ? <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
            : <span className="flex items-center justify-center h-full text-cyan-300 font-bold text-3xl">{user.login[0]?.toUpperCase() || "?"}</span>
          }
        </span>
        <div>
          <div className="text-2xl font-bold text-cyan-200">{user.alias || user.login}</div>
          <div className="text-cyan-100">{user.email}</div>
        </div>
      </div>
      {String(user.id) !== String(currentUserId) && (
        <div className="mb-4">
          {isFriend ? (
            <button
              className="bg-red-600 hover:bg-red-400 text-white px-4 py-2 rounded-lg shadow transition"
              onClick={handleRemoveFriend}
            >
              Retirer des amis
            </button>
          ) : (
            <>
            <button
              className="bg-cyan-600 hover:bg-cyan-400 text-white px-4 py-2 rounded-lg shadow transition"
              onClick={handleAddFriend}
            >
              Ajouter comme ami
            </button>
            </>
          )}
        </div>
      )}
      {actionMsg && <div className="text-cyan-200">{actionMsg}</div>}
    </div>
  );
}