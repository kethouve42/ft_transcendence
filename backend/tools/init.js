const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

// Recherche de la database
const dbPath = path.resolve(__dirname, '../data/db.sqlite');

// Supprimer la base si elle existe
if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
  console.log('Base supprimée.');
}

const db = new sqlite3.Database(dbPath);
console.log('Nouvelle base créée.');

db.serialize(() => {
  // Créer la table des utilisateurs
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      login TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      alias TEXT,
      avatar TEXT,
      email TEXT UNIQUE NOT NULL,
      clicker_score BIGINT DEFAULT 0,
      clicker_cooler INTEGER NOT NULL DEFAULT 0,
      clicker_coil INTEGER NOT NULL DEFAULT 0,
      clicker_generator INTEGER NOT NULL DEFAULT 0,
      tfa_enabled BOOLEAN DEFAULT 0,
      tfa_code TEXT,
      tfa_expires INTEGER,
      last_seen INTEGER,
      reset_token TEXT,
      reset_expires INTEGER,
      email_verified INTEGER DEFAULT 0,
      email_verify_token TEXT,
      email_verify_expires INTEGER
    )
  `);

  // Table des amis
  db.run(`
    CREATE TABLE IF NOT EXISTS friends (
      user_id INTEGER NOT NULL,
      friend_id INTEGER NOT NULL,
      PRIMARY KEY (user_id, friend_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (friend_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Table des matchs
  db.run(`
    CREATE TABLE IF NOT EXISTS matchs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      duration INTEGER,
      user1_id INTEGER NOT NULL,
      user2_id INTEGER NOT NULL,
      winner_id INTEGER,
      score TEXT,
      FOREIGN KEY (user1_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (user2_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (winner_id) REFERENCES users(id) ON DELETE SET NULL
    )
  `);

  db.run(`
  CREATE TABLE IF NOT EXISTS clicker_matchs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      user1_id INTEGER NOT NULL,
      user2_id INTEGER NOT NULL,
      user1_score INTEGER NOT NULL,
      user2_score INTEGER NOT NULL,
      FOREIGN KEY (user1_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (user2_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
});

// Vérifie le mode
const shouldSeed = process.argv.includes('--seed');

if (shouldSeed) {
  db.serialize(() => {
    // Utilisateurs
    const users = [
      ['antoine', 'pass1', 'Kagnous', '/avatars/antoine.png', 'antoine@42.fr'],
      ['lea', 'pass2', 'Lea42', '/avatars/lea.png', 'lea@42.fr'],
      ['zack', 'pass3', 'Zack', '/avatars/zack.png', 'zack@42.fr'],
    ];

    const insertUser = db.prepare(`
      INSERT INTO users (login, password, alias, avatar, email)
      VALUES (?, ?, ?, ?, ?)
    `);
    users.forEach(u => insertUser.run(...u));
    insertUser.finalize();

    // Récupère les IDs
    db.all(`SELECT id, login FROM users`, (err, rows) => {
      if (err) throw err;

      const userMap = Object.fromEntries(rows.map(u => [u.login, u.id]));

      // Amis (Antoine <-> Lea, Zack <-> Antoine)
      const friends = [
        [userMap.antoine, userMap.lea],
        [userMap.lea, userMap.antoine],
        [userMap.zack, userMap.antoine],
        [userMap.antoine, userMap.zack],
      ];
      const insertFriend = db.prepare(`
        INSERT INTO friends (user_id, friend_id) VALUES (?, ?)
      `);
      friends.forEach(pair => insertFriend.run(...pair));
      insertFriend.finalize();

      // Matchs
      const matchs = [
        [new Date().toISOString(), 400, userMap.antoine, userMap.lea, userMap.antoine, '11-7'],
        [new Date().toISOString(), 350, userMap.zack, userMap.antoine, userMap.zack, '11-9'],
      ];
      const insertMatch = db.prepare(`
        INSERT INTO matchs (date, duration, user1_id, user2_id, winner_id, score)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      matchs.forEach(m => insertMatch.run(...m));
      insertMatch.finalize();

      console.log('Données factices insérées');
      db.close();
    });
  });
}
else 
{
  db.close();
}

