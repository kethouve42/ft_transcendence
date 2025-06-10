import { useState, useCallback, useEffect } from "react";
import Navbar from "../Navbar";
import Dashboard from "../pages/dashboard";
import { Routes, Route, useNavigate } from "react-router-dom";
import fetchUserId from "../auth/authHelpers";
import Home from "../pages/home";
import Game from "../pages/game";
import Error from "../pages/error";
import Login from "../pages/login";
import Register from "../pages/register";
import PublicRoute from "../auth/PublicRoute";
import ProtectedRoute from "../auth/ProtectedRoute";
import Profile from "./profile";
import RpgIdle from "../rpgIdle/rpgIdle";
import { isTokenExpired } from "../auth/token";

type User = {
  id: number;
  login: string;
  email: string;
  alias?: string;
  avatar?: string;
};

export default function App() {
  const [userData, setUserData] = useState<User | null>(null);
  const navigate = useNavigate();

  const refreshUserData = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    const userId = await fetchUserId(token);
    if (!userId) return;
    const res = await fetch(`/api/users/${userId}`);
    const data = await res.json();
    setUserData(data);
  }, []);

  // Rafraîchit au chargement ou quand le token change
  useEffect(() => {
  const token = localStorage.getItem("token");

    if (!token || isTokenExpired(token)) {
      localStorage.removeItem("token");
      navigate("/login");
      return;
    }
    refreshUserData();
  }, [refreshUserData]);

  return (
    <>
      <Navbar userData={userData} />
      <div className="min-h-[90vh] bg-gradient-to-br from-[#232526] via-[#0f2027] to-[#2c5364] py-10 px-2">
        <div className="w-full rounded-2xl bg-white/5 backdrop-blur-md shadow-2xl border border-cyan-400/20 p-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/rpg-idle" element={<RpgIdle />} />
            <Route path="/game" element={<Game />} />
            <Route path="/login" element={<PublicRoute><Login refreshUserData={refreshUserData} /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard userData={userData} refreshUserData={refreshUserData} />
              </ProtectedRoute>
            } />
            <Route path="/profile/:id" element={<Profile userData={userData}/>} />
            <Route path="*" element={<Error />} />
          </Routes>
        </div>
      </div>
    </>
  );
}