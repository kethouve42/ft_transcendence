import React from "react"
import { createRoot } from "react-dom/client"
import Game from "./game"

const container = document.getElementById("root");
if (!container) {
  throw new Error("Impossible de trouver l'élément #root");
}

const root = createRoot(container);
root.render(
  <React.StrictMode>
    <Game />
  </React.StrictMode>
);