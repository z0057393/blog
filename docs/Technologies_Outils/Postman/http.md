---
sidebar_label: Use with HTTP
sidebar_position: 1
---

# 🌐 Comment utiliser **Postman pour faire des requêtes HTTP (API REST)**

## 🎯 Objectif

Ce guide explique comment **tester et consommer une API HTTP/REST avec Postman**, sans client applicatif, afin de :

- valider le fonctionnement d’une API backend,
- tester les routes (GET, POST, PUT, DELETE),
- envoyer des paramètres, headers et payloads,
- analyser les réponses HTTP.

Ce type de test est indispensable lors du développement ou du débogage d’une API.

---

## ✅ Pré-requis

Avant de commencer, assure-toi d’avoir :

- Une **API HTTP/REST fonctionnelle** (ex: ASP.NET, Node.js, Laravel…)
- **Postman v10+**
- L’URL de base de ton API, par exemple :

```text
https://api.monserveur.com
```

---

## 🔗 Création d’une requête HTTP dans Postman

1. Ouvre **Postman**
2. Clique sur **New → HTTP Request**
3. Sélectionne la méthode HTTP
4. Renseigne l’URL complète de l’endpoint

Exemple :

```text
https://api.monserveur.com/api/users
```

---

## 📌 Les méthodes HTTP principales

| Méthode | Usage                 | Description            |
| ------- | --------------------- | ---------------------- |
| GET     | Lecture               | Récupère des données   |
| POST    | Création              | Crée une ressource     |
| PUT     | Mise à jour           | Remplace une ressource |
| PATCH   | Mise à jour partielle | Modifie partiellement  |
| DELETE  | Suppression           | Supprime une ressource |

---

## 📥 Requête GET – Récupérer des données

### Exemple

```http
GET /api/users HTTP/1.1
Host: api.monserveur.com
```

Dans Postman :

- Méthode : **GET**
- Onglet **Params** pour ajouter des query parameters

Exemple de paramètres :

| Key   | Value |
| ----- | ----- |
| page  | 1     |
| limit | 10    |

---

## 📤 Requête POST – Envoyer des données

### Exemple JSON

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

Dans Postman :

1. Méthode : **POST**
2. Onglet **Body** → **raw**
3. Sélectionner **JSON**
4. Coller le payload

---

## 🔐 Headers HTTP

Les headers permettent de transmettre des informations supplémentaires.

### Headers courants

| Header        | Description                          |
| ------------- | ------------------------------------ |
| Content-Type  | Type du payload (`application/json`) |
| Authorization | Authentification (Bearer, Basic…)    |
| Accept        | Format de réponse attendu            |

### Exemple d’Authorization Bearer

```text
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 🔑 Authentification avec Postman

### Basic Auth

- Onglet **Authorization**
- Type : **Basic Auth**
- Renseigner username / password

### Bearer Token (JWT)

- Onglet **Authorization**
- Type : **Bearer Token**
- Coller le token

---

## 📦 Analyse de la réponse

Postman affiche automatiquement :

- le **status HTTP** (200, 201, 400, 401, 500…)
- le **body** de la réponse
- les **headers** retournés
- le **temps de réponse**

### Exemples de statuts

| Code | Signification    |
| ---- | ---------------- |
| 200  | OK               |
| 201  | Créé             |
| 400  | Requête invalide |
| 401  | Non autorisé     |
| 403  | Interdit         |
| 404  | Non trouvé       |
| 500  | Erreur serveur   |

---

## 🧪 Tests automatisés dans Postman

Postman permet d’ajouter des tests JavaScript.

### Exemple

```javascript
pm.test("Status code is 200", function () {
  pm.response.to.have.status(200);
});
```

Ces tests sont utiles pour :

- la validation automatique,
- l’intégration CI/CD,
- la non-régression.

---

## 🛠️ Problèmes fréquents

| Problème                   | Cause probable             |
| -------------------------- | -------------------------- |
| 401 Unauthorized           | Token manquant ou invalide |
| 415 Unsupported Media Type | Content-Type incorrect     |
| 404 Not Found              | Mauvaise URL               |
| 500 Internal Server Error  | Erreur backend             |

---

## ✅ Bonnes pratiques

- Toujours préciser `Content-Type`
- Tester chaque endpoint indépendamment
- Utiliser des **environnements Postman** (dev / staging / prod)
- Ne jamais stocker de secrets en clair
