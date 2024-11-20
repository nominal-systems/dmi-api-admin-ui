import Alpine from 'alpinejs'
import { getEvent, getEvents, getPractices, getProviders } from './api-client'
import table from './plugins/table'
import config from './config'
import { getProviderConfig, getQueryParams, isNullOrUndefined } from './common/utils'
import moment from 'moment'
import { DATE_FORMAT } from './constants/date-format'
import modal from './plugins/modal'
import { parseDateRange } from './common/date-utils'

export const events = {
  // Table
  table: table(
    {
      pageSize: 20,
      getPage: async (page, pageSize) => {
        const query = getQueryParams()
        const providers = query.provider ? query.provider.split(',') : undefined
        const integrations = query.integration ? query.integration.split(',') : undefined
        const types = query.type ? query.type.split(',') : undefined
        const date = query.date ? parseDateRange(query.date) : undefined

        return await getEvents({ providers, integrations, types, date }, page, pageSize)
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
        date: {
          id: 'date',
          type: 'date',
          label: 'Date',
          updateQuery: true,
          toggleEnabled: false,
          items() {
            const today = moment().startOf('day').format(DATE_FORMAT)
            const yesterday = `${moment().subtract(1, 'days').startOf('day').format(DATE_FORMAT)}`
            const lastWeek = `${moment().subtract(7, 'days').startOf('day').format(DATE_FORMAT)}-${today}`
            const lastMonth = `${moment().subtract(30, 'days').startOf('day').format(DATE_FORMAT)}-${today}`
            return [
              { label: 'Today', value: today },
              { label: 'Yesterday', value: yesterday },
              { label: 'Last 7 days', value: lastWeek },
              { label: 'Last 30 days', value: lastMonth }
            ]
          }
        }
      }
    }
  ),

  // Modal
  modal: modal(
    {
      ref: 'eventModal',
      onHide: (component) => {
        component.event = null
      }
    }
  ),
  async openModal(ev) {
    this.event = await getEvent(ev._id)
    this.modal.open()
  },
  event: null,

  init() {
    Alpine.store('title').set('Events')
  }
}
