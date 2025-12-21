# Création d'une infrastructure et déploiement d'application

## Pré-requis

- Terraform (v1.7.2 > )
- Ansible (v2.17.0 > )

## Création de l’infrastructure

### Introduction

Dans une optique d’automatisation, l’infrastructure est créé par l’intermédiaire de Terraform.

### Structure

La structure actuelle de Terraform se compose de 4 fichiers.

```jsx
Terraform
		|__ variable.tf
		|__ provider.tf
		|__ ovh_kube_cluster.tf
		|__ secrets
		       |___ secret.tfvars
```

**Variable.tf**

Le fichier [Variable.tf](http://Variable.tf) est le fichier dans lequel nous allons définir les variables de notre projet Terrafom.

| Variable        | Description                                                                   |
| --------------- | ----------------------------------------------------------------------------- |
| project_id      | Fais référence à notre identifiant de projet dans le cloud public de chez OVH |
| ovh             | Contient les ids de connexion à notre API ovh                                 |
| kubeconfig_path | Chemin de sortie de notre kubeconfig ( utilisé pour manager le cluster )      |
| cluster_name    | Nom du cluster                                                                |
| pool_name       | Nom du pool de noeud du cluster                                               |
| region          | Identifiant de la zone géographique de notre cluster                          |
| flavor_name     | Identifiant des serveurs                                                      |
| nodes           | Configuration des noeuds                                                      |

```yaml
variable "project_id" {
type        = string
sensitive   = true
}

variable "ovh" {
type = list(object({
endpoint = string
application_key = string
application_secret = string
consumer_key = string
}))
sensitive   = true
}

variable "kubeconfig_path" {
type        = string
sensitive   = true
}

variable "cluster_name" {
type        = string
default     = "my-project"
}

variable "pool_name" {
type        = string
default     = "my-app"
}

variable "region" {
type        = string
default     = "GRA11"
}

variable "flavor_name" {
type        = string
default     = "c3-4"
}

variable "nodes" {
type = list(object({
desired_nodes = number
max_nodes = number
min_nodes = number
}))
default = [
{
desired_nodes = 2
max_nodes     = 3
min_nodes     = 1
}
]
}
```

**Provider.tf**

Le fichier [provider.tf](http://provider.tf) contient les informations relative à la connexion chez nos providers.

```yaml
terraform {
required_providers {
ovh = {
source  = "ovh/ovh"
}
helm = {
source = "hashicorp/helm"
}
kubernetes = {
source = "hashicorp/kubernetes"
}
}
}

provider "ovh" {
endpoint           = "${var.ovh[0].endpoint}"
application_key    = "${var.ovh[0].application_key}"
application_secret = "${var.ovh[0].application_secret}"
consumer_key       = "${var.ovh[0].consumer_key}"
}
```

**Ovh_kube_cluster.tf:**

Le fichier ovh_kube_cluster.tf contient les informations relative à notre infrastructure.

```yaml
resource "ovh_cloud_project_kube" "cluster" {
service_name = "${var.project_id}"
name         = "${var.cluster_name}"
region       = "${var.region}"
}

resource "ovh_cloud_project_kube_nodepool" "node_pool" {
service_name  = "${var.project_id}"
kube_id       = ovh_cloud_project_kube.cluster.id
name          = "${var.pool_name}"
flavor_name   = "${var.flavor_name}"
desired_nodes = var.nodes[0].desired_nodes
max_nodes     = var.nodes[0].max_nodes
min_nodes     = var.nodes[0].min_nodes
}

resource "local_file" "kubeconfig" {
filename = "${var.kubeconfig_path}"
content  = ovh_cloud_project_kube.cluster.kubeconfig
}
```

La section : resource “local_file” “kubeconfig” nous permet de récupérer le fichier kubeconfig.
Ce qui va nous permettre de manager notre infrastructure via kubectl, helm ou encore ansible.

**secrets/secret.tfvars:**

Contient les informations sensible de notre cluster ( mot de passe, identifiants etc…)

```yaml
project_id = {Identifiant du projet}
kubeconfig_path = {chemin de sortie du fichier kubeconfig}
ovh = [
{
endpoint           = {endpoint}
application_key    = {application_key}
application_secret = {application_secret}
consumer_key       = {consumer_key}
}
]
```

Les éléments en rouge sont à modifier en fonction des différents usages.
Le fichier secret.tfvars contenant des données sensible, il est d’usage de ne pas le mettre à disposition sur internet ( utiliser .gitignore est une bonne pratique )

Ref:

- Terraform provider : [https://registry.terraform.io/browse/providers](https://registry.terraform.io/browse/providers)
- OVH API : [https://help.ovhcloud.com/csm/fr-api-getting-started-ovhcloud-api?id=kb_article_view&sysparm_article=KB0042789](https://help.ovhcloud.com/csm/fr-api-getting-started-ovhcloud-api?id=kb_article_view&sysparm_article=KB0042789)
- Identifiant du projet :

![Untitled](Untitled.png)

- Augmenter les quotas : [https://help.ovhcloud.com/csm/fr-public-cloud-compute-increase-quota?id=kb_article_view&sysparm_article=KB0050857](https://help.ovhcloud.com/csm/fr-public-cloud-compute-increase-quota?id=kb_article_view&sysparm_article=KB0050857)
- Ovh public cloud : [https://help.ovhcloud.com/csm/fr-public-cloud-compute-create-project?id=kb_article_view&sysparm_article=KB0050614](https://help.ovhcloud.com/csm/fr-public-cloud-compute-create-project?id=kb_article_view&sysparm_article=KB0050614)

### Usage

**Créer notre infrastructure :**

```jsx
terraform plan -var-file="secrets/secret.tfvars"
```

La commande terraform plan crée un plan d'exécution qui permet de prévisualiser les changements que Terraform prévoit d'apporter à votre infrastructure.
Par défaut, lorsque Terraform crée un plan, il :

- Lit l'état actuel de tout objet distant existant pour s'assurer que l'état de Terraform est à jour.
- Compare la configuration actuelle à l'état précédent et note les différences.
- Propose un ensemble d'actions de changement qui, si elles sont appliquées, devraient faire correspondre les objets distants à la configuration.

```jsx
terraform apply -var-file="secrets/secret.tfvars"
```

La commande terraform apply exécute les actions proposées dans le plan Terraform.

Dans notre cas elle va créer notre cluster.
La création peut prendre quelques minutes ( 5 minutes environs )

**Détruire notre infrastructure**

Pour détruire notre infrastructure nous allons utiliser la commande:

```jsx
terraform destroy -var-file="secrets/secret.tfvars"
```

La commande terraform destroy va détruire tous les objets distants gérés par la configuration de Terraform.

## Installation de nos applications

### Introduction

Pour le projet my-app, notre application est composé de 3 parties :

- L’application ( Laravel )
- Le websocket ( Javascript/socket.io )
- La base de données ( postgresql )

![Untitled](Untitled%201.png)

Un secret contenant la clef de communication entre l’application et le websocket est a créer.
Il nous faudra également installer un reverse proxy afin que nos requêtes soient redirigé vers le bon service.
Et pour finir nous devrons gérer les certificats SSL afin d’assurer une communication en HTTPS.

Pour automatiser le déploiement, nous allons utiliser Ansible.

**Structure d’Ansible**

```jsx
ansible
   |___ Inventory ### Contient les informations relatives à nos serveurs ( kubeconfig)
   |___ Playbook ### Contient les éléments à installer
```

L’installation se déroulera en 3 parties :

- 1 - Installation du reverse proxy
- 2 - Challenge http pour les certificats
- 3 - installation de l’application

## **Etape 1 - Installation du reverse proxy :**

### **Traefik**

Pour installer Traefik via Ansible, nous allons commencer par créer un nouveau dossier dans le dossier playbook, puis créer un fichier nommé “ traefik-playbook.yaml ”.

```jsx
ansible
	 |____ inventory
	 |____ playbook
	           |____ Traefik
	                    |____ traefik-playbook.yaml
```

Le playbook ressemble à ça :

Ont créé un namespace pour traefik, on ajoute le repository helm et ont installe traefik

```jsx
- hosts: localhost
  gather_facts: false
  vars:
    traefik_namespace: traefik
    kubeconfig_path: {path to dir}/ansible/inventory/kubeconfig.yml
  tasks:

########## Create namespace ##########

  - name: Create "{{ traefik_namespace }}" namespace
    k8s:
     kubeconfig: "{{ kubeconfig_path }}"
     name: "{{ traefik_namespace }}"
     api_version: v1
     kind: Namespace
     state: present

########## Add helm repository ##########

  - name: Add traefik Helm charts repository
    kubernetes.core.helm_repository:
      kubeconfig: "{{ kubeconfig_path }}"
      name: traefik
      repo_url: https://traefik.github.io/charts

########## Install chart ##########

  - name: Install Traefik Chart
    kubernetes.core.helm:
      kubeconfig: "{{ kubeconfig_path }}"
      name: traefik
      namespace: "{{ traefik_namespace }}"
      chart_ref: traefik/traefik

```

Pour exécuter notre playbook:

```jsx
ansible-playbook traefik-playbook.yaml                                                                                           ─╯
```

Resultat de la commande :

```jsx
kubectl get all -n traefik
```

![Untitled](Untitled%202.png)

Une fois que l’IP externe est présente, ne pas oublier d’éditer sa zone DNS afin de mapper le nom de domaine et l’adresse IP

Ref:

- Editer une Zone DNS : [https://help.ovhcloud.com/csm/fr-dns-edit-dns-zone?id=kb_article_view&sysparm_article=KB0051684](https://help.ovhcloud.com/csm/fr-dns-edit-dns-zone?id=kb_article_view&sysparm_article=KB0051684)

## **Etape 2 - Challenge http pour les certificats**

Afin d’obtenir une connexion en https, nous allons réaliser un challenge http01 afin que let’s encrypt nous délivre un certificat.

Egalement, pour plus de simplicité et pour ne pas avoir à intervenir lorsque les certificats vont expirer, nous allons utiliser l’outil Cert Manager.

### **Cert Manager**

Dans un premier temps, nous allons préparer la configuration de notre Cert Manager, notre issuer et notre certificat.

Une notion importante à comprendre est celle de staging et de production.

Je recommande de réaliser les tests via le mode staging afin de ne pas se faire bannir temporaire suite à un trop gros nombre de demande en mode production.

```jsx
cert-manager
     |_____ certificates
                 |_____letsencrypt-prod-cert.yaml
                 |_____letsencrypt-staging-cert.yaml
     |_____ issuer
                 |_____acme-prod.yaml
                 |_____ acme-staging.yaml
     |_____ values.yml
```

values.yml

```jsx
installCRDs: true
replicaCount: 3
extraArgs:
  - --dns01-recursive-nameservers=1.1.1.1:53,9.9.9.9:53
  - --dns01-recursive-nameservers-only
podDnsPolicy: None
podDnsConfig:
  nameservers:
    - "1.1.1.1"
    - "9.9.9.9"
```

issuer/acme-staging.yaml

```jsx
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-staging
spec:
  acme:
    email: {email}
    server: https://acme-staging-v02.api.letsencrypt.org/directory
    privateKeySecretRef:
      name: letsencrypt-staging
    solvers:
    - http01:
        ingress:
          ingressClassName: traefik
```

certificates/letsencrypt-staging-cert.yaml

```jsx
apiVersion: cert-manager.io/v1
kind: Certificate
metadata:
  name: {DomainName}-staging
  namespace : my-app
spec:
  secretName: letsencrypt-staging-pub
  issuerRef:
    name: letsencrypt-staging  # Le nom de votre ClusterIssuer
    kind: ClusterIssuer
  commonName: {DomainName}
  dnsNames:
    - {DomainName}
```

Une fois que ces trois éléments on été préparé, nous allons créer un nouveau paybook Ansible

```jsx
ansible
	 |____ inventory
	 |____ playbook
	           |____ traefik
	                    |____ traefik-playbook.yaml
	           |____ cert-manager
	                    |____ cert-manager-playbook.yaml
```

cert-manager-playbook.yaml

```jsx
- hosts: localhost
  gather_facts: false
  vars:
    cert_manager_namespace: my-app
    kubeconfig_path: /Users/sakolinsb/Lab/terraform/Lab-Terraform/Cluster-Kubernetes/ansible/inventory/kubeconfig.yml
  tasks:

########## Create namespace ##########

  - name: Create {{ cert_manager_namespace }} namespace
    k8s:
     kubeconfig: "{{ kubeconfig_path }}"
     name: "{{ cert_manager_namespace }}"
     api_version: v1
     kind: Namespace
     state: present


########## Add helm repository ##########


  - name: Add cert-manager Helm charts repository
    kubernetes.core.helm_repository:
      kubeconfig: "{{ kubeconfig_path }}"
      name: cert-manager
      repo_url: https://charts.jetstack.io

########## Install chart ##########


  - name: Install Cert-Manager chart
    kubernetes.core.helm:
      kubeconfig: "{{ kubeconfig_path }}"
      name: cert-manager
      namespace: "{{ cert_manager_namespace }}"
      chart_ref: cert-manager/cert-manager
      chart_version: "v1.15.0" # Specify the desired version here
      values: "{{ lookup('file', '{path to dir}/cert-manager/values.yml') | from_yaml }}"

 - name: Apply issuers.yml
    kubernetes.core.k8s:
      kubeconfig: "{{ kubeconfig_path }}"
      src: {path to dir}/cert-manager/issuer/acme-staging.yaml
      state: present

  - name: Apply certificates.yml
    kubernetes.core.k8s:
      kubeconfig: "{{ kubeconfig_path }}"
      src: {path to dir}/cert-manager/certificates/letsencrypt-staging-cert.yaml
      state: present


```

On exécute notre playbook

```jsx
ansible-playbook cert-manager-playbook.yaml                                                                                           ─╯
```

On peut ensuite contrôler l’état de nos certificats via la commande ci-dessous

```jsx
kubectl get certificate -n my-app
```

Puis contrôler si nos secret on bien était créé.
Nos secret contiennent la clef privée et public de nos certificats

![Untitled](Untitled%203.png)

Une fois que le certificats fonctionne en mode staging, nous pouvons le faire en mode production.

certificates/letsencrypt-prod-cert.yaml

```jsx
apiVersion: cert-manager.io/v1
kind: Certificate
metadata:
  name: {DomainName}-prod
  namespace : my-app
spec:
  secretName: letsencrypt-prod-pub
  issuerRef:
    name: letsencrypt-prod  # Le nom de votre ClusterIssuer
    kind: ClusterIssuer
  commonName: {DomainName}  # Remplacez par votre domaine
  dnsNames:
    - {DomainName}       # Remplacez par votre domaine
```

issuer/acme-prod.yaml

```jsx
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    email: {email}
    server: https://acme-v02.api.letsencrypt.org/directory
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
    - http01:
        ingress:
          ingressClassName: traefik
```

On modifie le playbook pour appliquer les bons fichiers puis on exécute la commande ansible.

## **Etape 3 - installation de l’application**

Pour finir nous n’avons plus qu’à installer notre application.

### my-app

Pour cela, on crée un nouveau playbook ansible

```jsx
ansible
	 |____ inventory
	 |____ playbook
	           |____ traefik
	                    |____ traefik-playbook.yaml
	           |____ cert-manager
	                    |____ cert-manager-playbook.yaml
	           |____ my-app
	                    |_____ my-app
	                              |____ my-app-playbook.yaml
```

my-app-playbook.yaml

```jsx
- hosts: localhost
  gather_facts: false
  vars:
    docker_server: { gitlab private repository
    docker_username: { gitlab username }
    docker_password: { gitlab API key }
    docker_email: { gitlab email }
    app_namespace: my-app
    traefik_namespace: traefik
    cert_manager_namespace: cert-manager
    kubeconfig_path: {path to dir}/ansible/inventory/kubeconfig.yml
    my-apppasswordcloud: {Websocket API key }
    repo_url: {{ url du repo }}
  tasks:

########## Create namespace ##########

  - name: Create {{ app_namespace }} namespace
    k8s:
     kubeconfig: "{{ kubeconfig_path }}"
     name: "{{ app_namespace }}"
     api_version: v1
     kind: Namespace
     state: present

########## Add helm repository ##########

  - name: Add my-app Helm charts repository
    kubernetes.core.helm_repository:
      kubeconfig: "{{ kubeconfig_path }}"
      name: coop.ink
      repo_url: {{ repo_url }}
      repo_username: {{ docker_username }}
      repo_password: {{ docker_password }}

########## Create secret ##########

  - name: Encode Docker credentials in base64
    set_fact:
      docker_credentials_b64: "{{ (docker_username + ':' + docker_password) | b64encode }}"
  - name: Create secret
    kubernetes.core.k8s:
      kubeconfig: "{{ kubeconfig_path }}"
      state: present
      definition:
        apiVersion: v1
        kind: Secret
        type: kubernetes.io/dockerconfigjson
        metadata:
          name: regcred
          namespace: "{{ app_namespace }}"
        data:
          .dockerconfigjson: "{{ {'auths': {docker_server: {'auth': docker_credentials_b64, 'email': docker_email}} } | to_json | b64encode }}"
  - name: Create Websocket secret
    kubernetes.core.k8s:
      kubeconfig: "{{ kubeconfig_path }}"
      state: present
      definition:
        apiVersion: v1
        kind: Secret
        type: Opaque
        metadata:
          name: "websocket-app-key"
          namespace: "{{ app_namespace }}"
        data:
          app-key: "{{ my-apppasswordcloud | b64encode }}"

########## Install chart ##########

  - name: Install my-app Chart
    kubernetes.core.helm:
      kubeconfig: "{{ kubeconfig_path }}"
      name: coop-ink
      namespace: "{{ app_namespace }}"
      chart_ref: coop.ink/coop-ink
      chart_version: 0.5


```

On exécute le playbook

```jsx
ansible-playbook my-app-playbook.yaml
```

### PostgreSQL

Ensuite la BDD

```jsx
ansible
	 |____ inventory
	 |____ playbook
	           |____ traefik
	                    |____ traefik-playbook.yaml
	           |____ cert-manager
	                    |____ cert-manager-playbook.yaml
	           |____ my-app
	                    |_____ my-app
	                              |____ my-app-playbook.yaml
	                    |_____ postgreSQL
	                              |____ deployment
	                                        |_____ postgres-deployment.yaml
	                              |____ service
	                                        |_____ postgres-service.yaml
	                              |____ PersistantStorageVolume
	                                        |_____ postgres-pv.yaml
	                              |____ PersistantVolumeClaim
	                                        |_____ postgres-pvc.yaml
	                              |____ postgres-playbook.yaml

```

deployment/postgres-deployment.yaml

```jsx
apiVersion: apps/v1
kind: Deployment
metadata:
  name: postgres-deployment
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
      volumes:
        - name: pg-data
          configMap:
            name: pg-data
      containers:
        - name: postgres
          image: postgres:alpine3.18
          env:
            - name: POSTGRES_DB
              value: my-app
            - name: POSTGRES_USER
              value: my-app
            - name: POSTGRES_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: pgsql-secret
                  key: password
          ports:
            - containerPort: 5432
          volumeMounts:
            - name: pg-data
              mountPath: /docker-entrypoint-initdb.d

```

service/postgres-service.yaml

```jsx
apiVersion: v1
kind: Service
metadata:
  name: postgres
spec:
  selector:
    app: postgres
  ports:
    - protocol: TCP
      port: 5432
      targetPort: 5432
```

PersistantStorageVolume/postgres-pv.yaml

```jsx
apiVersion: v1
kind: PersistentVolume
metadata:
  name: postgresql-pv
  labels:
    type: local
spec:
  storageClassName: manual
  capacity:
    storage: 10Gi
  accessModes:
    - ReadWriteOnce
  hostPath:
    path: "/mnt/data"
```

PersistantVolumeClaim/postgres-pvc.yaml

```jsx
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: postgresql-pv-claim
spec:
  storageClassName: manual
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 10Gi
```

postgres-playbook.yaml

```jsx
- hosts: localhost
  gather_facts: false
  vars:
    postgres_db: my-app
    postgres_user: my-app
    postgres_password: {postgres password}
    postgresql_pod_name: postgresql
    postgres_namespace: my-app
    kubeconfig_path: {path to dir}/ansible/inventory/kubeconfig.yml
    postgres_dir: {path to dir}/ansible/playbook/PostgreSQL
  tasks:

########## Create namespace ##########
  - name: Create {{ postgres_namespace }} namespace
    k8s:
     kubeconfig: "{{ kubeconfig_path }}"
     name: "{{ postgres_namespace }}"
     api_version: v1
     kind: Namespace
     state: present

########## Create pgsql secret ##########
  - name: Create pgsql secret
    kubernetes.core.k8s:
      kubeconfig: "{{ kubeconfig_path }}"
      state: present
      definition:
        apiVersion: v1
        kind: Secret
        type: Opaque
        metadata:
          name: "pgsql-secret"
          namespace: "{{ postgres_namespace }}"
        data:
          password: "{{ postgres_password | b64encode }}"

########## Create pgsql secret ##########

  - name: Create ConfigMap with PostgreSQL data
    kubernetes.core.k8s:
      kubeconfig: "{{ kubeconfig_path }}"
      namespace: "{{ postgres_namespace }}"
      definition:
        apiVersion: v1
        kind: ConfigMap
        metadata:
          name: pg-data
        data:
          data.sql: "{{ lookup('file', '{path to dir}/coop.ink/database/my-app-pgsql.sql') }}"
      state: present

  - name: Apply PVC
    kubernetes.core.k8s:
      kubeconfig: "{{ kubeconfig_path }}"
      namespace: "{{ postgres_namespace }}"
      src: "{{ postgres_dir }}/PersistantVolumeClaim/postgres-pvc.yaml"
      state: present

  - name: Apply PV
    kubernetes.core.k8s:
      kubeconfig: "{{ kubeconfig_path }}"
      namespace: "{{ postgres_namespace }}"
      src: "{{ postgres_dir }}/PersistantStorageVolume/postgres-pv.yaml"
      state: present

  - name: Apply services
    kubernetes.core.k8s:
      kubeconfig: "{{ kubeconfig_path }}"
      namespace: "{{ postgres_namespace }}"
      src: "{{ postgres_dir }}/service/postgres-service.yaml"
      state: present

  - name: Apply deployment
    kubernetes.core.k8s:
      kubeconfig: "{{ kubeconfig_path }}"
      namespace: "{{ postgres_namespace }}"
      src: "{{ postgres_dir }}/deployment/postgres-deploymentImport.yaml"
      state: present
```

Ref :

- Gitlab Personnal acces token : [https://docs.gitlab.com/ee/user/profile/personal_access_tokens.html](https://docs.gitlab.com/ee/user/profile/personal_access_tokens.html)

## Etape 4 - Gestion de la BDD

Pour améliorer l'efficacité et la simplicité de la gestion de notre base de données PostgreSQL, il est recommandé d'installer l'interface graphique utilisateur (GUI) pgAdmin.

Cette interface permettra une interaction plus aisée avec la base de données, facilitant ainsi les tâches de surveillance et de maintenance.
Une fois installée, l'interface pgAdmin devrait être accessible via le prefix /pgadmin4.

![Untitled](Untitled%204.png)

### Installation pgadmin

pgadmin/pgadmin-deployment.yaml

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: pgadmin
  namespace: my-app
spec:
  replicas: 1
  selector:
    matchLabels:
      app: pgadmin
  template:
    metadata:
      labels:
        app: pgadmin
    spec:
      containers:
        - name: pgadmin
          image: dpage/pgadmin4
          env:
            - name: PGADMIN_DEFAULT_EMAIL
              value: "admin@example.com"
            - name: PGADMIN_DEFAULT_PASSWORD
              value: "SuperSecret"
            - name: SCRIPT_NAME
              value: "/pgadmin4"
          ports:
            - containerPort: 80
```

```yaml
kubectl apply -f pgadmin/pgadmin-deployment.yaml
```

pgadmin/pgadmin-service.yaml

```yaml
apiVersion: v1
kind: Service
metadata:
  name: pgadmin
  namespace: my-app
spec:
  selector:
    app: pgadmin
  ports:
    - name: http
      port: 80
      targetPort: 80
  type: ClusterIP
```

```yaml
kubectl apply -f pgadmin/pgadmin-service.yaml
```

pgadmin/pgadmin-ingress.yaml

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: pgadmin-ingress
  namespace: my-app
  annotations:
    kubernetes.io/ingress.class: traefik
    traefik.ingress.kubernetes.io/rule-type: PathPrefix
    traefik.ingress.kubernetes.io/frontend-entry-points: http
spec:
  rules:
    - host: { domaine_name }
      http:
        paths:
          - path: /pgadmin4
            pathType: Prefix
            backend:
              service:
                name: pgadmin
                port:
                  name: http
```

```yaml
kubectl apply -f pgadmin/pgadmin-ingress.yaml
```

ref:

- Documentation officiel pgadmin : h[ttps://www.pgadmin.org/docs/pgadmin4/latest/container_deployment.html](https://www.pgadmin.org/docs/pgadmin4/latest/container_deployment.html)
- Image officiel : [https://hub.docker.com/r/dpage/pgadmin4](https://hub.docker.com/r/dpage/pgadmin4)
- Connect pgadmin to postgreSQL: [https://www.highgo.ca/2023/11/06/managing-postgresql-like-a-pro-a-kubernetes-based-pgadmin-tutorial/](https://www.highgo.ca/2023/11/06/managing-postgresql-like-a-pro-a-kubernetes-based-pgadmin-tutorial/)

## Infrastructure final

![Untitled](Untitled%204.png)
