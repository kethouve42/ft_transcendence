## 🌐 Système de gestion multilingue

Notre site supporte plusieurs langues pour offrir une expérience accessible à un large public international.

### Fonctionnalités principales

- **3 langues supportées** : Français, Anglais, Espagnol
- **Sélecteur de langue** : Un menu déroulant permet à l’utilisateur de choisir sa langue préférée à tout moment.
- **Traduction dynamique** : Les menus, titres, boutons, messages et contenus essentiels sont traduits automatiquement selon la langue sélectionnée.
- **Langue par défaut mémorisée** : Le choix de langue est sauvegardé dans le navigateur (localStorage) et réappliqué lors des prochaines visites.
- **Ajout facile de nouvelles langues** : Il suffit d’ajouter un fichier de langue dans `src/i18n/` et de compléter les traductions.

### Structure des fichiers de langue

Les fichiers de langue se trouvent dans `src/i18n/` :
- `fr.ts` : Français
- `en.ts` : Anglais
- `es.ts` : Espagnol

Chaque fichier exporte un objet contenant toutes les traductions nécessaires, organisées par section (ex : `dashboard`, `profile`, `nav`, etc.).

Exemple :
```typescript
// src/i18n/fr.ts
export default {
  nav: {
    home: "Accueil",
    dashboard: "Tableau de bord",
    // ...
  },
  dashboard: {
    view: "Voir",
    edit: "Éditer",
    // ...
  },
  // ...
};
```

### Utilisation dans le code

Pour afficher un texte traduit, on utilise la fonction `t()` :
```typescript
import { t } from "../i18n";
<h2 class="text-2xl ">login</h2> ----> <h2 class="text-2xl ">${t("login.title")}</h2>
```

### Changement de langue

- L’utilisateur peut changer la langue via le sélecteur dans la barre de navigation.
- Le site recharge automatiquement tous les textes dans la langue choisie.
- Le choix est sauvegardé pour les prochaines visites.

### Ajouter une nouvelle langue

1. Créer un fichier `xx.ts` dans `src/i18n/` (ex : `de.ts` pour l’allemand).
2. Copier la structure d’un fichier existant et traduire chaque clé.
3. Ajouter la langue dans le sélecteur de langue du site.

---

**Grâce à ce système, le site est accessible et agréable à utiliser pour des utilisateurs du monde entier.**