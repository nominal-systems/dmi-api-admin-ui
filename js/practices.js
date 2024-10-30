import Alpine from 'alpinejs'
import table from './plugins/table'
import { getPractices } from './api-client'
import { getProviderConfig } from './common/utils'

export const practices = {
  // Table
  table: table({
    pageSize: 20,
    getPage: async (page, pageSize) => {
      return await getPractices(page, pageSize)
    },
    processResults: (practices) => {
      practices.forEach(practice => {
        practice.integrations.forEach(integration => {
          integration.provider = getProviderConfig(integration.providerConfiguration.providerId)
        })
        practice.integrations.sort((a, b) => a.provider.label.localeCompare(b.provider.label))
      })
    }
  }),
  init() {
    Alpine.store('title').set('Practices')
  }
}
