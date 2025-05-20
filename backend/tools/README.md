Bienvenue dans la doc des outils pour explorer la SAINTE DATABASES 🙏

Tout d'abord, assurez vous d'avoir nodejs installe. Si ce n'est pa sle cas, bah gg d'avoir tenu sans jusque la (node_module est contenu dans le gitignore du backend)

Les differents tools peuvent etre appeles directement depuis le fichier tools de la facon suivante :

DISPLAY : pour visualiser le SAINT CONTENU 🔍
node display.js <= affiche toute les tables de la db
node display.js 'table' <= affiche uniquement la table en question (node backend/tools/display.js user login=antoine)
node display.js 'table' 'colonne=valeur' <= affiche uniquement les users avec le login antoine. Fonctionne pour toute les tables et tout les paametres. Les parametres sont cumulables (node backend/tools/display.js user)

INIT : pour PURIFIER la DATA 🔥
node init.js <= detruit la database et en cree une toute neuve (et toute vide)
node init.js --seed <= pareil, mais initialise des donnees par defaut

TESTER : pour COMMUNIER avec la DATABASE 📞 (en faisant des requetes http)
node tester.js 'votre commande' <= envoie une requete a la db
Exemples :
    node tester.js GET /api/users/
    node tester.js GET /api/users/1
    node tester.js GET /api/users/by-login/antoine
    node tester.js POST /api/users '{"login":"tken66","email":"tken66@example.com","password":"securepassword","alias":"ken","avatar":"url-to-avatar","log_data":"2025-05-15T15:00:00"}'
    node tester.js DELETE /api/users/2
    node tester.js PUT /api/users/1 '{"login":"antoine","email":"antoine@42.fr","password":"pass1","alias":"KaGnOuS_lE_Bg_dU_66","avatar":"url-to-avatar","log_data":"cf ELK"}'
    node backend/tools/tester.js patch /api/users/2/password '{"newPassword":"ultraNewPassword"}'  <== Bientot obsolete

Soyez pas con. Si vous etes a la racine, c'est node backend/tools/'nom du script.js'