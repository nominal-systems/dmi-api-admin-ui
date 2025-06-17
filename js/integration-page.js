import Alpine from 'alpinejs'
import { getIdFromPath, getIntegrationConfig } from './common/utils'
import {
  getIntegration,
  updateIntegrationOptions,
  updateIntegrationStatus,
  updateProviderConfiguration
} from './api-client'
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
  optionsModal: modal({
    ref: 'optionsModal',
    data: {
      options: '',
      inProgress: false,
      error: null
    },
    onShow: (self) => {
      self.data.error = null
      self.data.inProgress = false
      self.data.options = JSON.stringify(self.page.integration.integrationOptions, null, 2)
    },
    onHide: async (self) => {
      if (self.page) {
        await self.page.loadIntegration()
      }
    }
  }),
  providerConfigModal: modal({
    ref: 'providerConfigModal',
    data: {
      config: '',
      inProgress: false,
      error: null
    },
    onShow: (self) => {
      self.data.error = null
      self.data.inProgress = false
      self.data.config = JSON.stringify(self.page.integration.providerConfiguration?.configurationOptions, null, 2)
    },
    onHide: async (self) => {
      if (self.page) {
        await self.page.loadIntegration()
      }
    }
  }),
  async init() {
    this.actionModal.page = this
    this.optionsModal.page = this
    this.providerConfigModal.page = this
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
  },
  async saveOptions(data) {
    data.error = null
    data.inProgress = true
    let opts
    try {
      opts = JSON.parse(data.options)
    } catch (e) {
      data.inProgress = false
      data.error = { message: 'Invalid JSON.' }
      return
    }
    await updateIntegrationOptions(this.integration.id, opts)
      .then(() => {
        data.inProgress = false
        this.optionsModal.close()
        Alpine.store('alert').set('info', 'Integration options updated.')
      })
      .catch(err => {
        data.inProgress = false
        data.error = { message: err.body.error }
      })
  },
  async saveProviderConfig(data) {
    data.error = null
    data.inProgress = true
    let cfg
    try {
      cfg = JSON.parse(data.config)
    } catch (e) {
      data.inProgress = false
      data.error = { message: 'Invalid JSON.' }
      return
    }
    await updateProviderConfiguration(this.integration.providerConfiguration.id, { configuration: cfg })
      .then(() => {
        data.inProgress = false
        this.providerConfigModal.close()
        Alpine.store('alert').set('info', 'Provider configuration updated.')
      })
      .catch(err => {
        data.inProgress = false
        data.error = { message: err.body.error }
      })
  }
}
