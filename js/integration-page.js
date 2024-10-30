import Alpine from 'alpinejs'
import { getIdFromPath, getIntegrationConfig } from './common/utils'
import { getIntegration } from './api-client'

export const integrationPage = {
  integration: {},
  async init() {
    const integration = await getIntegration(getIdFromPath())
    Alpine.store('title').set(`Integration ${integration.id}`)
    integration.color = (getIntegrationConfig(integration.status)).color
    this.integration = integration
  }
}
