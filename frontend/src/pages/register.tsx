import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

type User = {
  id: number;
  login: string;
  email: string;
  alias?: string;
  avatar?: string;
  log_data?: string;
};

export default function Register() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [login, setLogin] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetch("/api/users")
      .then(res => {
        if (!res.ok) throw new Error("Erreur API: " + res.status);
        return res.json();
      })
      .then(data => {
        setUsers(Array.isArray(data) ? data : []);
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
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login, email, password }),
      });
      if (!res.ok) throw new Error("Erreur API: " + res.status);
      setMessage("Utilisateur ajouté !");
      setLogin("");
      setEmail("");
      setPassword("");
      navigate("/login");
    } catch (err: any) {
      setMessage("Erreur lors de l'ajout : " + err.message);
    }
  };

  if (loading) return <div>Chargement...</div>;

  return (
    <div className="max-w-md mx-auto mt-12 bg-white/10 border border-cyan-400/20 rounded-2xl shadow-lg p-8 backdrop-blur-md">
      <h2 className="text-2xl font-bold mb-6 text-cyan-300 tracking-widest uppercase">Inscription</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <input
          type="text"
          placeholder="Login"
          value={login}
          onChange={e => setLogin(e.target.value)}
          required
          className="bg-cyan-900/40 border border-cyan-400 text-cyan-200 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 shadow-cyan-400/20 shadow"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          className="bg-cyan-900/40 border border-cyan-400 text-cyan-200 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 shadow-cyan-400/20 shadow"
        />
        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          className="bg-cyan-900/40 border border-cyan-400 text-cyan-200 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 shadow-cyan-400/20 shadow"
        />
        <button
          type="submit"
          className="bg-cyan-600 hover:bg-cyan-400 text-white font-bold px-6 py-2 rounded-lg shadow-cyan-400/30 shadow transition"
        >
          Ajouter
        </button>
        {message && <div className="text-cyan-200">{message}</div>}
      </form>
      <ul className="mt-8 text-cyan-100">
        {Array.isArray(users) && users.map(user => (
          <li key={user.id}>{user.login} ({user.email})</li>
        ))}
      </ul>
    </div>
  );
}