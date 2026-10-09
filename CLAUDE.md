# Notes pour Claude Code

- Appli web perso, en français, pour Fabien. Interface et commentaires en français, tutoiement dans les textes.
- Minuteur pomodoro façon minuteur de cuisine : une tomate dont on tourne le cadran du doigt. Né comme artifact claude.ai (« Pomodoro », 25/09/2026), devenu appli iPhone.
- Pas de framework ni d'étape de build : HTML + CSS + JS classiques, servis tels quels par GitHub Pages, installés sur l'iPhone via Safari > Sur l'écran d'accueil.
- Ce qui fait le charme, c'est la fluidité (cadran qui suit le doigt, chiffres qui roulent, ressorts) : ne pas l'alourdir.
- À chaque changement de fichier, incrémenter `VERSION` dans `sw.js` et garder la liste `FILES` à jour.
- Icônes générées par `node outils/icones.js` (pas de module à installer).
- Tester sur mobile en portrait (iPhone d'abord) : zones sûres (`env(safe-area-inset-*)`) et appli lancée depuis l'écran d'accueil.
