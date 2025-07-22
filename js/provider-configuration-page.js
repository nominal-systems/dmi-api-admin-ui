import Alpine from 'alpinejs'
import table from './plugins/table'
import modal from './plugins/modal'
import config from './config'
import { getIdFromPath, getIntegrationConfig, getProviderConfig } from './common/utils'
import { getIntegrations, getProviderConfiguration, updateProviderConfiguration } from './api-client'

export const providerConfigurationPage = {
  providerConfig: {},
  table: table({
    pageSize: 10,
    getPage: async (page, pageSize) => {
      return await getIntegrations({ providerConfigurations: [getIdFromPath()] }, page, pageSize)
    },
    processResults: (integrations) => {
      integrations.forEach(integration => {
        const cfg = getIntegrationConfig(integration.status)
        integration.color = cfg.color
        integration.url = `${config.get('UI_BASE')}/integrations/${integration.id}`
        integration.providerLabel = getProviderConfig(integration.providerConfiguration.providerId).label
      })
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
      self.data.config = JSON.stringify(self.page.providerConfig.configurationOptions, null, 2)
    },
    onHide: async (self) => {
      await self.page.loadConfig()
    }
  }),
  async init() {
    this.providerConfigModal.page = this
    await this.loadConfig()
    await this.table.fetchData()
  },
  async loadConfig() {
    const cfg = await getProviderConfiguration(getIdFromPath())
    cfg.providerLabel = getProviderConfig(cfg.providerId).label
    Alpine.store('title').set(`Provider Configuration ${cfg.id}`)
    this.providerConfig = cfg
  },
  async saveProviderConfig(data) {
    data.error = null
    data.inProgress = true
    let conf
    try {
      conf = JSON.parse(data.config)
    } catch (e) {
      data.inProgress = false
      data.error = { message: 'Invalid JSON.' }
      return
    }
    await updateProviderConfiguration(this.providerConfig.id, { configuration: conf })
      .then(() => {
        data.inProgress = false
        this.providerConfigModal.close()
        Alpine.store('alert').set('info', 'Provider configuration updated.')
        this.loadConfig()
      })
      .catch(err => {
        data.inProgress = false
        data.error = { message: err.body.error }
      })
  }
}
