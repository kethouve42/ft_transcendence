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
		const updated = await res.json();
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
	
	/*
	const handleSaveClick = async () => {
		if (!userData) return;
		// Envoie les nouvelles données au backend
		const res = await fetch(`/api/users/${userData.id}`, {
			method: "PUT",
			headers: {
			"Content-Type": "application/json",
			"Authorization": `Bearer ${token}`,
			},
			body: JSON.stringify({
			id: userData.id,
			login: loginInput,
			email: emailInput,
			alias: aliasInput,
			avatar: AvatarInput,
			log_data: userData.log_data,
			}),
		});
		if (res.ok) {
			setUserData(prev => prev ? { ...prev, login: loginInput, email: emailInput, alias: aliasInput, avatar: AvatarInput } : prev);
		}
	};*/

    return (
        <>
			<div>
				<h1>login: </h1>
				<><input value={loginInput} onChange={e => setLoginInput(e.target.value)}/></>
			</div>
			<div>
				<h1>email: </h1>
				<><input value={emailInput} onChange={e => setEmailInput(e.target.value)}/></>
			</div>
			<div>
				<h1>Alias: </h1>
				<><input value={aliasInput} onChange={e => setAliasInput(e.target.value)}/></>
			</div>
			<div>
				<h1>Avatar: </h1>
				<><input value={AvatarInput} onChange={e => setAvatarInput(e.target.value)}/></>
			</div>
			<button onClick={handleSaveClick}>Sauvegarder</button>
        </>
    )
  }

export default Dashboard