// Exemple pour récupérer la liste des utilisateurs
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

export default function Login() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [login, setLogin] = useState("");
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
    setMessage("test");
    try {
      const res = await fetch("/api/users/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: login, password }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setMessage(data.error || "Identifiants incorrects");
        return;
      }
      if (data.success)
      {
        localStorage.setItem("token", data.token);
        navigate("/dashboard");
      }
      setMessage(`Bienvenue ${data.login} (${data.email}) !`);
      setLogin("");
      setPassword("");
    } catch (err: any) {
      setMessage("Erreur lors de la connexion : " + err.message);
    }
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