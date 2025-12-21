# Deploiement

![](https://etherpad.org/assets/brand-ruuyTPHN.svg)

## 1. Table des matières

## 2. Déploiement

### 2.2. postgres-deployment.yaml

Installation de la base de données postgreSQL pour stocker les informations des différents pads

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: etherpad-postgres-pv-claim
  namespace: etherpad
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 20Gi

---
apiVersion: v1
kind: Service
metadata:
  name: etherpad-postgres
spec:
  selector:
    app: postgres
  ports:
    - protocol: TCP
      port: 5432
      targetPort: 5432

---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: etherpad-postgres
  namespace: etherpad
spec:
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
        - name: postgres
          image: postgres:13
          ports:
            - containerPort: 5432
          env:
            - name: POSTGRES_USER
              value: "etherpad"
            - name: POSTGRES_PASSWORD
              value: "pwd"
            - name: POSTGRES_DB
              value: "etherpad"
          volumeMounts:
            - name: postgres-storage
              mountPath: /var/lib/postgresql/data
              subPath: pgdata
      volumes:
        - name: postgres-storage
          persistentVolumeClaim:
            claimName: etherpad-postgres-pv-claim
```

/!\ Changer le mot de passe de la base de données /!\

### 2.3. etherpad-deployment.yaml

Fichier de déploiement de notre application Etherpad

On définit les variables d’environnement dans ce fichier.
La variable DB_PASS doit correspondre au mot de passe de la base de données qui a été défini dans la partie précédente.

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: etherpad
  namespace: etherpad
spec:
  replicas: 1
  selector:
    matchLabels:
      app: etherpad
  template:
    metadata:
      labels:
        app: etherpad
    spec:
      containers:
        - name: etherpad
          image: etherpad/etherpad:2.1
          ports:
            - containerPort: 9001
              protocol: TCP
          env:
            - name: DB_TYPE
              value: "postgres"
            - name: DB_HOST
              value: "etherpad-postgres"
            - name: DB_PORT
              value: "5432"
            - name: DB_USER
              value: "etherpad"
            - name: DB_PASS
              value: "pwd"
            - name: DB_NAME
              value: "etherpad"
            - name: ADMIN_PASSWORD
              value: "pwd"
            - name: USER_PASSWORD
              value: "pwd"
```

/!\ Modifier le mot de passe /!\

### 2.4. etherpad-service.yaml

```yaml
apiVersion: v1
kind: Service
metadata:
  name: etherpad
  namespace: etherpad
spec:
  selector:
    app: etherpad
  ports:
    - name: http
      port: 9001
      targetPort: 9001
```

### 2.5. etherpad-ingress.yaml

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: etherpad-ingress
  namespace: etherpad
spec:
  rules:
    - host: "`{ nom de domaine }.com`"
      http:
        paths:
          - pathType: Prefix
            path: "/"
            backend:
              service:
                name: etherpad
                port:
                  number: 9001
```

/!\ Modifier le nom de domaine /!\

### 2.6. etherpad-playbook.yaml

```yaml
- hosts: localhost
  gather_facts: false
  vars:
    etherpad_namespace: etherpad
    kubeconfig_path: "`{ chemin du fichier kubeconfig }`"
    etherpad_dir: "`{ chemin du dossier etherpad }`"
  tasks:
    ########## Create namespace ##########
    - name: Create {{ etherpad_namespace }} namespace
      k8s:
        kubeconfig: "{{ kubeconfig_path }}"
        name: "{{ etherpad_namespace }}"
        api_version: v1
        kind: Namespace
        state: present

    - name: Apply bdd
      kubernetes.core.k8s:
        kubeconfig: "{{ kubeconfig_path }}"
        namespace: "{{ etherpad_namespace }}"
        src: "{{ etherpad_dir }}/bdd/postgres-deployment.yaml"
        state: present

    - name: Apply ingress
      kubernetes.core.k8s:
        kubeconfig: "{{ kubeconfig_path }}"
        namespace: "{{ etherpad_namespace }}"
        src: "{{ etherpad_dir }}/ingress/etherpad-ingress.yaml"
        state: present

    - name: Apply services
      kubernetes.core.k8s:
        kubeconfig: "{{ kubeconfig_path }}"
        namespace: "{{ etherpad_namespace }}"
        src: "{{ etherpad_dir }}/service/etherpad-service.yaml"
        state: present

    - name: Apply deployment
      kubernetes.core.k8s:
        kubeconfig: "{{ kubeconfig_path }}"
        namespace: "{{ etherpad_namespace }}"
        src: "{{ etherpad_dir }}/deployment/etherpad-deployment.yaml"
        state: present
```

Pour installer etherpad, utiliser la commande suivante :

```yaml
ansible-playbook etherpad-playbook.yaml
```

## 3. Administration

Pour accéder à l’interface administrateur, il suffit de se rendre sur la route /admin

Et de saisir les identifiants :

- Identifiant : admin
- Mot de passe : "`{Valeur de ADMIN_PASSWORD}`"
