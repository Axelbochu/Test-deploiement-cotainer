# POC - Déploiement de Containers sur Azure

Projet de démonstration d'une application Next.js déployée sur Azure Container Apps, capable de spawner dynamiquement des containers Azure Container Instances.

## 📋 Architecture

Le projet est composé de deux parties principales :

- **`my-app/`** : Application Next.js avec une API pour créer des containers à la demande
- **`infra/`** : Infrastructure Terraform pour déployer l'application sur Azure

### Stack Technique

- **Frontend/Backend** : Next.js 15 avec App Router
- **Infrastructure as Code** : Terraform
- **Cloud Provider** : Microsoft Azure
  - Azure Container Apps (pour l'application web)
  - Azure Container Instances (pour les containers dynamiques)
- **Authentification** : Azure Managed Identity
- **Containerization** : Docker

## 🚀 Démarrage Rapide

### Prérequis

- Node.js 20+
- Docker
- Azure CLI (`az login` configuré)
- Terraform

### Développement Local

1. **Installer les dépendances**

```bash
cd my-app
npm install
```

2. **Configurer les variables d'environnement**

Créer un fichier `.env.local` dans `my-app/` :

```env
AZURE_SUBSCRIPTION_ID=votre-subscription-id
AZURE_RESOURCE_GROUP=rg-poc-test
```

3. **Lancer le serveur de développement**

```bash
npm run dev
```

L'application sera accessible sur [http://localhost:3000](http://localhost:3000)

### Build de l'image Docker

```bash
cd my-app
docker build -t poc-azure:latest .
docker tag poc-azure:latest aqssel/poc-azure:v2
docker push aqssel/poc-azure:v2
```

## ☁️ Déploiement sur Azure

### 1. Déployer l'infrastructure

```bash
cd infra
terraform init
terraform plan
terraform apply
```

Cela créera :

- Un Resource Group `rg-poc-test`
- Un environnement Container Apps
- L'application web avec une identité managée
- Les permissions nécessaires pour créer des containers

### 2. Récupérer l'URL de l'application

```bash
terraform output
```

ou via Azure CLI :

```bash
az containerapp show --name app-poc-spawner --resource-group rg-poc-test --query properties.configuration.ingress.fqdn
```

## 🔧 Fonctionnalités

### API Endpoint : Spawn Container

**POST** `/api/spawn`

Crée un nouveau Azure Container Instance avec une image nginx de démonstration.

**Réponse** :

```json
{
  "success": true,
  "message": "Container launching",
  "data": { ... }
}
```

Le container créé :

- Nom aléatoire : `challenge-XXXX`
- Image : `mcr.microsoft.com/azuredocs/aci-helloworld`
- Accessible publiquement sur le port 80
- Politique de redémarrage : `Never`

## 🔐 Sécurité

L'application utilise une **Managed Identity** Azure pour s'authentifier. Cela signifie :

- ✅ Pas de secrets/credentials dans le code
- ✅ Permissions gérées via Azure RBAC
- ✅ Role `Contributor` sur le Resource Group uniquement

## 📁 Structure du Projet

```
.
├── my-app/                     # Application Next.js
│   ├── src/
│   │   └── app/
│   │       ├── api/spawn/      # API pour créer des containers
│   │       └── page.tsx        # Interface utilisateur
│   ├── Dockerfile              # Image Docker de l'app
│   └── package.json
│
└── infra/                      # Infrastructure Terraform
    └── main.tf                 # Ressources Azure
```

## ⚠️ Important - Fichiers à ne PAS commiter

Le `.gitignore` est configuré pour exclure :

- `.terraform/` - Providers Terraform (très volumineux)
- `*.tfstate` - État Terraform (peut contenir des secrets)
- `node_modules/` - Dépendances Node.js
- `.env.local` - Variables d'environnement locales

## 🧹 Nettoyage

Pour supprimer toutes les ressources Azure créées :

```bash
cd infra
terraform destroy
```

## 🐛 Troubleshooting

### Erreur "failed to push" avec Git

Si vous avez cette erreur, c'est probablement que `.terraform/` a été commité. Solution :

```bash
git reset --soft HEAD~1
git reset HEAD .
git add .
git commit -m "votre message"
git push
```

### Erreur d'authentification Azure

Vérifiez que vous êtes connecté :

```bash
az login
az account show
```

### Container ne démarre pas

Vérifiez les logs dans Azure Portal ou via CLI :

```bash
az container logs --resource-group rg-poc-test --name challenge-XXX
```

## 📚 Documentation Utile

- [Next.js Documentation](https://nextjs.org/docs)
- [Azure Container Apps](https://learn.microsoft.com/azure/container-apps/)
- [Azure Container Instances](https://learn.microsoft.com/azure/container-instances/)
- [Terraform Azure Provider](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs)
