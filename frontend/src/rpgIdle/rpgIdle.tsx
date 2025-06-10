import { useEffect, useState } from 'react';
import type { BattleState, Entity } from './battle';
import { startBattle } from './battle';

// Définition de l'état initial du héros
const initialHero = {
  name: 'Héros',
  hp: 100,
  maxHp: 100,
  atk: 12,
  speed: 1000,
};

const RpgIdle: React.FC = () => {
  // État principal du combat (héros, monstre, log, statut)
  const [state, setState] = useState<BattleState>({
    hero: { ...initialHero },
    monster: { name: '', hp: 0, maxHp: 0, atk: 0, speed: 0 },
    log: [],
    isFighting: true,
  });

  // État pour gérer le choix de récompense entre deux combats
  const [pendingBonus, setPendingBonus] = useState<null | { hero: Entity; level: number }>(null);

  // Fonction pour lancer un combat contre un monstre d'un certain niveau
  const launchBattle = (hero: Entity, level: number = 1) => {
    startBattle(
      { ...hero },
    
      (s) => setState(s), // Mise à jour de l'état à chaque action
    
      (victoryState, updatedHero, nextLevel) => {
        setState(victoryState); // Affiche la victoire et stoppe le combat
        setPendingBonus({ hero: updatedHero, level: nextLevel + 1 }); // Propose le choix de récompense
      },

      (finalState) => setState(finalState), // Fin de partie si le héros meurt

      level
    );
  };

  // Démarrage automatique du premier combat au montage du composant
  useEffect(() => {
    launchBattle(initialHero, 1);
  }, []);

  // Gestion du choix de récompense (soin ou attaque)
  const handleBonus = (type: 'heal' | 'atk') => {
    if (!pendingBonus) return;
    let newHero = { ...pendingBonus.hero };
    if (type === 'heal') {
      newHero.hp = Math.min(newHero.maxHp, newHero.hp + 50);
    } else if (type === 'atk') {
      newHero.atk += 1;
    }
    setPendingBonus(null);
    launchBattle(newHero, pendingBonus.level); // Relance un nouveau combat avec le bonus choisi
  };

  // Affichage principal du jeu
  return (
    <div className="font-sans p-8 flex flex-col items-center min-h-screen bg-gradient-to-b from-blue-100 to-blue-300">
      <h2 className="text-2xl font-bold mb-6">Combat Automatique</h2>
      {/* Fenêtre de combat avec le héros et le monstre */}
      <div className="bg-white rounded-xl shadow-lg p-8 flex gap-16 mb-8">
        {[state.hero, state.monster].map((entity, index) => (
          <div key={index} className="w-56 flex flex-col items-center">
            <h3 className="text-lg font-semibold mb-2">{entity.name}</h3>
            {/* Barre de vie */}
            <div className="w-full bg-gray-300 h-5 rounded mb-1 overflow-hidden">
              <div
                className={`h-full transition-all duration-200 ${index === 0 ? 'bg-green-500' : 'bg-red-500'}`}
                style={{ width: `${entity.maxHp ? (entity.hp / entity.maxHp) * 100 : 0}%` }}
              />
            </div>
            <p className="text-sm mb-2">{entity.hp} / {entity.maxHp} HP</p>
            {/* Image du héros ou du monstre */}
            <img
              src={index === 0 ? '/RPGIdle/hero.png' : '/RPGIdle/monster.png'}
              alt={entity.name}
              className="w-24 h-24 object-contain rounded mb-2 border-2 border-gray-200 bg-white"
            />
          </div>
        ))}
      </div>
      {/* Zone du journal de combat et des choix de récompense */}
      <div className="w-full max-w-xl">
        <h4 className="font-semibold mb-2">Journal</h4>
        <div className="max-h-52 overflow-y-auto bg-gray-100 rounded p-2 text-sm space-y-1 shadow-inner">
          {state.log.slice(0, 10).map((entry, i) => (
            <div key={i}>{entry}</div>
          ))}
        </div>
        {/* Affichage de la mort du héros */}
        {!state.isFighting && !pendingBonus && (
          <div className="mt-4 text-center text-red-700 font-bold text-lg">Le héros est mort !</div>
        )}
        {/* Affichage du choix de récompense */}
        {pendingBonus && (
          <div className="mt-6 flex flex-col items-center gap-4">
            <div className="text-lg font-semibold text-blue-800">Choisis une récompense :</div>
            <div className="flex gap-6">
              <button
                className="px-4 py-2 bg-green-500 text-white rounded shadow hover:bg-green-600 transition"
                onClick={() => handleBonus('heal')}
              >
                Se soigner (+50 HP)
              </button>
              <button
                className="px-4 py-2 bg-orange-500 text-white rounded shadow hover:bg-orange-600 transition"
                onClick={() => handleBonus('atk')}
              >
                Augmenter l'attaque (+1 ATK)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RpgIdle;
