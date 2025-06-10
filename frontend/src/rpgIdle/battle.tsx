export type Entity = {
  name: string;
  hp: number;
  maxHp: number;
  atk: number;
  speed: number;
};

export type BattleState = {
  hero: Entity;
  monster: Entity;
  log: string[];
  isFighting: boolean;
};

// Création d'une entité (héros ou monstre)
function createEntity(name: string, hp: number, atk: number, speed: number): Entity {
  return { name, hp, maxHp: hp, atk, speed };
}

// Génération d'un monstre en fonction du niveau
function createRandomMonster(level: number): Entity {
  // Génère un monstre un peu plus fort à chaque combat
  return createEntity(
    `Monstre ${level}`,
    60 + level * 20,
    6 + level * 2,
    1200 - Math.min(800, level * 50)
  );
}

/**
 * Boucle principale de combat entre le héros et le monstre.
 * Gère l'alternance des attaques, la victoire, la défaite et la récompense.
 */
export function startBattle(
  hero: Entity,
  onUpdate: (state: BattleState) => void, // Callback pour mettre à jour l'état du combat
  onVictory: (state: BattleState, hero: Entity, level: number) => void, // Callback quand le héros gagne
  onGameOver: (finalState: BattleState) => void, // Callback quand le héros meurt
  level = 1)
{
  let currentHero = { ...hero };
  let monster = createRandomMonster(level);
  let log: string[] = [`Un ${monster.name} apparaît !`];
  let isFighting = true;

  // Boucle de combat : le héros et le monstre attaquent à tour de rôle
  function loop() {
    if (!isFighting) return;

    // --- Tour du héros ---
    setTimeout(() => {
      if (!isFighting)
            return;
      monster.hp = Math.max(0, monster.hp - currentHero.atk);
      log.unshift(`${currentHero.name} attaque pour ${currentHero.atk} dégâts`);
      onUpdate({ hero: { ...currentHero }, monster: { ...monster }, log: [...log], isFighting });

      // Si le monstre est vaincu, on déclenche la récompense
      if (monster.hp <= 0)
    {
        log.unshift(`${monster.name} est vaincu !`);
        isFighting = false;
        // Appel du callback de victoire pour afficher le choix de récompense
        onVictory({ hero: { ...currentHero }, monster: { ...monster }, log: [...log], isFighting: false }, currentHero, level);
        return;
      }

      // --- Tour du monstre ---
      setTimeout(() => {
        if (!isFighting)
            return;
        currentHero.hp = Math.max(0, currentHero.hp - monster.atk);
        log.unshift(`${monster.name} attaque pour ${monster.atk} dégâts`);
        onUpdate({ hero: { ...currentHero }, monster: { ...monster }, log: [...log], isFighting });

        // Si le héros meurt, on termine la partie
        if (currentHero.hp <= 0)
        {
          log.unshift(`${currentHero.name} est mort !`);
          isFighting = false;
          // Appel du callback de game over
          onGameOver({ hero: { ...currentHero }, monster: { ...monster }, log: [...log], isFighting: false });
          return;
        }

        // Sinon, on recommence la boucle de combat
        loop();
      }, monster.speed);
    }, currentHero.speed);
  }

  // Démarrage de la boucle de combat
  loop();
}