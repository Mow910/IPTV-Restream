# Améliorations de Sécurité - IPTV-Restream

## 🔍 Problèmes Identifiés et Solutions

### 1. **CORS ouvert à tous les origines (CRITIQUE)**
**Problème:** `Access-Control-Allow-Origin: *` permet les requêtes CSRF
```javascript
// ❌ AVANT
res.header('Access-Control-Allow-Origin', '*');
```
**Solution:** Whitelist des origines autorisées via env variable
```javascript
// ✅ APRÈS
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || '').split(',').filter(Boolean);
const isOriginAllowed = ALLOWED_ORIGINS.includes(origin) || !ALLOWED_ORIGINS.length;
```

### 2. **Authentification JWT vulnérable (CRITIQUE)**
**Problème:** 
- Pas de rate limiting sur login attempts
- JWT secret dérivé du mot de passe (prévisible)
- Stockage du token en localStorage (accessible via XSS)

**Solutions:**
- Ajout de bcrypt pour hasher les passwords
- JWT secret aléatoire généré à la première exécution
- Rate limiting avec `express-rate-limit`
- Option pour HttpOnly cookies au lieu de localStorage

### 3. **XSS - Pas de validation des inputs (ÉLEVÉ)**
**Problème:** Pas de sanitization des noms de chaînes, URLs, headers
**Solution:**
- Ajout de `xss` package pour sanitizer les inputs HTML
- Validation stricte des URLs avec URL API
- Validation des headers custom

### 4. **Injection de commandes - FFmpeg args non validés (ÉLEVÉ)**
**Problème:** Les arguments utilisateur passés à FFmpeg ne sont pas validés
**Solution:**
- Whitelist des caractères autorisés
- Validation stricte des URLs de stream
- Échappement des arguments shell

### 5. **Dépendances obsolètes (MOYEN)**
**Problème:**
- `request` package est deprecated (2020)
- Versions anciennes de plusieurs packages
```json
"request": "^2.88.2",  // ❌ DEPRECATED
"socket.io": "^4.8.1"  // ✅ OK
```
**Solution:** Migrer vers `axios` ou `node-fetch`, mettre à jour toutes les dépendances

### 6. **Pas de validation des variables d'environnement (MOYEN)**
**Problème:** Pas de vérification que les env vars requises sont définies
**Solution:**
- Schéma de validation avec `joi` ou similaire
- Messages d'erreur clairs au démarrage

### 7. **Pas de limite de taille pour les uploads (MOYEN)**
**Problème:** Pas de protection contre les uploads massifs
**Solution:**
- Limiter la taille des payloads JSON
- Limiter la taille des playlists M3U importées

### 8. **HTTPS non forcé en production (MOYEN)**
**Problème:** Pas de redirection HTTP → HTTPS
**Solution:**
- Middleware pour forcer HTTPS en production

### 9. **Mot de passe admin visible en logs (ÉLEVÉ)**
**Problème:** Logs contiennent potentiellement des données sensibles
**Solution:**
- Jamais logger les passwords ou tokens
- Utiliser des placeholders dans les logs

### 10. **Pas de validation du format EPG (MOYEN)**
**Problème:** EPG URL pas validée avant d'être utilisée
**Solution:**
- Validation du format URL XMLTV
- Timeout sur les requêtes EPG

## 📋 Checklist d'Implémentation

- [x] CORS whitelist
- [x] JWT secret aléatoire + rate limiting  
- [x] Input sanitization (XSS)
- [x] FFmpeg args validation
- [x] Mise à jour dépendances
- [x] Validation env vars
- [x] Limites de payload
- [x] HTTPS middleware
- [x] Sanitization des logs
- [x] Validation EPG
