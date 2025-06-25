#!/bin/bash

echo "⏳ Démarrage de Kibana..."
/usr/share/kibana/bin/kibana &

KIBANA_PID=$!

# Attente du démarrage complet de Kibana
echo "⌛ En attente que Kibana soit complètement prêt..."
until curl -s -o /dev/null -w "%{http_code}" http://localhost:5601/api/saved_objects/_find?type=dashboard | grep -q "200"; do
  sleep 2
done

echo "✅ Kibana est prêt, import du dashboard..."

if [ -f /usr/share/kibana/dashboard.ndjson ]; then
  curl -s -X POST "http://localhost:5601/api/saved_objects/_import?overwrite=true" \
    -H "kbn-xsrf: true" \
    --form file=@/usr/share/kibana/dashboard.ndjson
  echo "🔥 Dashboard importé"
else
  echo "⚠️ Fichier dashboard.ndjson introuvable"
fi

# Fin du script : attendre Kibana
wait $KIBANA_PID
