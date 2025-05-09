const sqlite3 = require('sqlite3').verbose();

// Ouvre (ou crée) une base de données
const db = new sqlite3.Database('database.sqlite');

// Crée une table "users"
db.serialize(() => {
  // Lit tous les utilisateurs
  db.all(`SELECT * FROM users`, (err, rows) => {
    if (err) throw err;
    console.log("Contenu de la table 'users' :");
    console.table(rows);
  });

  db.all(`SELECT * FROM game`, (err, rows) => {
    if (err) throw err;
    console.log("Contenu de la table 'game' :");
    console.table(rows);
  });
});

// Ferme la DB après les opérations
db.close();
