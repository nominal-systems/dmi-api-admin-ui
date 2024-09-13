import { getIdFromPath } from './common/utils'
import { getIntegration } from './api-client'

export const integrationPage = {
  integration: {},
  async init() {
    const integration = await getIntegration(getIdFromPath())
    integration.color = integration.status === 'RUNNING' ? 'green' : 'red'
    this.integration = integration
  }
}
