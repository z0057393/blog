---
sidebar_label: Use with SignalR
sidebar_position: 2
---

# 🧠 Comment utiliser **Postman avec SignalR (.NET)**

## 🎯 Objectif

Ce guide explique comment **tester un hub SignalR directement depuis Postman**, sans client .NET ou JavaScript, en utilisant une connexion **WebSocket** et le **protocole JSON de SignalR**.

---

## ✅ Pré-requis

Avant de commencer, assure-toi d’avoir :

- Un **hub SignalR fonctionnel** (ASP.NET Core / .NET)
- **Postman v10+** (support des WebSockets)
- L’URL WebSocket de ton hub, par exemple :

```text
wss://monserveur.com/hubs/monHub
```

---

## 🔗 Connexion WebSocket

1. Ouvre Postman
2. Crée une **nouvelle requête WebSocket**
3. Renseigne l’URL de ton hub SignalR :

```text
wss://monserveur.com/hubs/monHub
```

4. Clique sur **Connect**

> ⚠️ SignalR utilise directement WebSockets. La phase de négociation HTTP n’est pas visible dans Postman.

---

## 🔄 Handshake (obligatoire)

Une fois la connexion établie, tu dois envoyer un **message de handshake** pour indiquer le protocole utilisé.

### 📤 Message de handshake

```json
{"protocol":"json","version":1}
```

### ℹ️ Points importants

- Le message est au **format JSON**
- Il doit impérativement se terminer par le caractère ASCII **`0x1E`** (Unit Separator)
- Sans ce caractère, SignalR ignore le message

> 💡 Ce caractère est invisible. Tu peux le copier/coller depuis un exemple fonctionnel.

Après l’envoi, le serveur répond généralement par un message vide `{}` indiquant que le handshake est accepté.

---

## 📩 Appeler une méthode du hub (Invoke)

Une fois le handshake effectué, tu peux invoquer des méthodes exposées par ton hub SignalR.

### 🔹 Exemple d’invocation

```json
{
    "arguments":["message_to_send"],
    "target":"MethodToInvoke",
    "type":1
}
```

### 🔍 Détail des champs

| Champ       | Description                               |
| ----------- | ----------------------------------------- |
| `arguments` | Liste des paramètres envoyés à la méthode |
| `target`    | Nom de la méthode côté serveur            |
| `type`      | Type de message (`1` = Invocation)        |

Chaque message doit **obligatoirement** se terminer par `0x1E`.

---

## 📦 Types de messages SignalR

SignalR définit plusieurs types de messages. Les plus courants sont :

| Type       | Valeur | Description                |
| ---------- | ------ | -------------------------- |
| Invocation | `1`    | Appel d’une méthode du hub |
| Completion | `3`    | Réponse à une invocation   |
| Ping       | `6`    | Maintien de la connexion   |

> Dans Postman, seul le **protocole JSON** est facilement testable.

---

## 📥 Réception des messages serveur

Si ton hub envoie des messages du serveur vers le client :

- Reste connecté après le handshake
- Les messages reçus s’affichent automatiquement dans la console WebSocket de Postman

Exemple de message reçu :

```json
{
  "type": 1,
  "target": "OnProgress",
  "arguments": [50]
}
```

---

## 🛠️ Problèmes fréquents

| Problème                       | Cause probable                    |
| ------------------------------ | --------------------------------- |
| Connexion fermée immédiatement | Handshake manquant                |
| Aucun effet lors de l’envoi    | `0x1E` manquant                   |
| Erreur côté serveur            | Mauvais nom de méthode (`target`) |
