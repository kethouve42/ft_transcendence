const http = require('http');

const [,, method, route, bodyArg] = process.argv;

if (!method || !route) {
  console.error("❌ Usage: node api-tester.js [get|post|put|patch|delete] /route [json_body]");
  process.exit(1);
}

const methodUpper = method.toUpperCase();

const options = {
  hostname: 'localhost',
  port: 3000, // adapte si besoin
  path: route,
  method: methodUpper,
  headers: {}
};

let body = null;

// Si on a un corps fourni, on le parse pour vérifier et on ajoute le header
if (bodyArg) {
  try {
    body = JSON.stringify(JSON.parse(bodyArg));
    options.headers['Content-Type'] = 'application/json';
  } catch {
    console.error("❌ Format JSON invalide pour le corps !");
    process.exit(1);
  }
}

// Création de la requête
const req = http.request(options, res => {
  let data = '';
  res.on('data', chunk => { data += chunk; });
  res.on('end', () => {
    console.log(`✅ [${res.statusCode}] Réponse :`);
    try {
      console.log(JSON.parse(data));
    } catch {
      console.log(data);
    }
  });
});

req.on('error', error => {
  console.error('❌ Erreur de requête :', error.message);
});

// Si on a un corps, on l'envoie dans la requête
if (body) {
  req.write(body);
}

req.end();
