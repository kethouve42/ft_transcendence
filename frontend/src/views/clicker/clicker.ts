export function clickerView(): string {
  return `
    <div class="flex flex-col items-center justify-center min-h-[60vh]">
      <div class="relative flex items-center">
        <!-- Image centrale -->
        <img src="/Clicker/Reactor.jpg" alt="Cible" class="w-64 h-64 object-contain rounded-xl shadow-lg" />
        <!-- Bouton sous l'image -->
        <button
          id="click-btn"
          class="ml-4 bg-cyan-600 hover:bg-cyan-400 text-white px-6 py-2 rounded-full shadow-lg transition"
        >
          Clique !
        </button>
        <!-- Compteur à droite de l'image -->
        <div class="ml-8 flex flex-col items-center">
          <span class="text-lg text-cyan-300 font-bold">Points</span>
          <span id="point-count" class="text-3xl font-extrabold mt-2">0</span>
        </div>
      </div>
      <!-- Boutons d'achat sous l'image -->
      <div class="flex gap-6 mt-10">
        <button class="bg-amber-500 hover:bg-amber-400 text-white px-5 py-2 rounded-lg shadow transition" id="buy-ressource-1">
          Acheter Ressource 1
        </button>
        <button class="bg-lime-600 hover:bg-lime-500 text-white px-5 py-2 rounded-lg shadow transition" id="buy-ressource-2">
          Acheter Ressource 2
        </button>
        <button class="bg-fuchsia-600 hover:bg-fuchsia-500 text-white px-5 py-2 rounded-lg shadow transition" id="buy-ressource-3">
          Acheter Ressource 3
        </button>
      </div>
    </div>
  `;
}

export function clickerEvent(): void {
  // Bouton principal (incrément du score)
  const clickBtn = document.getElementById("click-btn");
  const pointCount = document.getElementById("point-count");
  if (clickBtn && pointCount) {
    clickBtn.addEventListener("click", () => {
      fetch("/api/clicker/update", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json"
        }
      })
        .then(res => {
          if (!res.ok) throw new Error("Erreur lors de la mise à jour du score.");
          return res.json();
        })
        .then(data => {
          pointCount.textContent = data.newScore;
        })
        .catch(err => {
          console.error("❌ Erreur :", err.message);
        });
    });
  }

/* ================== MARCHE PAS POUR LE MOMENT ================== */
// (et fait planter l'autre bouton)

  // Bouton "Acheter cooler" (buyCooler)
  const buyCoolerBtn = document.getElementById("buy-ressource-1");
  if (buyCoolerBtn) {
    buyCoolerBtn.addEventListener("click", () => {
      fetch("/api/clicker/buyCooler", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json"
        }
      })
        .then(res => {
          if (!res.ok) throw new Error("Erreur lors de l'achat du cooler.");
          return res.json();
        })
        .then(data => {
          // Optionnel : afficher la nouvelle valeur ou un message
          alert("Cooler acheté ! Nouveau total : " + data.newCooler);
        })
        .catch(err => {
          console.error("❌ Erreur :", err.message);
        });
    });
  }
}
/* ================================================================ */