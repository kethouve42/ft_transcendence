export function clickerView(): string {
  return `
    <div class="flex flex-col items-center justify-center min-h-[60vh]">
      <h1 class="text-4xl font-bold text-cyan-300 mb-6 drop-shadow-[0_0_10px_cyan]">
        Clicker Game
      </h1>
      <div class="card p-8">
        <button
          id="click-btn"
          class="bg-cyan-600 hover:bg-cyan-400 text-white px-6 py-2 rounded-lg shadow-cyan-400/30 shadow transition"
        >
          Clique ici pour gagner des points
        </button>
        <div class="mt-4 text-lg">
          Points accumulés : <span id="point-count" class="font-bold">0</span>
        </div>
      </div>
    </div>
  `;
}

export function clickerEvent(): void {
    const clickBtn = document.getElementById("click-btn");
    const pointCount = document.getElementById("point-count");
  
    if (clickBtn && pointCount) {
      clickBtn.addEventListener("click", () => {
        fetch("/clicker/update", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`, // Envoie le token pour authentification
            "Content-Type": "application/json"
          }
        })
          .then(res => {
            if (!res.ok) {
              throw new Error("Erreur lors de la mise à jour du score.");
            }
            return res.json();
          })
          .then(data => {
            // Met à jour le compteur localement avec le score retourné par le serveur
            pointCount.textContent = data.newScore;
          })
          .catch(err => {
            console.error("❌ Erreur :", err.message);
          });
      });
    }
  }