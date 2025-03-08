# Site de Présentation Avita

Ce dépôt contient un site web de présentation pour Avita, un token avec un prix de 0,002 $, une capitalisation de marché de 70M $ et une offre totale de 100M de tokens.

## Caractéristiques

- Design moderne et responsive
- Graphique de prix interactif avec historique en 5 minutes (tendance positive)
- Affichage des statistiques du token
- Animations et transitions fluides
- Compatibilité mobile

## Installation

1. Clonez ce dépôt sur votre machine locale :
   ```
   git clone https://github.com/votre-username/avita-project.git
   cd avita-project
   ```

2. Ouvrez le site dans votre navigateur :
   - Double-cliquez simplement sur le fichier `index.html`
   - Ou utilisez un serveur web local comme Live Server (extension VS Code)

## Structure du projet

```
avita-project/
│
├── index.html        # Page HTML principale
├── css/
│   └── style.css     # Styles CSS
├── js/
│   └── script.js     # JavaScript pour les fonctionnalités interactives
└── README.md         # Ce fichier
```

## Technologie utilisées

- HTML5
- CSS3 (avec variables CSS pour la personnalisation des couleurs)
- JavaScript (ES6+)
- Chart.js (pour le graphique de prix)
- Font Awesome (pour les icônes)

## Personnalisation

### Couleurs
Les couleurs principales peuvent être modifiées en éditant les variables CSS dans le fichier `css/style.css` :

```css
:root {
    --primary-color: #4c6fff;
    --secondary-color: #8a2be2;
    --accent-color: #00d2ff;
    --bg-color: #0a0e17;
    --bg-light: #141b2d;
    /* ... autres variables ... */
}
```

### Données du graphique
Pour modifier les données du graphique de prix, éditez la fonction `generateChartData()` dans `js/script.js`.

## Licence

Ce projet est sous licence MIT. Voir le fichier LICENSE pour plus de détails.

## Contact

Pour toute question ou suggestion, n'hésitez pas à me contacter à avita@example.com. 