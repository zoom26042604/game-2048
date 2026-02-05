# 2048

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

Implémentation moderne du jeu 2048 avec classement en ligne, statistiques globales et profils joueurs.

**[Jouer](https://2048.nathan-ferre.fr)**

---

## Fonctionnalités

- **Gameplay classique** : Fusionner les tuiles pour atteindre 2048
- **Classement en ligne** : Compétition avec d'autres joueurs
- **Statistiques globales** : Suivi des performances de tous les joueurs
- **Profils joueurs** : Historique des scores et progression
- **Mobile friendly** : Contrôles tactiles pour appareils mobiles
- **Clavier** : Navigation avec les touches fléchées
- **Mode embed** : Intégration possible dans d'autres sites

---

## Installation

### Prérequis

- Node.js 18+ ou Bun

### Démarrage

```bash
# Cloner le dépôt
git clone https://github.com/zoom26042604/game-2048.git
cd game-2048

# Installer les dépendances
npm install

# Initialiser la base de données
npx prisma db push

# Lancer le serveur de développement
npm run dev
```

Le jeu sera accessible sur [http://localhost:3000](http://localhost:3000)

---

## Stack technique

| Technologie | Rôle |
|-------------|------|
| [Next.js 16](https://nextjs.org/) | Framework React avec App Router |
| [TypeScript](https://www.typescriptlang.org/) | Typage statique |
| [Prisma](https://www.prisma.io/) | ORM pour la base de données |
| [SQLite](https://www.sqlite.org/) | Base de données locale |
| [Tailwind CSS](https://tailwindcss.com/) | Framework CSS |
| [Framer Motion](https://www.framer.com/motion/) | Animations des tuiles |
| [Zustand](https://zustand-demo.pmnd.rs/) | Gestion d'état |

---

## Structure

```
game-2048/
├── app/
│   ├── api/             # Routes API (leaderboard, stats, player)
│   ├── embed/           # Version embarquable du jeu
│   ├── globals.css      # Styles globaux
│   ├── layout.tsx       # Layout principal
│   └── page.tsx         # Page du jeu
├── components/
│   ├── GameBoard.tsx    # Plateau de jeu
│   ├── Tile.tsx         # Composant tuile
│   ├── Leaderboard.tsx  # Classement
│   ├── GlobalStats.tsx  # Statistiques
│   └── PlayerProfile.tsx # Profil joueur
├── lib/
│   ├── game-store.ts    # État du jeu (Zustand)
│   ├── prisma.ts        # Client Prisma
│   └── events.ts        # Événements de jeu
├── prisma/
│   └── schema.prisma    # Schéma de la base de données
└── scripts/
    └── cleanup-db.ts    # Script de nettoyage BDD
```

---

## Comment jouer

1. Utiliser les **touches fléchées** ou **glisser** sur mobile pour déplacer les tuiles
2. Les tuiles de même valeur **fusionnent** quand elles se touchent
3. Additionner les tuiles pour atteindre **2048**
4. La partie se termine quand plus aucun mouvement n'est possible

---

## API

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/api/leaderboard` | GET | Récupérer le classement |
| `/api/leaderboard` | POST | Soumettre un nouveau score |
| `/api/stats` | GET | Statistiques globales |
| `/api/player?name=` | GET | Profil d'un joueur |

---

## Mode Embed

Le jeu peut être intégré dans d'autres sites via l'URL `/embed` :

```html
<iframe src="https://2048.nathan-ferre.fr/embed" width="400" height="500"></iframe>
```

---

## Scripts

| Commande | Description |
|----------|-------------|
| `npm run dev` | Serveur de développement |
| `npm run build` | Build de production |
| `npm run start` | Serveur de production |
| `npx prisma studio` | Interface de gestion BDD |
| `npx prisma db push` | Synchroniser le schéma |

---

## Licence

MIT License

---

## Crédits

- Jeu original par [Gabriele Cirulli](https://play2048.co/)
- Développé par [Nathan FERRE](https://github.com/zoom26042604)
