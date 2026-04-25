# 🚀 InvestLink — Plateforme de mise en relation Porteurs de Projets & Investisseurs

## 📋 Description

InvestLink est une plateforme web full-stack qui connecte porteurs de projets (startups, PME) et investisseurs dans un environnement sécurisé avec vérification d'identité (KYC), messagerie interne en temps réel, et un assistant IA spécialisé (InvestBot via Groq).

---

## 🗂️ Structure du projet

```
investlink/
├── backend/               # API Node.js / Express
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js          # Connexion PostgreSQL
│   │   │   └── schema.sql     # Schéma base de données
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── projectController.js
│   │   │   ├── messagingController.js
│   │   │   ├── kycController.js
│   │   │   ├── adminController.js
│   │   │   ├── aiController.js
│   │   │   └── notificationController.js
│   │   ├── middleware/
│   │   │   ├── auth.js        # JWT middleware
│   │   │   └── upload.js      # Multer file upload
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── projects.js
│   │   │   ├── messaging.js
│   │   │   ├── kyc.js
│   │   │   ├── admin.js
│   │   │   └── misc.js        # AI + Notifications
│   │   └── index.js           # Serveur + WebSocket
│   ├── package.json
│   └── .env.example
│
└── frontend/              # React (Vite)
    ├── src/
    │   ├── components/
    │   │   └── layout/
    │   │       └── Navbar.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── pages/
    │   │   ├── Home.jsx
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── Projects.jsx
    │   │   ├── ProjectDetail.jsx
    │   │   ├── CreateProject.jsx
    │   │   ├── MyProjects.jsx
    │   │   ├── Messages.jsx       # + InvestBot IA
    │   │   ├── Profile.jsx        # + KYC upload
    │   │   ├── Admin.jsx
    │   │   └── Notifications.jsx
    │   ├── styles/
    │   │   └── globals.css
    │   ├── utils/
    │   │   └── api.js
    │   ├── App.jsx
    │   └── main.jsx
    ├── index.html
    ├── vite.config.js
    └── package.json
```

---

## ⚙️ Installation

### Prérequis

- Node.js >= 18
- PostgreSQL >= 14
- Compte Groq (gratuit) pour l'IA : https://console.groq.com

---

### 1. Base de données

```bash
# Créer la base de données
createdb investlink

# Exécuter le schéma
psql -d investlink -f backend/src/config/schema.sql
```

---

### 2. Backend

```bash
cd backend
npm install

# Copier et configurer l'environnement
cp .env.example .env
# Éditer .env avec vos valeurs
```

**Variables .env importantes :**

```env
PORT=5000
DATABASE_URL=postgresql://user:password@localhost:5432/investlink
JWT_SECRET=changez_cette_valeur_en_prod
GROQ_API_KEY=votre_cle_groq
CLIENT_URL=http://localhost:5173
```

```bash
# Démarrer le backend
npm run dev
# ou en production
npm start
```

---

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

L'application sera disponible sur `http://localhost:5173`

---

## 🔑 Compte admin par défaut

```
Email:    admin@investlink.com
Password: password
```

> ⚠️ **Changer impérativement ce mot de passe en production !**

---

## 📡 API Endpoints

### Auth
| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/api/auth/register` | Inscription |
| POST | `/api/auth/login` | Connexion |
| GET | `/api/auth/me` | Profil courant |
| PUT | `/api/auth/profile` | Modifier profil |

### Projets
| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/projects` | Liste + filtres |
| GET | `/api/projects/:id` | Détail projet |
| POST | `/api/projects` | Créer projet |
| PUT | `/api/projects/:id` | Modifier projet |
| DELETE | `/api/projects/:id` | Supprimer projet |
| POST | `/api/projects/:id/favorite` | Toggle favori |
| GET | `/api/projects/my` | Mes projets |
| POST | `/api/projects/:id/update` | Ajouter une mise à jour |

### Messagerie
| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/api/conversations` | Créer/récupérer conversation |
| GET | `/api/conversations` | Mes conversations |
| GET | `/api/conversations/:id/messages` | Messages d'une conversation |
| POST | `/api/messages` | Envoyer un message |
| POST | `/api/conversations/:id/report` | Signaler |

### KYC
| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/api/kyc/submit` | Soumettre documents |
| GET | `/api/kyc/status` | Mon statut KYC |
| GET | `/api/kyc/pending` | (Admin) KYC en attente |
| POST | `/api/kyc/:userId/validate` | (Admin) Valider/rejeter |

### Admin
| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/admin/dashboard` | Statistiques |
| GET | `/api/admin/users` | Liste utilisateurs |
| POST | `/api/admin/users/:id/suspend` | Suspendre/réactiver |
| GET | `/api/admin/reports` | Signalements ouverts |
| PUT | `/api/admin/reports/:id` | Traiter signalement |
| POST | `/api/admin/projects/:id/moderate` | Modérer projet |

### IA & Notifications
| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/api/ai/chat` | Chat avec InvestBot (Groq) |
| GET | `/api/notifications` | Mes notifications |
| PUT | `/api/notifications/:id/read` | Marquer comme lu |

---

## 🔌 WebSocket (Socket.io)

Événements côté client :

```javascript
socket.emit('join', userId)                    // Rejoindre avec son ID
socket.emit('join_conversation', convId)       // Rejoindre une conversation
socket.emit('send_message', { conversation_id, message })  // Envoyer
socket.emit('typing', { conversation_id })     // Indicateur de frappe

socket.on('new_message', (msg) => ...)         // Recevoir message
socket.on('user_typing', ({ userId }) => ...)  // Indicateur de frappe
```

---

## 🤖 InvestBot (IA Groq)

InvestBot est un assistant IA intégré dans la messagerie, accessible via le bouton flottant.

- **Modèle** : `llama3-70b-8192` (Groq)
- **Domaines** : investissement, levée de fonds, startups, valorisation, stratégie
- **Restriction** : répond uniquement aux questions liées à l'investissement et aux projets

**Obtenir une clé Groq gratuite :** https://console.groq.com

---

## 🛡️ Sécurité

- Authentification JWT (expiration 7 jours)
- Hash bcrypt pour les mots de passe
- Middleware de vérification de rôle
- Protection des routes sensibles
- Upload limité à 10 MB
- Vérification des types de fichiers

---

## 📊 Calcul du score de confiance

| Élément | Points |
|---------|--------|
| KYC vérifié | +40 |
| Profil complété | +20 |
| Projet publié | +20 |
| Activité régulière | +20 |

Score max : **100/100**

Niveaux : 🔴 Faible (0-39) · 🟡 Moyen (40-69) · 🟢 Élevé (70-100)

---

## 🚀 Déploiement en production

1. Configurer `NODE_ENV=production` dans le .env
2. Utiliser un service de stockage cloud pour les uploads (AWS S3, Cloudinary, etc.)
3. Configurer SSL/HTTPS
4. Utiliser PM2 ou Docker pour le process management
5. Configurer les variables d'environnement sur votre hébergeur

---

## 📈 Évolutions futures prévues

- [ ] API KYC automatisée (Stripe Identity, Sumsub)
- [ ] Système de paiement (Stripe)
- [ ] Abonnement premium
- [ ] Analytics avancés
- [ ] Recommandations IA
- [ ] Appels vidéo intégrés

---

## 📄 Licence

MIT — Libre d'utilisation pour usage personnel et commercial.
