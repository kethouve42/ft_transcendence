import '../css/App.css'
import { useState } from "react"
import View from "./dashboard/view"
import Edit from "./dashboard/edit"
import Settings from "./dashboard/settings"
import Friends from "./dashboard/friends"

type User = {
  id: number;
  login: string;
  email: string;
  alias?: string;
  avatar?: string;
};

function Dashboard({ userData, refreshUserData }: { userData: User | null, refreshUserData: () => Promise<void> }) {
  const [menu, setMenu] = useState("view");


  if (!userData) return <div>Chargement...</div>;

  return (
    <>
      <div className="flex gap-4 mb-6">
        <button onClick={() => setMenu("view")}>Voir</button>
        <button onClick={() => setMenu("edit")}>Éditer</button>
        <button onClick={() => setMenu("settings")}>Paramètres</button>
        <button onClick={() => setMenu("friends")}>Friends</button>
      </div>
      {menu === "view" &&
        <View userData={userData}/>
      }
      {menu === "edit" &&
        <Edit userData={userData} refreshUserData={refreshUserData}/>
      }
      {menu === "settings" &&
        <Settings userData={userData}/>
      }
      {menu === "friends" &&
        <Friends userData={userData}/>
      }
    </>
  )
}

export default Dashboard