#!/bin/bash

echo "⏳ Démarrage de Kibana..."

# Lancer Kibana en arrière-plan
/usr/share/kibana/bin/kibana &

# Sauver le PID pour plus tard
KIBANA_PID=$!

# Attendre que Kibana réponde sur le port 5601
until curl -s http://localhost:5601/api/status | grep -q "available"; do
  echo "⌛ En attente que Kibana soit prêt..."
  sleep 2
done

echo "✅ Kibana est prêt, import du dashboard..."

# Importer le dashboard si le fichier existe
if [ -f /usr/share/kibana/scripts/dashboard.ndjson ]; then
  curl -X POST "http://localhost:5601/api/saved_objects/_import?overwrite=true" \
    -H "kbn-xsrf: true" \
    --form file=@/usr/share/kibana/scripts/dashboard.ndjson
fi

# Attendre la fin du process Kibana
wait $KIBANA_PID
