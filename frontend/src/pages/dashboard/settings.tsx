import '../../css/App.css'

type User = {
  id: number;
  login: string;
  email: string;
  alias?: string;
  avatar?: string;
};

function Settings({ userData }: { userData: User | null }) {
    return (
        <>
            <div>
            <div className="max-w-xl mx-auto bg-white/10 border border-cyan-400/20 rounded-2xl shadow-lg p-8 mt-8 backdrop-blur-md">
                <h2 className="text-3xl font-extrabold text-cyan-300 drop-shadow-[0_0_10px_cyan] tracking-widest uppercase mb-8">Mon profil</h2>
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
                    </>
                ) : (
                    <div className="text-cyan-100">Aucune donnée utilisateur disponible.</div>
                )}
            </div>
            </div>
        </>
    )
  }

export default Settings