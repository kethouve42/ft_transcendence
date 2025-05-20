// Exemple pour récupérer la liste des utilisateurs
import { useEffect, useState } from "react";

type User = {
  id: number;
  login: string;
  email: string;
  alias?: string;
  avatar?: string;
  log_data?: string;
};

export default function Login() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/users")
    .then(res => {
      if (!res.ok) throw new Error("Erreur API: " + res.status);
      return res.json();
    })
    .then(data => {
      setUsers(data);
      setLoading(false);
    })
    .catch(err => {
      setLoading(false);
      alert("Erreur lors du chargement: " + err.message);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    const user = users.find(u => u.login === login || u.email === login);
    if (user) {
      setMessage(`Utilisateur trouvé : ${user.login} (${user.email})`);
    } else {
      setMessage("Aucun utilisateur trouvé avec ce login.");
    }
    setLogin("");
    setPassword("");
  };

  if (loading) return <div>Chargement...</div>;

  return (
    <div>
      <form onSubmit={handleSubmit} className="mb-4">
        <input
          type="text"
          placeholder="Login/Email"
          value={login}
          onChange={e => setLogin(e.target.value)}
          required
          className="border px-2 py-1 mr-2"
        />
        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          className="border px-2 py-1 mr-2"
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          Ajouter
        </button>
      </form>
      {message && <div>{message}</div>}
    </div>
  );
}