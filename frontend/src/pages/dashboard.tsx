import '../css/App.css'
import { useEffect, useState } from "react"
import fetchUserId from '../auth/authHelpers'

type User = {
  id: number;
  login: string;
  email: string;
  alias?: string;
  avatar?: string;
  log_data?: string;
};

function Dashboard() {
    const [userData, setUserData] = useState<User | null>(null);
	const [aliasInput, setAliasInput] = useState("");
	const [emailInput, setEmailInput] = useState("");
	const [loginInput, setLoginInput] = useState("");
	const [AvatarInput, setAvatarInput] = useState("");
    const token = localStorage.getItem("token");

    useEffect(() => {
        const fetchData = async () => {
            if (!token) return;
            const userId = await fetchUserId(token);
            if (!userId) return;
            const res = await fetch(`/api/users/${userId}`);
            const data = await res.json();
            setUserData(data);
			setAliasInput(data.alias || "not set");
			setEmailInput(data.email || "not set");
			setLoginInput(data.login || "not set");
			setAvatarInput(data.avatar || "not set");
        };
        fetchData();
    }, [token]);

	const [saveMessage, setSaveMessage] = useState("");

	const handleSaveClick = async () => {
	if (!userData) return;
		try {
			const res = await fetch(`/api/users/${userData.id}`, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${token}`,
			},
			body: JSON.stringify({
				login: loginInput,
				email: emailInput,
				alias: aliasInput,
				avatar: AvatarInput,
			}),
			});

			if (res.ok) {
			setUserData(prev =>
				prev
				? {
					...prev,
					login: loginInput,
					email: emailInput,
					alias: aliasInput,
					avatar: AvatarInput,
					}
				: prev
			);
			setSaveMessage("Profil mis à jour !");
			} else {
			const error = await res.json();
			setSaveMessage(error.error || "Erreur lors de la sauvegarde.");
			}
		} catch (err) {
			setSaveMessage("Erreur réseau ou serveur.");
		}
	};

	const [menu, setMenu] = useState("view");
    return (
        <>
			<button onClick={() => setMenu("view")}>Voir</button>
			<button onClick={() => setMenu("edit")}>Éditer</button>
			<button onClick={() => setMenu("settings")}>Paramètres</button>
			{menu === "view" &&
				<div>Affichage</div>
			}
			{menu === "edit" &&
				<>
					<div className="max-w-xl mx-auto bg-white/10 border border-cyan-400/20 rounded-2xl shadow-lg p-8 mt-8 backdrop-blur-md">
					<h2 className="text-3xl font-extrabold text-cyan-300 drop-shadow-[0_0_10px_cyan] tracking-widest uppercase mb-8">Mon profil</h2>
					<div className="mb-6">
						<label className="block font-semibold mb-1 text-cyan-200">Login</label>
						<input className="bg-cyan-900/40 border border-cyan-400 text-cyan-200 px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-cyan-400 shadow-cyan-400/20 shadow" value={loginInput} onChange={e => setLoginInput(e.target.value)} />
					</div>
					<div className="mb-6">
						<label className="block font-semibold mb-1 text-cyan-200">Email</label>
						<input className="bg-cyan-900/40 border border-cyan-400 text-cyan-200 px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-cyan-400 shadow-cyan-400/20 shadow" value={emailInput} onChange={e => setEmailInput(e.target.value)} />
					</div>
					<div className="mb-6">
						<label className="block font-semibold mb-1 text-cyan-200">Alias</label>
						<input className="bg-cyan-900/40 border border-cyan-400 text-cyan-200 px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-cyan-400 shadow-cyan-400/20 shadow" value={aliasInput} onChange={e => setAliasInput(e.target.value)} />
					</div>
					<div className="mb-6">
						<label className="block font-semibold mb-1 text-cyan-200">Avatar</label>
						<input className="bg-cyan-900/40 border border-cyan-400 text-cyan-200 px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-cyan-400 shadow-cyan-400/20 shadow" value={AvatarInput} onChange={e => setAvatarInput(e.target.value)} />
					</div>
					<button className="bg-cyan-600 hover:bg-cyan-400 text-white font-bold px-6 py-2 rounded-lg shadow-cyan-400/30 shadow transition">Sauvegarder</button>
					{saveMessage && <div className="mt-4 text-cyan-200">{saveMessage}</div>}
					</div>
				</>
			}
			{menu === "settings" &&
			 	<div>Paramètres</div>
			}
        </>
    )
  }

export default Dashboard