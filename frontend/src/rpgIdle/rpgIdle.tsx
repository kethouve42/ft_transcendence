import React, { useEffect, useState } from 'react';

type Entity = {
  name: string;
  hp: number;
  maxHp: number;
  atk: number;
  speed: number; // en ms entre les attaques
};

const createEntity = (name: string, hp: number, atk: number, speed: number): Entity => ({
  name,
  hp,
  maxHp: hp,
  atk,
  speed,
});

const RpgIdle: React.FC = () => {
  const [hero, setHero] = useState<Entity>(() => createEntity('Héros', 100, 12, 1000));
  const [monster, setMonster] = useState<Entity>(() => createEntity('Monstre', 80, 8, 1500));
  const [log, setLog] = useState<string[]>([]);

  // Attaque auto du héros
  useEffect(() => {
    const interval = setInterval(() => {
      setMonster(prev => {
        const newHp = Math.max(0, prev.hp - hero.atk);
        setLog(l => [`${hero.name} attaque pour ${hero.atk} dégâts`, ...l]);
        return { ...prev, hp: newHp };
      });
    }, hero.speed);
    return () => clearInterval(interval);
  }, [hero]);

  // Attaque auto du monstre
  useEffect(() => {
    const interval = setInterval(() => {
      setHero(prev => {
        const newHp = Math.max(0, prev.hp - monster.atk);
        setLog(l => [`${monster.name} attaque pour ${monster.atk} dégâts`, ...l]);
        return { ...prev, hp: newHp };
      });
    }, monster.speed);
    return () => clearInterval(interval);
  }, [monster]);

  return (
  <div className="font-sans p-8">
    <h2 className="text-2xl font-bold mb-6">Combat Automatique</h2>
    <div className="flex gap-10 mb-6">
      {[hero, monster].map((entity, index) => (
        <div key={index} className="w-56">
          <h3 className="text-lg font-semibold mb-2">{entity.name}</h3>
          <div className="w-full bg-gray-300 h-5 rounded mb-1 overflow-hidden">
            <div
              className={`h-full transition-all duration-200 ${entity.name === 'Héros' ? 'bg-green-500' : 'bg-red-500'}`}
              style={{ width: `${(entity.hp / entity.maxHp) * 100}%` }}
            />
          </div>
          <p className="text-sm">{entity.hp} / {entity.maxHp} HP</p>
        </div>
      ))}
    </div>
    <hr className="my-4" />
    <div>
      <h4 className="font-semibold mb-2">Journal</h4>
      <div className="max-h-52 overflow-y-auto bg-gray-100 rounded p-2 text-sm space-y-1">
        {log.slice(0, 10).map((entry, i) => (
          <div key={i}>{entry}</div>
        ))}
      </div>
    </div>
  </div>
  );
};

export default RpgIdle;
