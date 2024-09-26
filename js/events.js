import { getEvent, getEvents, getIntegrations } from './api-client'
import { Modal } from 'flowbite'
import table from './plugins/table'
import config from './config'
import { getQueryParams } from './common/utils'
import moment from 'moment'
import { DATE_FORMAT } from './constants/date-format'

export const events = {
  // Table
  table: table(
    {
      pageSize: 20,
      getPage: async (page, pageSize) => {
        const query = getQueryParams()
        const integrations = query.integration ? query.integration.split(',') : undefined
        const types = query.type ? query.type.split(',') : undefined
        const date = query.date ? query.date.split(',') : undefined

        return await getEvents(integrations, types, date, page, pageSize)
      },
      processResults: (events) => {
        events.forEach((event) => {
          event.url = `${config.get('UI_BASE')}/events/${event._id}`
        })
      },
      filter: {
        integration: {
          id: 'integration',
          type: 'checkbox',
          label: 'Integration',
          updateQuery: true,
          items: async () => {
            return (await getIntegrations()).map((integration) => {
              return {
                label: integration.id,
                value: integration.id
              }
            })
          },
          dropdownOptions: {
            width: '84'
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
  modal: null,
  modalEvent: null,
  async openModal(ev) {
    this.modalEvent = await getEvent(ev._id)
    this.modal.show()
  },
  closeModal() {
    this.modalEvent = null
    this.modal.hide()
  },
  initModal() {
    const modalOptions = {
      placement: 'bottom-right',
      backdrop: 'dynamic',
      backdropClasses: 'bg-gray-900 bg-opacity-50 dark:bg-opacity-80 fixed inset-0 z-40',
      closable: true
    }
    this.modal = new Modal(this.$refs['eventModal'], modalOptions)
  },

  async init() {
    this.initModal()
  }
}
