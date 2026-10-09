# Pomodoro

Minuteur pomodoro façon minuteur de cuisine : une tomate dont on tourne le cadran du doigt.
Appli web sans installation : du HTML, du CSS et du JavaScript, rien à compiler.

## Mettre l'appli en ligne avec GitHub Pages

1. Crée un nouveau dépôt sur GitHub (par exemple `pomodoro`).
2. Envoie tous les fichiers de ce dossier à la racine du dépôt (`index.html` doit être à la racine).
3. Dans le dépôt : **Settings → Pages**, source **Deploy from a branch**, branche `main`, dossier `/ (root)`, puis **Save**.
4. Au bout d'une minute ou deux, l'appli est dispo sur `https://<ton-pseudo>.github.io/pomodoro/`.

## L'installer sur l'iPhone

Ouvre l'adresse dans **Safari**, touche **Partager**, puis **Sur l'écran d'accueil**.
L'appli s'ouvre alors en plein écran avec son icône, et marche hors ligne après la première ouverture.

Bon à savoir : quand l'appli passe en arrière-plan, l'iPhone la met en veille. Le temps continue de compter
(au retour, le minuteur est à jour, même si l'iPhone a fermé l'appli), mais la sonnerie ne retentit
que si l'appli est ouverte. Pour une longue session, active « Garder l'écran allumé » dans les réglages.

## Organisation des fichiers

| Fichier | Rôle |
| --- | --- |
| `index.html` | La page et la structure de l'interface |
| `css/style.css` | Tout le style (cadran, boutons, tiroir des réglages) |
| `js/app.js` | Toute la logique : cadran, minuteur, sons, réglages, stats |
| `sw.js` | Service worker : met l'appli en cache pour le hors ligne |
| `manifest.webmanifest` | Nom, couleurs et icônes pour l'écran d'accueil |
| `fonts/` | Les polices Bricolage Grotesque, Fraunces et Space Mono, embarquées pour marcher hors ligne |
| `icons/` | Les icônes, générées par `node outils/icones.js` |

## Après une modification

Change la valeur de `VERSION` en haut de `sw.js` (par exemple `pomodoro-v2`).
Sans ça, les téléphones qui ont déjà l'appli continuent d'afficher l'ancienne version.

## Tester sur l'ordinateur

Le mode hors ligne ne marche pas en ouvrant `index.html` directement (adresse en `file://`).
Pour tout tester, lance un petit serveur dans le dossier : `npx serve`, puis ouvre l'adresse affichée.
