# OVHcloud — Se connecter en SSH à son VPS

Ce guide explique **pas à pas** comment se connecter de manière sécurisée à un **VPS OVHcloud via SSH**, en utilisant une **clé SSH** plutôt qu’un mot de passe.

---

## 🧰 Pré-requis

Avant de commencer, assurez-vous d’avoir :

| Élément                   | Description                      |
| ------------------------- | -------------------------------- |
| VPS OVHcloud              | VPS actif et accessible          |
| Accès root ou utilisateur | Droits SSH                       |
| Terminal                  | Linux / macOS / WSL recommandé   |
| OpenSSH                   | Généralement installé par défaut |

ℹ️ Ce guide est valable pour **Linux / macOS / Windows (WSL)**.

---

## 🧪 Comprendre les clés SSH

Les clés SSH fonctionnent par **paire cryptographique** :

| Type         | Rôle                     |
| ------------ | ------------------------ |
| Clé privée   | Reste sur votre machine  |
| Clé publique | Installée sur le serveur |

La connexion est autorisée **uniquement si les deux correspondent**.

---

## 🧬 Algorithmes de clés SSH

Deux algorithmes sont couramment utilisés :

| Algorithme | Sécurité    | Compatibilité | Recommandation        |
| ---------- | ----------- | ------------- | --------------------- |
| RSA        | Très élevée | Excellente    | ✔️ Compatible partout |
| Ed25519    | Très élevée | Plus récente  | ⚡ Plus rapide        |

📝 **Choix du guide** : RSA (meilleure compatibilité).

---

## 🛠️ Générer une clé SSH

### 📍 Commande de génération

```bash
ssh-keygen -t rsa -b 4096
```

### 🧩 Détails des paramètres

| Argument | Description                       |
| -------- | --------------------------------- |
| `-t`     | Type d’algorithme                 |
| `-b`     | Taille de la clé (RSA uniquement) |
| 4096     | Sécurité maximale recommandée     |

ℹ️ Appuyez sur **Entrée** pour accepter le chemin par défaut.

---

## 📂 Emplacement des clés

Les clés sont stockées dans :

```bash
~/.ssh/
```

| Fichier      | Description                        |
| ------------ | ---------------------------------- |
| `id_rsa`     | Clé privée (⚠️ ne jamais partager) |
| `id_rsa.pub` | Clé publique                       |

---

## 📤 Copier la clé publique

Affichez la clé publique :

```bash
cat ~/.ssh/id_rsa.pub
```

📋 Copiez **l’intégralité** du contenu affiché.

---

## 🌐 Connexion initiale au VPS

Connectez-vous avec mot de passe (une dernière fois) :

```bash
ssh user@IP_DU_VPS
```

📝 Exemple :

```bash
ssh ubuntu@51.xxx.xxx.xxx
```

---

## 🗝️ Installer la clé sur le VPS

### 📁 Créer le dossier SSH (si nécessaire)

```bash
mkdir -p ~/.ssh
chmod 700 ~/.ssh
```

### ✍️ Ajouter la clé publique

```bash
nano ~/.ssh/authorized_keys
```

Collez votre clé publique, puis sauvegardez.

### 🔒 Sécuriser les permissions

```bash
chmod 600 ~/.ssh/authorized_keys
```

---

## 🔑 Connexion SSH avec clé

Déconnectez-vous, puis reconnectez-vous :

```bash
ssh user@IP_DU_VPS
```

🎉 **Aucun mot de passe ne sera demandé**.

---

## ⚡ Astuce — Connexion simplifiée

Ajoutez une configuration locale :

```bash
nano ~/.ssh/config
```

```ini
Host ovh-vps
  HostName 51.xxx.xxx.xxx
  User ubuntu
  IdentityFile ~/.ssh/id_rsa
```

Connexion rapide :

```bash
ssh ovh-vps
```

---

## 🧯 Problèmes fréquents / Causes probables

| Problème              | Cause probable      | Solution                   |
| --------------------- | ------------------- | -------------------------- |
| Permission denied     | Droits incorrects   | Vérifier chmod             |
| Clé ignorée           | Mauvais utilisateur | Vérifier `user@host`       |
| Toujours mot de passe | Mauvaise clé        | Vérifier `authorized_keys` |
| Connexion refusée     | SSH désactivé       | Vérifier `sshd`            |
| Timeout               | Firewall            | Vérifier ports             |

---

## 🛡️ Bonnes pratiques de sécurité

- Désactiver l’authentification par mot de passe
- Utiliser une clé par machine
- Sauvegarder la clé privée
- Protéger la clé avec une passphrase

ℹ️ Pour aller plus loin : modifier `/etc/ssh/sshd_config`.
