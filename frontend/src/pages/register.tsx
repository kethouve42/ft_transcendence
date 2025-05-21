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

export default function Register() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [login, setLogin] = useState("");
  const [email, setEmail] = useState("");
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
      window.location.reload();
      // Recharge la liste
      const data = await res.json();
      setUsers(data);
    } catch (err: any) {
      setMessage("Erreur lors de l'ajout : " + err.message);
    }
  };

  if (loading) return <div>Chargement...</div>;

  return (
    <div>
      <form onSubmit={handleSubmit} className="mb-4">
        <input
          type="text"
          placeholder="Login"
          value={login}
          onChange={e => setLogin(e.target.value)}
          required
          className="border px-2 py-1 mr-2"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
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
      <br />
      <br />
      <br />
      {message && <div>{message}</div>}
      <br />
      <br />
      <br />
      <ul>
        {users.map(user => (
          <li key={user.id}>{user.login} ({user.email})</li>
        ))}
      </ul>
    </div>
  );
}