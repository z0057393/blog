# OVH - Se connecter en ssh à son VPS

![](https://www.corinnelegras.fr/wp-content/uploads/elementor/thumbs/logo-OVH-cloud-p42b8ddp4t25cg9eys9xrv5gefw3vog8vximej090g.png)

## Pré-requis

Avoir un VPS

## Générer une clef ssh

Deux algorithmes sont couramment utilisés pour générer des clés d’authentification :

- **RSA** – Une clé RSA SSH est considérée comme
  hautement sécurisée car elle a généralement une taille de clé plus
  importante, souvent 2048 ou 4096 bits. Elle est également plus
  compatible avec les anciens systèmes d’exploitation.
- **Ed25519** – Un algorithme plus moderne avec une
  taille de clé standard plus petite de 256 bits. Il est tout aussi sûr et efficace qu’une clé RSA en raison de ses fortes propriétés
  cryptographiques. La compatibilité est plus faible, mais les systèmes
  d’exploitation les plus récents le prennent en charge.

Dans notre cas, nous allons utiliser l’algorithme RSA.

Pour générer notre clef, nous allons utiliser la commande

```jsx
ssh-keygen -t rsa
```

| Nom    | Argument | Description                                                                                                                           |
| ------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Type   | -t       | Permet de choisir l’algorothme que l’on veut utiliser                                                                                 |
| Taille | -b       | \*\*Pour RSA seulement, ed25519 a une taille fixe, il permet de définir la taille de notre clef entre 2048 et 4096, par défaut : 2048 |

La clef est sauvegardé dans le dossier :

```jsx
cd ~/.ssh
```

On a donc la clef privé et public.

## Mettre notre clef public sur le VPS

```jsx
cat ~/.ssh/id_rsa.pub
```

Copier le résultat.

Connecter vous sur votre VPS

```jsx
ssh user@host
```

Saisissez le mot de passe

Une fois connecté sur le VPS

```jsx
vi.ssh / authorized_keys;
```

Coller votre clef ssh dans le fichier authorized_keys

Votre clef ssh est maintenant prise en compte par votre VPS
