import { navigateTo } from "../../main";

export function clickerView(): string {
  if (localStorage.getItem("token_player2"))
  {
    return `
      <div class="flex flex-row items-center justify-center min-h-[60vh] gap-16">
        <!-- Joueur 1 -->
        <div class="flex flex-col items-center bg-gray-900/30 p-6 rounded-xl shadow-lg">
          <div class="flex flex-col items-center mb-4">
            <div class="w-8 h-64 bg-gray-800 rounded-lg flex items-end overflow-hidden border-2 border-cyan-400">
              <div id="heat-bar-1" class="w-full bg-red-500 transition-all duration-300" style="height: 0%"></div>
            </div>
            <span class="mt-2 text-cyan-300 font-bold">Chaleur</span>
            <span id="heat-value-1" class="text-lg font-extrabold text-red-400">0</span>
          </div>
          <div class="relative flex items-center">
            <img src="/Clicker/Reactor.jpg" alt="Cible" class="w-64 h-64 object-contain rounded-xl shadow-lg" />
            <button
              id="click-btn-1"
              class="ml-4 bg-cyan-600 hover:bg-cyan-400 text-white px-6 py-2 rounded-full shadow-lg transition"
            >
              Clique !
            </button>
            <div class="ml-8 flex flex-col items-center">
              <span class="text-lg text-cyan-300 font-bold">Points</span>
              <span id="point-count-1" class="text-3xl font-extrabold mt-2">0</span>
            </div>
          </div>
          <div class="flex gap-6 mt-10">
            <div class="flex flex-col items-center">
              <button class="bg-amber-500 hover:bg-amber-400 text-white px-5 py-2 rounded-lg shadow transition" id="buy-cooler-1">
                Acheter refroidisseur
              </button>
              <span id="cooler-count-1" class="mt-2 text-2xl font-bold text-amber-400">0</span>
            </div>
            <div class="flex flex-col items-center">
              <button class="bg-lime-600 hover:bg-lime-500 text-white px-5 py-2 rounded-lg shadow transition" id="buy-generator-1">
                Acheter generateur
              </button>
              <span id="generator-count-1" class="mt-2 text-2xl font-bold text-lime-400">0</span>
            </div>
            <div class="flex flex-col items-center">
              <button class="bg-fuchsia-600 hover:bg-fuchsia-500 text-white px-5 py-2 rounded-lg shadow transition" id="buy-coil-1">
                Acheter bobines
              </button>
              <span id="coil-count-1" class="mt-2 text-2xl font-bold text-fuchsia-400">0</span>
            </div>
          </div>
        </div>
        <!-- Joueur 2 -->
        <div class="flex flex-col items-center bg-gray-900/30 p-6 rounded-xl shadow-lg">
          <div class="flex flex-col items-center mb-4">
            <div class="w-8 h-64 bg-gray-800 rounded-lg flex items-end overflow-hidden border-2 border-cyan-400">
              <div id="heat-bar-2" class="w-full bg-red-500 transition-all duration-300" style="height: 0%"></div>
            </div>
            <span class="mt-2 text-cyan-300 font-bold">Chaleur</span>
            <span id="heat-value-2" class="text-lg font-extrabold text-red-400">0</span>
          </div>
          <div class="relative flex items-center">
            <img src="/Clicker/Reactor.jpg" alt="Cible" class="w-64 h-64 object-contain rounded-xl shadow-lg" />
            <button
              id="click-btn-2"
              class="ml-4 bg-cyan-600 hover:bg-cyan-400 text-white px-6 py-2 rounded-full shadow-lg transition"
            >
              Clique !
            </button>
            <div class="ml-8 flex flex-col items-center">
              <span class="text-lg text-cyan-300 font-bold">Points</span>
              <span id="point-count-2" class="text-3xl font-extrabold mt-2">0</span>
            </div>
          </div>
          <div class="flex gap-6 mt-10">
            <div class="flex flex-col items-center">
              <button class="bg-amber-500 hover:bg-amber-400 text-white px-5 py-2 rounded-lg shadow transition" id="buy-cooler-2">
                Acheter refroidisseur
              </button>
              <span id="cooler-count-2" class="mt-2 text-2xl font-bold text-amber-400">0</span>
            </div>
            <div class="flex flex-col items-center">
              <button class="bg-lime-600 hover:bg-lime-500 text-white px-5 py-2 rounded-lg shadow transition" id="buy-generator-2">
                Acheter generateur
              </button>
              <span id="generator-count-2" class="mt-2 text-2xl font-bold text-lime-400">0</span>
            </div>
            <div class="flex flex-col items-center">
              <button class="bg-fuchsia-600 hover:bg-fuchsia-500 text-white px-5 py-2 rounded-lg shadow transition" id="buy-coil-2">
                Acheter bobines
              </button>
              <span id="coil-count-2" class="mt-2 text-2xl font-bold text-fuchsia-400">0</span>
            </div>
          </div>
        </div>
        <!-- Bouton Quitter -->
        <button
          id="quit-versus-btn"
          class="fixed top-4 right-4 bg-gray-700 hover:bg-gray-500 text-white px-4 py-2 rounded shadow-lg z-50"
        >
          Quitter
        </button>
      </div>
    `;
  }
  else
  {
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
}

export function clickerEvent(): void {

//#region mode solo

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
  if (localStorage.getItem("overheated") === null) {
  localStorage.setItem("overheated", "false");
  }
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

  // Gestion de la chaleur
  setInterval(() => {

    // Refroidissement du réacteur
    if (Number(localStorage.getItem("heat")) > 0) 
    {
      let cooling = Math.round((2 + Number(coolerCount!.textContent)) - (Number(generatorCount!.textContent) * 0.5));
      if (cooling < 0) cooling = 0;
      heat = Math.max(0, Number(localStorage.getItem("heat")) - cooling);
      localStorage.setItem("heat", heat.toString());
      updateHeatBar();
    }

    // Vérification de la fin de surchauffe
    if ((clickBtn as HTMLButtonElement).disabled == true && Number(localStorage.getItem("heat")) <= 5)
    {
      (clickBtn as HTMLButtonElement).disabled = false;
      localStorage.setItem("overheated", "false");
      clickBtn!.classList.remove("opacity-50", "cursor-not-allowed");
      clickBtn!.textContent = "Clique !";
    }
  }, 500);

  // Production d'energie des generateurs secondaires
  setInterval(() => {
    if (localStorage.getItem("overheated") == "false")
    {
      const token = localStorage.getItem("token");

      if (token) {
      fetch("/api/clicker/generator", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
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
    }
  }, 1000);

  // Bouton principal (incrément du score)
  if (clickBtn && pointCount) {
    clickBtn.addEventListener("click", () => {
      
      // Incrémenter la temperature du réacteur
      let heating = 5 + Number(coilCount!.textContent) - Math.round((Number(coolerCount!.textContent) * 0.5));
      if (heating < 0) heating = 0;
      heat = Math.min(maxHeat, Number(localStorage.getItem("heat")) + heating);
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

//#endregion

//#region mode versus

// Bouton "Mode Versus"
  if (versusBtn){
  versusBtn.addEventListener("click", () => {
  
    // Page de connection pour le second joueur
    navigateTo(`/loginUser2?redirect=${encodeURIComponent(window.location.pathname)}`);
  
    // Initialisation des variables pour le versus
    ["1", "2"].forEach((n) => {
    if (localStorage.getItem(`vs_${n}score`) === null) localStorage.setItem(`vs_${n}score`, "0");
    if (localStorage.getItem(`vs_${n}heat`) === null) localStorage.setItem(`vs_${n}heat`, "0");
    if (localStorage.getItem(`vs_${n}cooler`) === null) localStorage.setItem(`vs_${n}cooler`, "0");
    if (localStorage.getItem(`vs_${n}generator`) === null) localStorage.setItem(`vs_${n}generator`, "0");
    if (localStorage.getItem(`vs_${n}coil`) === null) localStorage.setItem(`vs_${n}coil`, "0");
    if (localStorage.getItem(`vs_${n}overheated`) === null) localStorage.setItem(`vs_${n}overheated`, "false");
    });
  });
  }
  
  if (localStorage.getItem("token_player2")) {

  // Crée et initialiser le timer versus
  let timerDiv = document.getElementById("versus-timer");
  if (!timerDiv) {
    timerDiv = document.createElement("div");
    timerDiv.id = "versus-timer";
    timerDiv.className = "fixed top-4 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded shadow-lg z-50 text-xl";
    document.body.appendChild(timerDiv);
  }
  let timeLeft = 60; // secondes
  timerDiv.textContent = `Temps restant : ${timeLeft}s`;

  const quitBtn = document.getElementById("quit-versus-btn");

  // Decrementer le timer
  const versusTimer = setInterval(() => {
    timeLeft--;
    timerDiv!.textContent = `Temps restant : ${timeLeft}s`;
    // Fin de la partie versus
    if (timeLeft <= 0) {
      clearInterval(versusTimer);
      localStorage.removeItem("token_player2");

      const score1 = localStorage.getItem("vs_1score") || "0";
      const score2 = localStorage.getItem("vs_2score") || "0";
      // Nettoyage des donnees versus
      ["1", "2"].forEach((n) => {
      localStorage.removeItem(`vs_${n}score`);
      localStorage.removeItem(`vs_${n}heat`);
      localStorage.removeItem(`vs_${n}cooler`);
      localStorage.removeItem(`vs_${n}generator`);
      localStorage.removeItem(`vs_${n}coil`);
      localStorage.removeItem(`vs_${n}overheated`);
      });

      timerDiv!.textContent = "Fin de la partie !";
      setTimeout(() => {
        timerDiv!.remove();
        navigateTo("/");
      }, 2000);
    }
  }, 1000);

  // Decrement chaleur et generateurs auxiliaires
  setInterval(() => {
  ["1", "2"].forEach((n) => {
    // Refroidissement du réacteur pour chaque joueur
    let heat = Number(localStorage.getItem(`vs_${n}heat`)) || 0;
    if (heat > 0) {
      let cooling = Math.round((2 + Number(localStorage.getItem(`vs_${n}cooler`))) - Number(localStorage.getItem(`vs_${n}generator`)) * 0.5);
      if (cooling < 0) cooling = 0;
      heat = Math.max(0, heat - cooling);
      localStorage.setItem(`vs_${n}heat`, heat.toString());
    }

    // Mise à jour de la jauge et de la valeur affichée
    const heatBar = document.getElementById(`heat-bar-${n}`);
    const heatValue = document.getElementById(`heat-value-${n}`);
    const maxHeat = 100;
    const percent = Math.max(0, Math.min(100, (heat / maxHeat) * 100));
    if (heatBar) {
      heatBar.style.height = percent + "%";
      heatBar.className = "w-full transition-all duration-300 " +
        (percent > 80 ? "bg-red-700" : percent > 50 ? "bg-orange-400" : "bg-green-400");
    }
    if (heatValue) heatValue.textContent = heat.toString();

    // Vérification de la fin de surchauffe
    const clickBtn = document.getElementById(`click-btn-${n}`) as HTMLButtonElement;
    if (clickBtn && localStorage.getItem(`vs_${n}overheated`) === "true" && heat <= 5) {
      clickBtn.disabled = false;
      localStorage.setItem(`vs_${n}overheated`, "false");
      clickBtn.classList.remove("opacity-50", "cursor-not-allowed");
      clickBtn.textContent = "Clique !";
    }

    // Activation des generateurs secondaires
    if (localStorage.getItem(`vs_${n}overheated`) === "false") {
      let score = Number(localStorage.getItem(`vs_${n}score`)) + Number(localStorage.getItem(`vs_${n}generator`));
      localStorage.setItem(`vs_${n}score`, score.toString());
      const pointCount = document.getElementById(`point-count-${n}`);
      pointCount!.textContent = score.toString();
    }
  });
  }, 1000);

  // Bouton click
  ["1", "2"].forEach((n) => {
  const clickBtn = document.getElementById(`click-btn-${n}`) as HTMLButtonElement;
  const pointCount = document.getElementById(`point-count-${n}`);
    if (clickBtn) {
      clickBtn.addEventListener("click", () => {
        
      // Incrémenter la temperature du réacteur
      let heating = 5 + Number(localStorage.getItem(`vs_${n}coil`)) - Math.round((Number(localStorage.getItem(`vs_${n}cooler`)) * 0.5));
      if (heating < 0) heating = 0;
      heat = Math.min(maxHeat, Number(localStorage.getItem(`vs_${n}heat`)) + heating);
      localStorage.setItem("heat", heat.toString());

      // Tester et appliquer la surchauffe
      if (Number(localStorage.getItem(`vs_${n}heat`)) >= maxHeat)
      {
        (clickBtn as HTMLButtonElement).disabled = true;
        localStorage.setItem(`vs_${n}overheated`, "true");
        clickBtn.classList.add("opacity-50", "cursor-not-allowed");
        clickBtn.textContent = "Surchauffe !";

        const scoreStr = localStorage.getItem(`vs_${n}score`);
        const scoreBigInt = scoreStr ? BigInt(scoreStr) : BigInt(0);
        let currentScore = scoreBigInt * BigInt(75) / BigInt(100);
        localStorage.setItem(`vs_${n}score`, currentScore.toString());
        pointCount!.textContent = currentScore.toString();
        return;
      }

      // Incrémenter le score
        const scoreStr = localStorage.getItem(`vs_${n}score`);
        const scoreBigInt = scoreStr ? BigInt(scoreStr) : BigInt(0);
        let currentScore = scoreBigInt + BigInt(1) + BigInt(Number(localStorage.getItem(`vs_${n}coil`)));
        localStorage.setItem(`vs_${n}score`, currentScore.toString());
        pointCount!.textContent = currentScore.toString();
      });
    }
  });

  // Boutons d'achats
  ["1", "2"].forEach((n) => {
  // Acheter refroidisseur
  const pointCount = document.getElementById(`point-count-${n}`);
  const buyCoolerBtn = document.getElementById(`buy-cooler-${n}`);
  const coolerCount = document.getElementById(`cooler-count-${n}`);
  if (buyCoolerBtn && coolerCount) {
    buyCoolerBtn.addEventListener("click", () => {

      // Calculer le coût du cooler en fonction de son niveau
      let cooler_cost;
      if (Number(localStorage.getItem(`vs_${n}cooler`)) == 0)
        cooler_cost = 50;
      else
        cooler_cost = Math.round(50 * Math.pow(1.15, Number(localStorage.getItem(`vs_${n}cooler`))));

      if (Number(localStorage.getItem(`vs_${n}score`)) >= cooler_cost)
      {
          let cooler = Number(localStorage.getItem(`vs_${n}cooler`)) + 1;
          let score = Number(localStorage.getItem(`vs_${n}score`)) - cooler_cost;
          localStorage.setItem(`vs_${n}cooler`, cooler.toString());
          localStorage.setItem(`vs_${n}score`, score.toString());
          coolerCount.textContent = cooler.toString();
          pointCount!.textContent = score.toString();
      }
    });
  }

  // Acheter générateur
  const buyGeneratorBtn = document.getElementById(`buy-generator-${n}`);
  const generatorCount = document.getElementById(`generator-count-${n}`);
  if (buyGeneratorBtn && generatorCount) {
    buyGeneratorBtn.addEventListener("click", () => {

      // Calculer le coût du generator en fonction de son niveau
      let generator_cost;
      if (Number(localStorage.getItem(`vs_${n}generator`)) == 0)
        generator_cost = 150;
      else
        generator_cost = Math.round(150 * Math.pow(1.25, Number(localStorage.getItem(`vs_${n}generator`))));

      if (Number(localStorage.getItem(`vs_${n}score`)) >= generator_cost)
      {
          let generator = Number(localStorage.getItem(`vs_${n}generator`)) + 1;
          let score = Number(localStorage.getItem(`vs_${n}score`)) - generator_cost;
          localStorage.setItem(`vs_${n}generator`, generator.toString());
          localStorage.setItem(`vs_${n}score`, score.toString());
          generatorCount.textContent = generator.toString();
          pointCount!.textContent = score.toString();
      }
    });
  }

  // Acheter bobine
  const buyCoilBtn = document.getElementById(`buy-coil-${n}`);
  const coilCount = document.getElementById(`coil-count-${n}`);
  if (buyCoilBtn && coilCount) {
    buyCoilBtn.addEventListener("click", () => {

      // Calculer le coût du coil en fonction de son niveau
      let coil_cost;
      if (Number(localStorage.getItem(`vs_${n}coil`)) == 0)
        coil_cost = 75;
      else
        coil_cost = Math.round(75 * Math.pow(1.15, Number(localStorage.getItem(`vs_${n}coil`))));

      if (Number(localStorage.getItem(`vs_${n}score`)) > coil_cost)
      {
          let coil = Number(localStorage.getItem(`vs_${n}coil`)) + 1;
          let score = Number(localStorage.getItem(`vs_${n}score`)) - Number(localStorage.getItem(`vs_${n}coil`));
          localStorage.setItem(`vs_${n}coil`, coil.toString());
          localStorage.setItem(`vs_${n}score`, score.toString());
          coilCount.textContent = coil.toString();
          pointCount!.textContent = score.toString();
      }
    });
  }
  });

  // Bouton Quitter
  quitBtn!.addEventListener("click", () => {
    // Nettoyage des donnees versus
    localStorage.removeItem("token_player2");
  ["1", "2"].forEach((n) => {
    localStorage.removeItem(`vs_${n}score`);
    localStorage.removeItem(`vs_${n}heat`);
    localStorage.removeItem(`vs_${n}cooler`);
    localStorage.removeItem(`vs_${n}generator`);
    localStorage.removeItem(`vs_${n}coil`);
    localStorage.removeItem(`vs_${n}overheated`);
    });
  });

}
//#endregion

}
