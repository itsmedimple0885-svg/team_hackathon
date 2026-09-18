targetScope = 'subscription'

param location string = resourceGroup().location
param projectName string = 'prod-dashboard'

resource rg 'Microsoft.Resources/resourceGroups@2021-04-01' existing = {
  name: 'RG-Dashboard'
}

// Placeholder resources: App Service Plan, Web App, Key Vault, Azure Cognitive Search
// TODO: customize sizes, SKUs, and add Azure OpenAI & SQL

output note string = 'This Bicep file is a scaffold. Update with real resource names, SKUs, and parameters.'
