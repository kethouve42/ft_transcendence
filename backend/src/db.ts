import Database from 'better-sqlite3';

// Ouvre ou crée la base de données
const db = new Database('/app/data/db.sqlite');

// Active les foreign keys
db.pragma('foreign_keys = ON');

/*A rajouter dans users pour les vrai mail*/
//email_verified INTEGER DEFAULT 0,
//email_verify_token TEXT,
//email_verify_expires INTEGER

// Crée les tables
db.exec(`

-- Table des utilisateurs
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
  reset_expires INTEGER
  );

-- Table des relations d'amitié
CREATE TABLE IF NOT EXISTS friends (
  user_id INTEGER NOT NULL,
  friend_id INTEGER NOT NULL,
  PRIMARY KEY (user_id, friend_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (friend_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS matchs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,
  duration INTEGER,
  user1_id INTEGER NOT NULL,
  user2_id INTEGER,
  winner_id INTEGER,
  score TEXT,
  FOREIGN KEY (user1_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (user2_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (winner_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS clicker_matchs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,
  user1_id INTEGER NOT NULL,
  user2_id INTEGER NOT NULL,
  user1_score INTEGER NOT NULL,
  user2_score INTEGER NOT NULL,
  winner_id INTEGER NOT NULL,
  game_mode TEXT NOT NULL,
  target INTEGER NOT NULL,
  FOREIGN KEY (user1_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (user2_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (winner_id) REFERENCES users(id) ON DELETE SET NULL
);

`);

console.log("✅ Toutes les tables ont été créées ou existaient déjà.");

// Prépare une insertion d'exemple
const insert = db.prepare(`
  INSERT INTO users (login, password, alias, email)
  VALUES (?, ?, ?, ?)
`);

try {
  const result = insert.run('antoine42', 'hashed_password123', 'Kagnous', 'antoine@42.fr');
  console.log(`Utilisateur inséré avec ID ${result.lastInsertRowid}`);
} catch (err: any) {
  if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
    console.warn('⚠️ Conflit de clé unique : login ou email déjà utilisé.');
  } else {
    console.error('❌ Erreur d’insertion :', err.message);
  }
}

// Affiche tous les utilisateurs
const users = db.prepare(`SELECT * FROM users`).all();
console.log("Table USERS :");
console.table(users);

export default db;
