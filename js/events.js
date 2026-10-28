import Alpine from 'alpinejs'
import { getEvent, getEvents, getPractices, getProviders } from './api-client'
import table from './plugins/table'
import config from './config'
import { buildIntegrationField, getProviderConfig, getQueryParams, isNullOrUndefined } from './common/utils'
import modal from './plugins/modal'
import { fetchIntegrationField } from './common/integration-field'
import { dateFilterConfig, parseDateRangeQuery, validateDateRangeLimit } from './common/date-utils'

export const events = {
  // Table
  table: table(
    {
      pageSize: 20,
      _search: {
        placeholder: 'Search by practice...'
      },
      getPage: async (page, pageSize) => {
        const query = getQueryParams()
        const providers = query.provider ? query.provider.split(',') : undefined
        const integrations = query.integration ? query.integration.split(',') : undefined
        const types = query.type ? query.type.split(',') : undefined
        // Requests are always bounded: fall back to today when the date filter is missing
        const date = parseDateRangeQuery(query.date)
        validateDateRangeLimit(date)
        const search = query.search || undefined

        return await getEvents({ providers, integrations, types, date, search }, page, pageSize)
      },
      processResults: async (events) => {
        const practiceIds = [...new Set(
          events.filter((event) => !isNullOrUndefined(event.practiceId)).map((event) => event.practiceId)
        )]
        const practices = (await getPractices(practiceIds, 1, 1000)).data
        events.forEach((event) => {
          event.provider = getProviderConfig(event.providerId) || {}
          event.practice = practices.find((practice) => practice.id === event.practiceId) || {}
          event.url = `${config.get('UI_BASE')}/events/${event._id}`
        })
      },
      filter: {
        provider: {
          id: 'provider',
          type: 'checkbox',
          label: 'Provider',
          updateQuery: true,
          async items() {
            return (await getProviders()).map((provider) => {
              return {
                label: getProviderConfig(provider.id).label,
                value: provider.id,
              }
            })
          },
          dropdownOptions: {
            width: '52'
          }
        },
        type: {
          id: 'type',
          type: 'checkbox',
          label: 'Type',
          updateQuery: true,
          items() {
            return [
              { label: 'Order Created', value: 'order:created' },
              { label: 'Order Updated', value: 'order:updated' },
              { label: 'Report Created', value: 'report:created' },
              { label: 'Report Updated', value: 'report:updated' }
            ]
          }
        },
        date: dateFilterConfig()
      }
    }
  ),

  // Modal
  modal: modal({
    ref: 'eventModal'
  }),
  async openModal(ev) {
    this.event = null
    const event = await getEvent(ev._id)
    event.integration = buildIntegrationField(event.integrationId)
    this.event = event
    this.modal.open()
    const integration = await fetchIntegrationField(event.integrationId)
    if (this.event?._id === event._id) {
      this.event.integration = integration
    }
  },
  event: null,

  init() {
    Alpine.store('title').set('Events')
  }
}
