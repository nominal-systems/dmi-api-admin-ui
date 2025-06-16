import Alpine from 'alpinejs'
import { getIdFromPath, getIntegrationConfig } from './common/utils'
import { getIntegration, updateIntegrationStatus } from './api-client'
import modal from './plugins/modal'

export const integrationPage = {
  integration: {},
  actionModal: modal({
    ref: 'integrationModal',
    data: {
      inProgress: false,
      operation: null,
      integration: null
    },
    onShow: (self, data) => {
      data.error = null
      data.inProgress = false
    },
    onHide: async (self) => {
      self.operation = null
      if (self.page) {
        await self.page.loadIntegration()
      }
    }
  }),
  async init() {
    this.actionModal.page = this
    await this.loadIntegration()
  },
  async loadIntegration() {
    const integration = await getIntegration(getIdFromPath())
    Alpine.store('title').set(`Integration ${integration.id}`)
    const cfg = getIntegrationConfig(integration.status)
    integration.color = cfg.color
    integration.operations = cfg.operations
    this.integration = integration
  },
  async updateIntegrationStatus(data) {
    data.error = null
    data.inProgress = true
    await updateIntegrationStatus(data.integration.id, data.operation)
      .then(() => {
        data.inProgress = false
        this.actionModal.close()
        Alpine.store('alert')
          .set('info', `Integration ${data.integration.id} ${data.operation}${data.operation === 'stop' ? 'p' : ''}ed.`)
      })
      .catch(err => {
        data.inProgress = false
        data.error = {
          message: err.body.error
        }
      })
  }
}
