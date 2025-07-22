import Alpine from 'alpinejs'
import { getProviderConfigurations } from './api-client'
import { getProviderConfig } from './common/utils'
import table from './plugins/table'
import config from './config'

export const providerConfigurations = {
  setTitle: () => {
    Alpine.store('title').set('Provider Configurations')
  },
  table: table({
    pageSize: 10,
    getPage: async (page, pageSize) => {
      return await getProviderConfigurations({}, page, pageSize)
    },
    processResults: (configs) => {
      configs.forEach(cfg => {
        cfg.providerLabel = getProviderConfig(cfg.providerId).label
        cfg.url = `${config.get('UI_BASE')}/provider-configurations/${cfg.id}`
      })
    },
  })
}
