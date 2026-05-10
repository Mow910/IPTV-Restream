# 🚀 Guide d'Amélioration IPTV-Restream v1.1.0

## 📋 Résumé des Changements

Ce guide explique toutes les améliorations apportées à IPTV-Restream et comment les implémenter dans ton fork.

### ✨ Nouvelles Fonctionnalités

#### 1. **Admin Modal Amélioré - Demande du Pseudo au Premier Lancement**
- ❌ **Avant**: Message aléatoire non fiable
- ✅ **Après**: Demande du pseudo au premier lancement du chat
  - Le pseudo est sauvegardé en localStorage
  - Peut être réinitialisé via bouton "Reset username"
  - Intégration fluide avec l'authentification admin

**Fichiers modifiés:**
- `frontend/src/components/admin/AdminModal.tsx` - Redesign complet

#### 2. **Nouveau Panneau d'Administration des Paramètres**
- Changer le nom du site (site name)
- Changer la description du site
- Gérer le thème (dark/light/auto)
- Configuration centralisée des paramètres

**Fichiers nouveaux:**
- `frontend/src/components/admin/AdminSettingsModal.tsx`
- `backend/controllers/SettingsController.js`

#### 3. **Support Complet des EPG (Electronic Program Guide)**
- Ajouter une URL EPG pour les guides TV
- Support du format XMLTV
- Validation des URLs EPG avec timeout
- Interface admin pour gérer les EPG

**Fichiers nouveaux:**
- `backend/controllers/EPGController.js`
- API endpoints: `/api/admin/epg` (GET, POST, DELETE)

#### 4. **Sécurité Renforcée**
- ✅ CORS whitelist (au lieu de `Access-Control-Allow-Origin: *`)
- ✅ JWT secret aléatoire et persistant
- ✅ Rate limiting sur les tentatives de connexion (5 par 15 min)
- ✅ Bcrypt pour le hachage des mots de passe
- ✅ Validation et sanitisation des inputs (XSS protection)
- ✅ Validation des variables d'environnement au démarrage
- ✅ HTTPS redirection en production
- ✅ Helmet middleware pour les headers de sécurité
- ✅ Validation des URLs (protocoles HTTP/HTTPS uniquement)
- ✅ Validation des en-têtes customs (pas d'injections)

**Fichiers modifiés/nouveaux:**
- `backend/server.js` - Sécurité middleware
- `backend/services/auth/AuthService.js` - Bcrypt + JWT secret aléatoire
- `backend/utils/validators.js` - Validation XSS, URLs, headers
- `backend/utils/envValidator.js` - Validation env vars

#### 5. **Docker Compose Amélioré**
- ✅ Health checks pour tous les services
- ✅ Resource limits (CPU, mémoire)
- ✅ Support PUID/PGID pour les permissions fichiers
- ✅ Logs persistant (`./backend/logs`)
- ✅ Ordre de démarrage correct (depends_on)
- ✅ tmpfs tmpfs de 2GB pour les streams temporaires
- ✅ Security options (no-new-privileges)
- ✅ Variables d'environnement externalisées

**Fichiers modifiés:**
- `docker-compose.yml` - Complètement redessiné

#### 6. **GitHub Actions CI/CD**
- ✅ Build automatique des images Docker
- ✅ Support multi-architecture (amd64, arm64)
- ✅ Push vers GitHub Container Registry (GHCR)
- ✅ Scan de vulnérabilités Trivy
- ✅ Génération SBOM (Software Bill of Materials)
- ✅ Cache des builds pour plus de rapidité
- ✅ Tests de structure des containers

**Fichiers nouveaux:**
- `.github/workflows/docker-build.yml` - Pipeline complet
- `.github/container-structure-test.yaml` - Tests de structure

### 🔒 Problèmes de Sécurité Corrigés

| Problème | Sévérité | Solution |
|----------|----------|----------|
| CORS ouvert à tous (`*`) | 🔴 CRITIQUE | Whitelist des origines via env var |
| JWT secret prévisible | 🔴 CRITIQUE | Secret aléatoire de 32 bytes + persistant |
| Pas de rate limiting | 🔴 CRITIQUE | Rate limiting: 5 tentatives / 15 min |
| Mots de passe en clair | 🔴 CRITIQUE | Bcrypt avec 10 salt rounds |
| XSS non protégé | 🟠 ÉLEVÉ | Package `xss` + sanitisation inputs |
| URLs non validées | 🟠 ÉLEVÉ | Validation strict des URLs |
| FFmpeg args non validés | 🟠 ÉLEVÉ | Whitelist de caractères autorisés |
| Dépendances obsolètes | 🟡 MOYEN | Mise à jour vers packages modernes |
| Pas de validation env vars | 🟡 MOYEN | Schema Joi avec validation au démarrage |
| Pas de headers de sécurité | 🟡 MOYEN | Helmet middleware |

## 📦 Dépendances Mises à Jour

### Backend (package.json)
```json
// ❌ Supprimées
"request": "^2.88.2"  // Deprecated depuis 2020

// ✅ Ajoutées
"axios": "^1.6.5",           // HTTP client moderne
"bcryptjs": "^2.4.3",         // Hachage sécurisé de passwords
"express-rate-limit": "^7.1.5", // Rate limiting
"helmet": "^7.1.0",           // Headers de sécurité
"joi": "^17.13.3",            // Validation schéma
"xss": "^1.0.14"              // Protection XSS

// 🆙 Mises à jour de version majeure
"dotenv": "^16.4.5" // Déjà OK
"socket.io": "^4.8.1" // Déjà OK
```

## 🔧 Implémentation - Étapes

### Étape 1: Créer le Fork et Cloner
```bash
# Fork sur GitHub, puis:
git clone https://github.com/TON_USERNAME/IPTV-Restream.git
cd IPTV-Restream
```

### Étape 2: Ajouter les Fichiers Modifiés

#### Backend
```bash
# Remplacer les fichiers:
cp backend-package.json backend/package.json
cp backend-server.js backend/server.js
cp backend-AuthService.js backend/services/auth/AuthService.js
cp backend-AuthController.js backend/controllers/AuthController.js
cp backend-SettingsController.js backend/controllers/SettingsController.js
cp backend-EPGController.js backend/controllers/EPGController.js
cp backend-validators.js backend/utils/validators.js
cp backend-envValidator.js backend/utils/envValidator.js
```

#### Frontend
```bash
# Remplacer les fichiers:
cp frontend-AdminModal.tsx frontend/src/components/admin/AdminModal.tsx
cp frontend-AdminSettingsModal.tsx frontend/src/components/admin/AdminSettingsModal.tsx
```

#### Configuration et CI/CD
```bash
# Fichiers root:
cp docker-compose.yml ./
cp .env.example ./

# GitHub Actions:
mkdir -p .github/workflows
cp .github-workflows-docker-build.yml .github/workflows/docker-build.yml
cp .github-container-structure-test.yaml .github/container-structure-test.yaml
```

### Étape 3: Installer les Nouvelles Dépendances
```bash
cd backend
npm install
cd ../frontend
npm install
```

### Étape 4: Configurer les Variables d'Environnement
```bash
# Créer .env à partir du template
cp .env.example .env

# Éditer .env avec tes paramètres:
ADMIN_PASSWORD=TonMotDePasse123!@  # Min 8 caractères
ADMIN_ENABLED=true
ALLOWED_ORIGINS=https://example.com  # Optionnel
```

### Étape 5: Tester en Local
```bash
# Docker Compose
docker-compose up -d

# Vérifier les health checks
docker-compose ps

# Vérifier les logs
docker-compose logs -f iptv_restream_backend
```

### Étape 6: Pusher sur GitHub
```bash
git add .
git commit -m "feat: security improvements, admin settings, EPG support, CI/CD pipeline

- Enhanced security: CORS whitelist, bcrypt, rate limiting, input validation
- New admin settings modal for site configuration
- EPG (Electronic Program Guide) support
- Improved docker-compose with health checks and resource limits
- GitHub Actions pipeline for automated Docker builds
- Fixed admin modal to ask for username on first login
- Updated dependencies"

git push origin main
```

## 🧪 Tests à Effectuer

### 1. Admin Modal
- [ ] Premier lancement - demande le pseudo
- [ ] Le pseudo est sauvegardé en localStorage
- [ ] Login avec mot de passe fonctionne
- [ ] Logout fonctionne
- [ ] Reset username fonctionne

### 2. Settings Admin
- [ ] Charger les paramètres existants
- [ ] Modifier le nom du site
- [ ] Modifier la description
- [ ] Modifier le thème
- [ ] Les changements sont persistés

### 3. EPG
- [ ] Ajouter une URL EPG valide
- [ ] Valider que l'URL est accessible
- [ ] Supprimer l'EPG
- [ ] Vérifier que la config est sauvegardée

### 4. Sécurité
- [ ] CORS: les requêtes cross-origin sont filtrées
- [ ] Rate limiting: 6ème tentative est bloquée
- [ ] JWT token expiry: après 24h, accès refusé
- [ ] XSS: caractères spéciaux sont échappés

### 5. Docker
- [ ] `docker-compose up` démarre sans erreurs
- [ ] Health checks passent (verts)
- [ ] Nginx reverse proxy fonctionne
- [ ] Backend accessible via http://localhost:5000
- [ ] Frontend accessible via http://localhost

## 📚 Documentation

- [SECURITY_IMPROVEMENTS.md](./SECURITY_IMPROVEMENTS.md) - Détails des améliorations de sécurité
- [.env.example](./.env.example) - Variables d'environnement avec explications
- `docker-compose.yml` - Commentaires détaillés sur chaque service

## 🚨 Important - À Faire

### ⚠️ AVANT le déploiement en production:

1. **Changer `ADMIN_PASSWORD`** - Utilise un mot de passe fort unique
2. **Configurer `ALLOWED_ORIGINS`** - Whitelist uniquement tes domaines
3. **Activer HTTPS** - Décommenter les sections HTTPS dans docker-compose.yml
4. **Sécuriser les secrets** - Utilise un gestionnaire de secrets (pas de `.env` dans git)
5. **Vérifier les logs** - `docker-compose logs -f` pour voir les erreurs
6. **Tests de charge** - Tester avec plusieurs utilisateurs concurrents

### 📝 Checklist de déploiement:

- [ ] Fork créé et visible sur ton compte GitHub
- [ ] Tous les fichiers sont à jour
- [ ] `.env` est configuré avec tes paramètres
- [ ] HTTPS est activé en production
- [ ] Secrets sont sécurisés (pas dans `.env` du repo)
- [ ] GitHub Actions est activé
- [ ] Builds Docker réussissent
- [ ] Images sont accessibles sur GHCR

## 🤝 Besoin d'aide?

Si tu as des questions:
1. Vérifie les logs: `docker-compose logs SERVICE_NAME`
2. Consulte [SECURITY_IMPROVEMENTS.md](./SECURITY_IMPROVEMENTS.md)
3. Revois les fichiers d'exemple (`.env.example`)
4. Ouvre une issue sur GitHub

---

**Version**: 1.1.0  
**Date**: 2026-05-10  
**Auteur**: Améliorations de sécurité et fonctionnalités
