
# Bienvenue dans la doc des outils pour explorer la SAINTE DATABASES 🙏

Tout d'abord, assurez vous d'avoir *nodejs* installe. Si ce n'est pas le cas, bah gg d'avoir tenu sans jusque la (node_module est contenu dans le gitignore du backend)

Les differents tools peuvent etre appeles directement depuis le fichier tools de la facon suivante :

---
## **DISPLAY** : pour visualiser le SAINT CONTENU 🔍
Affichez le contenu de la database, avec ses differentes tables et elements

```node display.js ``` <= affiche toute les tables de la db

```node display.js 'table'``` <= affiche uniquement la table en question

```node display.js 'table' 'colonne=valeur'``` <= affiche uniquement les elemnts de la table avec les elements correspondants. (exemple : ```node display.js user login=antoine```)

---
## **INIT** : pour PURIFIER la DATA 🔥
Reinitialisez la database, avec un contenu vide ou preremplis

```node init.js``` <= detruit la database et en cree une toute neuve (et toute vide)

```node init.js --seed``` <= pareil, mais initialise des donnees par defaut

---
## **TESTER** : pour COMMUNIER avec la DATABASE 📞 _(en faisant des requetes http)_
Utilisez ```node tester.js 'votre_commande'``` pour communiquer avec la database. Voici plusieurs exemples des routes existantes :

```node tester.js GET /api/users/``` <= Retourne tout les users

```node tester.js GET /api/users/1``` <= Retourne le user 1

```node tester.js GET /api/users/by-login/antoine``` <= Retourne le user 'antoine'

```node tester.js POST /api/users '{"login":"tken66","email":"tken66@example.com","password":"securepassword","alias":"ken","avatar":"url-to-avatar""log_data":"2025-05-15T15:00:00"}'``` <= Ajoute un user

```node tester.js DELETE /api/users/2``` <= Supprime le user 2

```node tester.js PUT /api/users/1 '{"login":"antoine","email":"antoine@42.fr","password":"pass1","alias":"KaGnOuS_lE_Bg_dU_66""avatar":"url-to-avatar","log_data":"cf ELK"}'``` <= Met a jour le user 1 avec de nouvelles donnees

```node tester.js POST /api/users/auth '{"identifier":"antoine","password":"pass1"}'``` <= Confirme si un user existe bien

```node tester.js PATCH /api/users/2/password '{"newPassword":"ultraNewPassword"}'```  //<== Bientot obsolete
    
---
Soyez pas con. Si vous etes a la racine, c'est ```node backend/tools/'nom_du_script.js'```
