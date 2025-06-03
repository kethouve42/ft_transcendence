import '../../css/App.css'
import { useEffect, useState } from "react"

type User = {
  id: number;
  login: string;
  email: string;
  alias?: string;
  avatar?: string;
};

function Edit({ userData, refreshUserData }: { userData: User | null, refreshUserData: () => Promise<void> }) {
    const [aliasInput, setAliasInput] = useState("");
    const [emailInput, setEmailInput] = useState("");
    const [loginInput, setLoginInput] = useState("");
    const [avatarInput, setAvatarInput] = useState("");
    const [saveMessage, setSaveMessage] = useState("");
    const token = localStorage.getItem("token");

    // Recharge les inputs quand userData change
    useEffect(() => {
        if (userData) {
        setAliasInput(userData.alias || "");
        setEmailInput(userData.email || "");
        setLoginInput(userData.login || "");
        setAvatarInput(userData.avatar || "");
        }
    }, [userData]);

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
            avatar: avatarInput,
            }),
        });

        if (res.ok) {
            await refreshUserData();
            setSaveMessage("Profil mis à jour !");
        } else {
            const error = await res.json();
            setSaveMessage(error.error || "Erreur lors de la sauvegarde.");
        }
        } catch (err) {
        setSaveMessage("Erreur réseau ou serveur.");
        }
    };
    
    return (
        <>
            <div className="max-w-xl mx-auto bg-white/10 border border-cyan-400/20 rounded-2xl shadow-lg p-8 mt-8 backdrop-blur-md">
            <h2 className="text-3xl font-extrabold text-cyan-300 drop-shadow-[0_0_10px_cyan] tracking-widest uppercase mb-8">Éditer mon profil</h2>
            <div className="mb-6">
                <label className="block font-semibold mb-1 text-cyan-200">Login</label>
                <input className="bg-cyan-900/40 border border-cyan-400 text-cyan-200 px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-cyan-400 shadow-cyan-400/20 shadow"
                value={loginInput} onChange={e => setLoginInput(e.target.value)} />
            </div>
            <div className="mb-6">
                <label className="block font-semibold mb-1 text-cyan-200">Email</label>
                <input className="bg-cyan-900/40 border border-cyan-400 text-cyan-200 px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-cyan-400 shadow-cyan-400/20 shadow"
                value={emailInput} onChange={e => setEmailInput(e.target.value)} />
            </div>
            <div className="mb-6">
                <label className="block font-semibold mb-1 text-cyan-200">Alias</label>
                <input className="bg-cyan-900/40 border border-cyan-400 text-cyan-200 px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-cyan-400 shadow-cyan-400/20 shadow"
                value={aliasInput} onChange={e => setAliasInput(e.target.value)} />
            </div>
            <div className="mb-6">
                <label className="block font-semibold mb-1 text-cyan-200">Avatar</label>
                <input className="bg-cyan-900/40 border border-cyan-400 text-cyan-200 px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-cyan-400 shadow-cyan-400/20 shadow"
                value={avatarInput} onChange={e => setAvatarInput(e.target.value)} />
            </div>
            <button onClick={handleSaveClick} className="bg-cyan-600 hover:bg-cyan-400 text-white font-bold px-6 py-2 rounded-lg shadow-cyan-400/30 shadow transition">Sauvegarder</button>
            {saveMessage && <div className="mt-4 text-cyan-200">{saveMessage}</div>}
            </div>
        </>
    )
  }

export default Edit