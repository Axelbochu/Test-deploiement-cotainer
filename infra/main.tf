provider "azurerm" {
  features {}
  subscription_id = "5b4eba05-95c0-43c2-9035-fe85eab20818"
}

resource "azurerm_resource_group" "rg" {
  name     = "rg-poc-test"
  location = "West Europe"
}

# 1. Environnement pour Container Apps
resource "azurerm_container_app_environment" "env" {
  name                = "env-poc"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
}

# 2. L'App Next.js
resource "azurerm_container_app" "web_app" {
  name                         = "app-poc-spawner"
  container_app_environment_id = azurerm_container_app_environment.env.id
  resource_group_name          = azurerm_resource_group.rg.name
  revision_mode                = "Single"

  # ACTIVATION DE L'IDENTITÉ MANAGÉE (Vital pour la sécurité)
  identity {
    type = "SystemAssigned"
  }

  ingress {
    external_enabled = true
    target_port      = 3000
    traffic_weight {
      percentage = 100
      latest_revision = true
    }
  }

  template {
    container {
      name   = "nextjs"
      image  = "aqssel/poc-azure:v2"
      cpu    = 0.5
      memory = "1Gi"

      # Variables d'environnement pour que le code sache où taper
      env {
        name  = "AZURE_SUBSCRIPTION_ID"
        value = "5b4eba05-95c0-43c2-9035-fe85eab20818" 
      }
      env {
        name  = "AZURE_RESOURCE_GROUP"
        value = azurerm_resource_group.rg.name
      }
    }
  }
}

# 3. Attribution des droits : L'app a le droit de modifier le Resource Group
resource "azurerm_role_assignment" "allow_spawn" {
  scope                = azurerm_resource_group.rg.id
  role_definition_name = "Contributor"
  principal_id         = azurerm_container_app.web_app.identity[0].principal_id
}