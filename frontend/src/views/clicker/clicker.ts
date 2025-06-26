import { score } from "../game/score";

export function clickerView(): string {
  return `
    <div class="flex flex-row items-center justify-center min-h-[60vh]">
      <!-- Jauge de chaleur à gauche -->
      <div class="flex flex-col items-center mr-8">
        <div class="w-8 h-64 bg-gray-800 rounded-lg flex items-end overflow-hidden border-2 border-cyan-400">
          <div id="heat-bar" class="w-full bg-red-500 transition-all duration-300" style="height: 0%"></div>
        </div>
        <span class="mt-2 text-cyan-300 font-bold">Chaleur</span>
        <span id="heat-value" class="text-lg font-extrabold text-red-400">0</span>
      </div>
      <!-- Le reste de ton contenu (image, boutons, etc) -->
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
        <div class="flex flex-col items-center">
          <button class="bg-amber-500 hover:bg-amber-400 text-white px-5 py-2 rounded-lg shadow transition" id="buy-cooler">
          Acheter refroidisseur
          </button>
          <span id="cooler-count" class="mt-2 text-2xl font-bold text-amber-400">0</span>
          </div>
          <div class="flex flex-col items-center">
          <button class="bg-lime-600 hover:bg-lime-500 text-white px-5 py-2 rounded-lg shadow transition" id="buy-generator">
          Acheter generateur
          </button>
          <span id="generator-count" class="mt-2 text-2xl font-bold text-lime-400">0</span>
        </div>
        <div class="flex flex-col items-center">
          <button class="bg-fuchsia-600 hover:bg-fuchsia-500 text-white px-5 py-2 rounded-lg shadow transition" id="buy-coil">
          Acheter bobines
          </button>
          <span id="coil-count" class="mt-2 text-2xl font-bold text-fuchsia-400">0</span>
          </div>
      </div>
      <!-- Bouton Mode Versus -->
      <button
        id="versus-btn"
        class="fixed top-4 right-4 bg-pink-600 hover:bg-pink-400 text-white px-4 py-2 rounded shadow-lg z-50"
      >
        Mode Versus
      </button>
      </div>
      `;
    }

export function clickerEvent(): void {

  // Initialisation de la chaleur et des variables
  let heat = 0;
  let overheated = false;
  const maxHeat = 100;

  // Elements de la page
  const heatBar = document.getElementById("heat-bar");
  const heatValue = document.getElementById("heat-value");
  const clickBtn = document.getElementById("click-btn");
  const pointCount = document.getElementById("point-count");
  const coolerCount = document.getElementById("cooler-count");
  const buyCoolerBtn = document.getElementById("buy-cooler");
  const generatorCount = document.getElementById("generator-count");
  const buyGeneratorBtn = document.getElementById("buy-generator");
  const coilCount = document.getElementById("coil-count");
  const buyCoilBtn = document.getElementById("buy-coil");
  const versusBtn = document.getElementById("versus-btn");
  
  // Verification de l'etat de surchauffe
  if (localStorage.getItem("overheated") == "true")
  {
    (clickBtn as HTMLButtonElement).disabled = true;
    clickBtn!.classList.add("opacity-50", "cursor-not-allowed");
    clickBtn!.textContent = "Surchauffe !";
  }
  updateHeatBar();

  // Fonction pour mettre à jour la jauge visuellement
  function updateHeatBar() 
  {
    if (heatBar && heatValue) {
      const percent = Math.max(0, Math.min(100, (Number(localStorage.getItem("heat")) / maxHeat) * 100));
      heatBar.style.height = percent + "%";
      heatValue.textContent = localStorage.getItem("heat") || "0";
      heatBar.className = "w-full transition-all duration-300 " +
        (percent > 80 ? "bg-red-700" : percent > 50 ? "bg-orange-400" : "bg-green-400");
    }
  }

  // Les actions de la fonction du temps
  setInterval(() => {

    // Refroidissement du réacteur
    if (Number(localStorage.getItem("heat")) > 0) 
    {
      heat = Math.max(0, Number(localStorage.getItem("heat")) - 1); // Par exemple -1 toutes les 200ms
      localStorage.setItem("heat", heat.toString());
      updateHeatBar();
    }

    // Production d'energie des generateurs secondaires
    if (localStorage.getItem("overheated") == "false")
    {
      fetch("/api/clicker/generator", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        }
      })
        .then(res => {
          if (!res.ok) throw new Error("Erreur lors de l'activation des generateurs secondaires'.");
          return res.json();
        })
        .then(data => {
          pointCount!.textContent = data.newScore;
        })
        .catch(err => {
          console.error("❌ Erreur :", err.message);
        });
    }

    // Vérification de la fin de surchauffe
    if ((clickBtn as HTMLButtonElement).disabled == true && Number(localStorage.getItem("heat")) <= 5)
    {
      (clickBtn as HTMLButtonElement).disabled = false;
      localStorage.setItem("overheated", "false");
      clickBtn!.classList.remove("opacity-50", "cursor-not-allowed");
      clickBtn!.textContent = "Clique !";
    }
  }, 200);

  // Bouton principal (incrément du score)
  if (clickBtn && pointCount) {
    clickBtn.addEventListener("click", () => {
      
      // Incrémenter la temperature du réacteur
      heat = Math.min(maxHeat, Number(localStorage.getItem("heat")) + 10);
      localStorage.setItem("heat", heat.toString());
      updateHeatBar();

      // Tester et appliquer la surchauffe
      if (Number(localStorage.getItem("heat")) >= maxHeat)
      {
        (clickBtn as HTMLButtonElement).disabled = true;
        localStorage.setItem("overheated", "true");
        clickBtn.classList.add("opacity-50", "cursor-not-allowed");
        clickBtn.textContent = "Surchauffe !";

        fetch("/api/clicker/overheat", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
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

        return;
      }

      // Incrémenter le score via la route
      fetch("/api/clicker/update", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
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

  // Bouton "Acheter cooler" (buyCooler)
  if (buyCoolerBtn) {
    buyCoolerBtn.addEventListener("click", () => {
      fetch("/api/clicker/buyCooler", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        }
      })
        .then(res => {
          if (!res.ok) throw new Error("Erreur lors de l'achat du cooler.");
          return res.json();
        })
        .then(data => {
          pointCount!.textContent = data.newScore;
          coolerCount!.textContent = data.newCooler;
        })
        .catch(err => {
          console.error("❌ Erreur :", err.message);
        });
    });
  }

  // Bouton "Acheter generateur" (buyGenerator)
  if (buyGeneratorBtn) {
    buyGeneratorBtn.addEventListener("click", () => {
      fetch("/api/clicker/buyGenerator", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        }
      })
        .then(res => {
          if (!res.ok) throw new Error("Erreur lors de l'achat du generator.");
          return res.json();
        })
        .then(data => {
          pointCount!.textContent = data.newScore;
          generatorCount!.textContent = data.newGenerator;
        })
        .catch(err => {
          console.error("❌ Erreur :", err.message);
        });
    });
  }

  // Bouton "Acheter bobine" (buyCoil)
  if (buyCoilBtn) {
    buyCoilBtn.addEventListener("click", () => {
      fetch("/api/clicker/buyCoil", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        }
      })
        .then(res => {
          if (!res.ok) throw new Error("Erreur lors de l'achat de la bobine.");
          return res.json();
        })
        .then(data => {
          pointCount!.textContent = data.newScore;
          coilCount!.textContent = data.newCoil;
        })
        .catch(err => {
          console.error("❌ Erreur :", err.message);
        });
    });
  }

  // Bouton "Mode Versus"
  /*if (versusBtn) {
  versusBtn.addEventListener("click", () => {
    document.getElementById("app")!.innerHTML = versusView();
    versusEvent();
  });
  }*/

  // Récupération des stats initiales
  fetch("/api/clicker/stats", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      }
    })
      .then(res => {
        if (!res.ok) throw new Error("Erreur lors de la recuperation des donnees.");
        return res.json();
      })
      .then(data => {
        pointCount!.textContent = data.score;
        coolerCount!.textContent = data.cooler;
        generatorCount!.textContent = data.generator;
        coilCount!.textContent = data.coil
      })
      .catch(err => {
        console.error("❌ Erreur :", err.message);
      });
}
