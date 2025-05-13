import Database from 'better-sqlite3';

// Ouvre ou crée le fichier de base de données
const db = new Database('/app/data/db.sqlite');

// Crée la table "users" si elle n'existe pas
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL
  );
`);

console.log("✅ Table 'users' créée ou déjà existante.");

// Prépare une requête d'insertion
const insert = db.prepare(`
  INSERT INTO users (username, email)
  VALUES (?, ?)
`);

try {
  const result = insert.run('Antoine', 'antoine@42.fr');
  console.log(`✅ Utilisateur inséré avec ID ${result.lastInsertRowid}`);
} catch (err: any) {
  if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
    console.warn('⚠️ Email déjà utilisé, utilisateur non inséré.');
  } else {
    console.error('❌ Erreur d’insertion :', err.message);
  }
}

// Lecture de tous les utilisateurs
const users = db.prepare(`SELECT * FROM users`).all();
console.log("📋 Contenu de la table 'users' :");
console.table(users);

// Fermer la base (optionnel ici, car process se termine)
//db.close();

export default db;

