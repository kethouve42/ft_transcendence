const sqlite3 = require('sqlite3').verbose();

// Ouvre (ou crée) une base de données
const db = new sqlite3.Database('database.sqlite');

// Crée une table "users"
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL
  )`);

  // Insère un utilisateur
  db.run(`INSERT INTO users (username, email) VALUES (?, ?)`, ['Antoine', 'antoine@42.fr']);

  // Lit tous les utilisateurs
  db.all(`SELECT * FROM users`, (err, rows) => {
    if (err) throw err;
    console.log("Contenu de la table 'users' :");
    console.table(rows);
  });
});

// Ferme la DB après les opérations
db.close();
