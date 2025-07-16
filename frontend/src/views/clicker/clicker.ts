import { navigateTo } from "../../main";
import { t } from "../../i18n/index.js"

let versusTimer: ReturnType<typeof setInterval> | null = null;
let versusCoolingTimer: ReturnType<typeof setInterval> | null = null;
let versusGeneratorTimer: ReturnType<typeof setInterval> | null = null;

// Purge les intrvalles précédents
function clearAllVersusIntervals()
  {
    if (versusTimer) clearInterval(versusTimer);
    if (versusCoolingTimer) clearInterval(versusCoolingTimer);
    if (versusGeneratorTimer) clearInterval(versusGeneratorTimer);
    versusTimer = null;
    versusCoolingTimer = null;
    versusGeneratorTimer = null;
}

export function clickerView(): string {

  const topRightButtons = `
    <div class="w-full flex flex-row justify-end items-center gap-4 mb-4 pr-8 pt-4">
      ${localStorage.getItem("token_player2")
        ? `<button id="quit-versus-btn" class="bg-gray-700 hover:bg-gray-500 text-white px-4 py-2 rounded shadow-lg">
            ${t("click.exit")}
          </button>`
        : `<button id="versus-btn" class="bg-pink-600 hover:bg-pink-400 text-white px-4 py-2 rounded shadow-lg">
            ${t("click.versus")}
          </button>`
      }
    </div>
  `;
  if (localStorage.getItem("token_player2"))
  {
    return `
      ${topRightButtons}
      <div class="w-full flex flex-row justify-center">
        <div id="versus-timer" class="bg-gray-800 text-white px-6 py-2 rounded shadow-lg text-xl my-4">
          ${t("click.time")} 60s
        </div>
      </div>
      <div class="flex flex-row items-center justify-center min-h-[60vh] gap-16">
        <!-- Joueur 1 -->
        <div class="flex flex-col items-center bg-gray-900/30 p-6 rounded-xl shadow-lg">
          <div class="flex flex-col items-center mb-4">
            <div class="w-8 h-64 bg-gray-800 rounded-lg flex items-end overflow-hidden border-2 border-cyan-400">
              <div id="heat-bar-1" class="w-full bg-red-500 transition-all duration-300" style="height: 0%"></div>
            </div>
            <span class="mt-2 text-cyan-300 font-bold">${t("click.hot")}</span>
            <span id="heat-value-1" class="text-lg font-extrabold text-red-400">0</span>
          </div>
          <div class="relative flex items-center">
            <img src="/Clicker/Reactor.jpg" alt="Cible" class="w-64 h-64 object-contain rounded-xl shadow-lg" />
            <button
              id="click-btn-1"
              class="ml-4 bg-cyan-600 hover:bg-cyan-400 text-white px-6 py-2 rounded-full shadow-lg transition"
            >
              ${t("click.cl")}
            </button>
            <div class="ml-8 flex flex-col items-center">
              <span class="text-lg text-cyan-300 font-bold">${t("click.pt")}</span>
              <span id="point-count-1" class="text-3xl font-extrabold mt-2">0</span>
            </div>
          </div>
          <div class="flex gap-6 mt-10">
            <div class="flex flex-col items-center">
              <button class="bg-amber-500 hover:bg-amber-400 text-white px-5 py-2 rounded-lg shadow transition" id="buy-cooler-1">
                ${t("click.buy_re")} <span id="cost-cooler-1" class="ml-2 text-xs text-amber-200"></span>
              </button>
              <span id="cooler-count-1" class="mt-2 text-2xl font-bold text-amber-400">0</span>
            </div>
            <div class="flex flex-col items-center">
              <button class="bg-lime-600 hover:bg-lime-500 text-white px-5 py-2 rounded-lg shadow transition" id="buy-generator-1">
                ${t("click.buy_ge")} <span id="cost-generator-1" class="ml-2 text-xs text-lime-200"></span>
              </button>
              <span id="generator-count-1" class="mt-2 text-2xl font-bold text-lime-400">0</span>
            </div>
            <div class="flex flex-col items-center">
              <button class="bg-fuchsia-600 hover:bg-fuchsia-500 text-white px-5 py-2 rounded-lg shadow transition" id="buy-coil-1">
                ${t("click.buy_bob")} <span id="cost-coil-1" class="ml-2 text-xs text-fuchsia-200"></span>
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
            <span class="mt-2 text-cyan-300 font-bold">${t("click.hot")}</span>
            <span id="heat-value-2" class="text-lg font-extrabold text-red-400">0</span>
          </div>
          <div class="relative flex items-center">
            <img src="/Clicker/Reactor.jpg" alt="Cible" class="w-64 h-64 object-contain rounded-xl shadow-lg" />
            <button
              id="click-btn-2"
              class="ml-4 bg-cyan-600 hover:bg-cyan-400 text-white px-6 py-2 rounded-full shadow-lg transition"
            >
              ${t("click.cl")}
            </button>
            <div class="ml-8 flex flex-col items-center">
              <span class="text-lg text-cyan-300 font-bold">${t("click.pt")}</span>
              <span id="point-count-2" class="text-3xl font-extrabold mt-2">0</span>
            </div>
          </div>
          <div class="flex gap-6 mt-10">
            <div class="flex flex-col items-center">
              <button class="bg-amber-500 hover:bg-amber-400 text-white px-5 py-2 rounded-lg shadow transition" id="buy-cooler-2">
                ${t("click.buy_re")} <span id="cost-cooler-2" class="ml-2 text-xs text-amber-200"></span>
              </button>
              <span id="cooler-count-2" class="mt-2 text-2xl font-bold text-amber-400">0</span>
            </div>
            <div class="flex flex-col items-center">
              <button class="bg-lime-600 hover:bg-lime-500 text-white px-5 py-2 rounded-lg shadow transition" id="buy-generator-2">
                ${t("click.buy_ge")} <span id="cost-generator-2" class="ml-2 text-xs text-lime-200"></span>
              </button>
              <span id="generator-count-2" class="mt-2 text-2xl font-bold text-lime-400">0</span>
            </div>
            <div class="flex flex-col items-center">
              <button class="bg-fuchsia-600 hover:bg-fuchsia-500 text-white px-5 py-2 rounded-lg shadow transition" id="buy-coil-2">
                ${t("click.buy_bob")} <span id="cost-coil-2" class="ml-2 text-xs text-fuchsia-200"></span>
              </button>
              <span id="coil-count-2" class="mt-2 text-2xl font-bold text-fuchsia-400">0</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }
  else
  {
  return `
  ${topRightButtons}
    <div class="flex flex-row items-center justify-center min-h-[60vh]">
      <!-- Jauge de chaleur à gauche -->
      <div class="flex flex-col items-center mr-8">
        <div class="w-8 h-64 bg-gray-800 rounded-lg flex items-end overflow-hidden border-2 border-cyan-400">
          <div id="heat-bar" class="w-full bg-red-500 transition-all duration-300" style="height: 0%"></div>
        </div>
        <span class="mt-2 text-cyan-300 font-bold">${t("click.hot")}</span>
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
          ${t("click.cl")}
        </button>
        <!-- Compteur à droite de l'image -->
        <div class="ml-8 flex flex-col items-center">
          <span class="text-lg text-cyan-300 font-bold">${t("click.pt")}</span>
          <span id="point-count" class="text-3xl font-extrabold mt-2 min-w-[4ch] text-center">0</span>
        </div>
      </div>
      <!-- Boutons d'achat sous l'image -->
      <div class="flex gap-6 mt-10">
        <div class="flex flex-col items-center">
          <button class="bg-amber-500 hover:bg-amber-400 text-white px-5 py-2 rounded-lg shadow transition" id="buy-cooler">
            ${t("click.buy_re")} <span id="cost-cooler" class="ml-2 text-xs text-amber-200"></span>
          </button>
          <span id="cooler-count" class="mt-2 text-2xl font-bold text-amber-400">0</span>
          </div>
          <div class="flex flex-col items-center">
          <button class="bg-lime-600 hover:bg-lime-500 text-white px-5 py-2 rounded-lg shadow transition" id="buy-generator">
            ${t("click.buy_ge")} <span id="cost-generator" class="ml-2 text-xs text-lime-200"></span>
          </button>
          <span id="generator-count" class="mt-2 text-2xl font-bold text-lime-400">0</span>
        </div>
        <div class="flex flex-col items-center">
          <button class="bg-fuchsia-600 hover:bg-fuchsia-500 text-white px-5 py-2 rounded-lg shadow transition" id="buy-coil">
            ${t("click.buy_bob")} <span id="cost-coil" class="ml-2 text-xs text-fuchsia-200"></span>
          </button>
          <span id="coil-count" class="mt-2 text-2xl font-bold text-fuchsia-400">0</span>
          </div>
      </div>
    </div>
    `;
    }
}

export function clickerEvent(): void {

//#region mode solo

  // Initialisation de la chaleur et des variables
  let heat = 0;
  //let overheated = false;
  const maxHeat = 100;
  const versusBtn = document.getElementById("versus-btn");

  if (!localStorage.getItem("token_player2")) {

  // Elements de la page
  const heatBar = document.getElementById("heat-bar");
  const heatValue = document.getElementById("heat-value");
  const clickBtn = document.getElementById("click-btn");
  const pointCount = document.getElementById("point-count");
  const costCooler = document.getElementById("cost-cooler");
  const coolerCount = document.getElementById("cooler-count");
  const buyCoolerBtn = document.getElementById("buy-cooler");
  const costGenerator = document.getElementById("cost-generator");
  const generatorCount = document.getElementById("generator-count");
  const buyGeneratorBtn = document.getElementById("buy-generator");
  const costCoil = document.getElementById("cost-coil");
  const coilCount = document.getElementById("coil-count");
  const buyCoilBtn = document.getElementById("buy-coil");

  // Verification de l'etat de surchauffe
  if (localStorage.getItem("overheated") === null) {
  localStorage.setItem("overheated", "false");
  }
  if (localStorage.getItem("overheated") == "true")
  {
    (clickBtn as HTMLButtonElement).disabled = true;
    clickBtn!.classList.add("opacity-50", "cursor-not-allowed");
    clickBtn!.textContent = `${t("click.overh")}`;
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
    }
    updateHeatBar();

    // Vérification de la fin de surchauffe
    if (clickBtn)
    if ((clickBtn as HTMLButtonElement).disabled == true && Number(localStorage.getItem("heat")) <= 5)
    {
      (clickBtn as HTMLButtonElement).disabled = false;
      localStorage.setItem("overheated", "false");
      clickBtn!.classList.remove("opacity-50", "cursor-not-allowed");
      clickBtn!.textContent = `${t("click.cl")}`;
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
          //console.error("❌ Erreur :", err.message);
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
        clickBtn.textContent = `${t("click.overh")}`;

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
          let coolerLevel = Number(coolerCount!.textContent) || 0;
          let coolerCost = coolerLevel === 0 ? 50 : Math.round(50 * Math.pow(1.15, coolerLevel));
          if (costCooler) costCooler.textContent = `(${coolerCost})`;
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
          let generatorLevel = Number(generatorCount!.textContent) || 0;
          let generatorCost = generatorLevel === 0 ? 150 : Math.round(150 * Math.pow(1.25, generatorLevel));
          if (costGenerator) costGenerator.textContent = `(${generatorCost})`;
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
          let coilLevel = Number(coilCount!.textContent) || 0;
          let coilCost = coilLevel === 0 ? 75 : Math.round(75 * Math.pow(1.15, coilLevel));
          if (costCoil) costCoil.textContent = `(${coilCost})`;
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

        // Calcul initial des coûts
        let coolerLevel = Number(coolerCount!.textContent) || 0;
        let coolerCost = coolerLevel === 0 ? 50 : Math.round(50 * Math.pow(1.15, coolerLevel));
        if (costCooler) costCooler.textContent = `(${coolerCost})`;
        let generatorLevel = Number(generatorCount!.textContent) || 0;
        let generatorCost = generatorLevel === 0 ? 150 : Math.round(150 * Math.pow(1.25, generatorLevel));
        if (costGenerator) costGenerator.textContent = `(${generatorCost})`;
        let coilLevel = Number(coilCount!.textContent) || 0;
        let coilCost = coilLevel === 0 ? 75 : Math.round(75 * Math.pow(1.15, coilLevel));
        if (costCoil) costCoil.textContent = `(${coilCost})`;
    })
    .catch(err => {
      console.error("❌ Erreur :", err.message);
    });



  // Verification et purge mode versus
  if (!localStorage.getItem("token_player2"))
  {
      ["1", "2"].forEach((n) => {
      localStorage.removeItem(`vs_${n}score`);
      localStorage.removeItem(`vs_${n}heat`);
      localStorage.removeItem(`vs_${n}cooler`);
      localStorage.removeItem(`vs_${n}generator`);
      localStorage.removeItem(`vs_${n}coil`);
      localStorage.removeItem(`vs_${n}overheated`);
      });
  }

  }

//#endregion

//#region mode versus

// Bouton "Mode Versus"
  if (versusBtn){
  versusBtn.addEventListener("click", () => {
  
    // Page de connection pour le second joueur
    navigateTo(`/loginUser2?redirect=${encodeURIComponent(window.location.pathname)}`);
  });
  }
  
  if (localStorage.getItem("token_player2")) {

    clearAllVersusIntervals();

  // Initialisation des variables pour le versus
  const quitBtn = document.getElementById("quit-versus-btn");
  ["1", "2"].forEach((n) => {
  localStorage.setItem(`vs_${n}score`, "0");
  localStorage.setItem(`vs_${n}heat`, "0");
  localStorage.setItem(`vs_${n}cooler`, "0");
  localStorage.setItem(`vs_${n}generator`, "0");
  localStorage.setItem(`vs_${n}coil`, "0");
  localStorage.setItem(`vs_${n}overheated`, "false");
  });

  // Fonction pour mettre à jour dynamiquement les coûts pour chaque joueur
  function updateVersusCosts() {
    ["1", "2"].forEach((n) => {
      // Cooler
      let coolerLevel = Number(localStorage.getItem(`vs_${n}cooler`)) || 0;
      let coolerCost = coolerLevel === 0 ? 50 : Math.round(50 * Math.pow(1.15, coolerLevel));
      const costCooler = document.getElementById(`cost-cooler-${n}`);
      if (costCooler) costCooler.textContent = `(${coolerCost})`;

      // Generator
      let generatorLevel = Number(localStorage.getItem(`vs_${n}generator`)) || 0;
      let generatorCost = generatorLevel === 0 ? 150 : Math.round(150 * Math.pow(1.25, generatorLevel));
      const costGenerator = document.getElementById(`cost-generator-${n}`);
      if (costGenerator) costGenerator.textContent = `(${generatorCost})`;

      // Coil
      let coilLevel = Number(localStorage.getItem(`vs_${n}coil`)) || 0;
      let coilCost = coilLevel === 0 ? 75 : Math.round(75 * Math.pow(1.15, coilLevel));
      const costCoil = document.getElementById(`cost-coil-${n}`);
      if (costCoil) costCoil.textContent = `(${coilCost})`;
    });
  }
  updateVersusCosts();

  // Crée et initialiser le timer versus
  let timeLeft = 60;
  const timerDiv = document.getElementById("versus-timer");
  if (timerDiv) {
    timerDiv.textContent = `${t("click.time")} ${timeLeft}s`;
  }

  // Fonction pour mettre à jour les jauges visuellement
  function updateHeatBars() 
  {
    ["1", "2"].forEach((n) => {
      // Mise à jour de la jauge et de la valeur affichée
      const heatBar = document.getElementById(`heat-bar-${n}`);
      const heatValue = document.getElementById(`heat-value-${n}`);
      const maxHeat = 100;
      const percent = Math.max(0, Math.min(100, Number(localStorage.getItem(`vs_${n}heat`)) / maxHeat) * 100);
      if (heatBar) {
        heatBar.style.height = percent + "%";
        heatBar.className = "w-full transition-all duration-300 " +
          (percent > 80 ? "bg-red-700" : percent > 50 ? "bg-orange-400" : "bg-green-400");
      }
      if (heatValue) heatValue.textContent = localStorage.getItem(`vs_${n}heat`);
    });
  }

  // Decrementer le timer
  versusTimer = setInterval(() => {
    timeLeft--;
    if (timerDiv) timerDiv.textContent = `${t("click.time")} ${timeLeft}s`;
    // Fin de la partie versus
    if (timeLeft <= 0) {
      clearAllVersusIntervals();
      
      // Nettoyage des donnees versus
      ["1", "2"].forEach((n) => {
        localStorage.removeItem(`vs_${n}score`);
        localStorage.removeItem(`vs_${n}heat`);
        localStorage.removeItem(`vs_${n}cooler`);
        localStorage.removeItem(`vs_${n}generator`);
        localStorage.removeItem(`vs_${n}coil`);
        localStorage.removeItem(`vs_${n}overheated`);
      });
      
      if (timerDiv) timerDiv.textContent = `${t("click.end")}`;
      localStorage.removeItem("token_player2");
      localStorage.removeItem("userId_player2");
      setTimeout(() => {
        timerDiv!.remove();
      }, 2000);
      navigateTo("/clicker");
    }
  }, 1000);

  // Decrement chaleur
  versusCoolingTimer = setInterval(() => {
    ["1", "2"].forEach((n) => {
      // Refroidissement du réacteur pour chaque joueur
      let heat = Number(localStorage.getItem(`vs_${n}heat`)) || 0;
      if (heat > 0) {
        let cooling = Math.round((2 + Number(localStorage.getItem(`vs_${n}cooler`))) - Number(localStorage.getItem(`vs_${n}generator`)) * 0.5);
        if (cooling < 0) cooling = 0;
        heat = Math.max(0, heat - cooling);
        localStorage.setItem(`vs_${n}heat`, heat.toString());
      }
  
      updateHeatBars();
    
      // Vérification de la fin de surchauffe
      const clickBtn = document.getElementById(`click-btn-${n}`) as HTMLButtonElement;
      if (clickBtn && localStorage.getItem(`vs_${n}overheated`) === "true" && heat <= 5) {
        clickBtn.disabled = false;
        localStorage.setItem(`vs_${n}overheated`, "false");
        clickBtn.classList.remove("opacity-50", "cursor-not-allowed");
        clickBtn.textContent = `${t("click.cl")}`;
      }
    });
  }, 500);

  // Production des generateurs auxiliaires
  versusGeneratorTimer = setInterval(() => {
    ["1", "2"].forEach((n) => {
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
      localStorage.setItem(`vs_${n}heat`, heat.toString());

      updateHeatBars();

      // Tester et appliquer la surchauffe
      if (Number(localStorage.getItem(`vs_${n}heat`)) >= maxHeat)
      {
        (clickBtn as HTMLButtonElement).disabled = true;
        localStorage.setItem(`vs_${n}overheated`, "true");
        clickBtn.classList.add("opacity-50", "cursor-not-allowed");
        clickBtn.textContent = `${t("click.overh")}`;

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
          updateVersusCosts();
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
          updateVersusCosts();
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
          let score = Number(localStorage.getItem(`vs_${n}score`)) - coil_cost;
          localStorage.setItem(`vs_${n}coil`, coil.toString());
          localStorage.setItem(`vs_${n}score`, score.toString());
          coilCount.textContent = coil.toString();
          pointCount!.textContent = score.toString();
          updateVersusCosts();
      }
    });
  }
  });

  // Bouton Quitter
  quitBtn!.addEventListener("click", () => {
    // Nettoyage des donnees versus
    ["1", "2"].forEach((n) => {
      localStorage.removeItem(`vs_${n}score`);
      localStorage.removeItem(`vs_${n}heat`);
      localStorage.removeItem(`vs_${n}cooler`);
      localStorage.removeItem(`vs_${n}generator`);
      localStorage.removeItem(`vs_${n}coil`);
      localStorage.removeItem(`vs_${n}overheated`);
    });
    localStorage.removeItem("token_player2");
    localStorage.removeItem("userId_player2");
    clearAllVersusIntervals();
    if (timerDiv)
      timerDiv.remove();
    navigateTo("/clicker");
  });
}


//#endregion

}

// =================================== //
// ============= TO DO : ============= //
// =================================== //

// Gerer le fait de quitter le versus en pleine partie
// -Faire une route correcte et l'appeler a la fin du versus (voir avec Ken)
// -Faire un ecran de selection pour choisir la target (score ou duree modulaire ?) du versus (voir avec Thibault)