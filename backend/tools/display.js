const path = require('path');
const sqlite3 = require('sqlite3').verbose();

// Recherche de la database
const dbPath = path.resolve(__dirname, '../data/db.sqlite');
const db = new sqlite3.Database(dbPath, (err) =>
{
  if (err)
  {
	console.error("❌ Erreur d'ouverture de la base :", err.message);
	process.exit(1);
  }
});

// Récupère les arguments
const [ , , tableName, ...filters ] = process.argv;

// Affiche toutes les tables si aucun argument
if (!tableName) 
{
  db.all(`SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'`, (err, tables) => 
  {
	if (err) return console.error("❌ Erreur listing tables :", err.message);
	if (tables.length === 0) return console.log("Aucune table dans la base.");

	console.log("Tables disponibles :");
	tables.forEach(t => console.log(`- ${t.name}`));

	// Affiche toutes les données de chaque table
	console.log("\nContenu db :\n");
	let remaining = tables.length;
	tables.forEach(t =>
	{
	  db.all(`SELECT * FROM ${t.name}`, (err, rows) =>
	  {
		if (err) console.error(`❌ Erreur lecture '${t.name}' :`, err.message);
		else
		{
		  console.log(`🔹 ${t.name}:`);
		  console.table(rows);
		}
		if (--remaining === 0) db.close();
	  });
	});
	return;
  });
} else
{
  // Vérifie si la table existe
  db.get(`SELECT name FROM sqlite_master WHERE type='table' AND name = ?`, [tableName], (err, row) => {
	if (err) {
	  console.error("❌ Erreur vérif table :", err.message);
	  db.close();
	  return;
	}

	if (!row) {
	  console.warn(`❌ La table '${tableName}' n'existe pas.`);
	  db.close();
	  return;
	}

	// Génère la requête avec filtres éventuels
	let whereClause = "";
	const params = [];

	if (filters.length > 0) {
	  const conditions = filters.map(filter => {
		const [key, value] = filter.split('=');
		params.push(value);
		return `${key} = ?`;
	  });
	  whereClause = `WHERE ${conditions.join(' AND ')}`;
	}

	const query = `SELECT * FROM ${tableName} ${whereClause}`;
	
	db.all(query, params, (err, rows) =>
	{
	  if (err) console.error("❌ Erreur SELECT :", err.message);
	  else 
	  {
		//console.log(`Résultats de '${query}' avec paramètres`, params);
		if (rows.length === 0) // ✅ Ajout : cas sans résultats
		  console.log("Aucune concordance trouvée.");
		else
		  console.table(rows);
	  }
	  db.close();
	});
  });
}
