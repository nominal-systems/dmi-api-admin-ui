import Alpine from 'alpinejs'
import table from './plugins/table'
import { getPractices } from './api-client'
import { getProviderConfig, getQueryParams } from './common/utils'
import config from './config'

export const practices = {
  // Table
  table: table({
    pageSize: 20,
    _search: {
      placeholder: 'Search by name...'
    },
    getPage: async (page, pageSize) => {
      const query = getQueryParams()
      return await getPractices({ search: query.search }, page, pageSize)
    },
    processResults: (practices) => {
      practices.forEach(practice => {
        practice.integrations.forEach(integration => {
          integration.provider = getProviderConfig(integration.providerConfiguration.providerId)
        })
        practice.integrations.sort((a, b) => a.provider.label.localeCompare(b.provider.label))
        practice.integrationsUrl = `${config.get('UI_BASE')}/integrations?practices=${practice.id}&status=RUNNING`
      })
    }
  }),
  init() {
    Alpine.store('title').set('Practices')
  }
}
