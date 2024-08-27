import { getEvents, getIntegrations } from './api-client'
import { Modal } from 'flowbite'
import table from './plugins/table'
import config from './config'
import { getQueryParams } from './utils'

export const events = {
  // Table
  table: null,
  fetching: true,
  initTable() {
    this.table = table(
      {
        pageSize: 20,
        pagesMax: 10,
      }, async (page, pageSize) => {
        this.fetching = true
        const query = getQueryParams()
        const integrations = query.integration ? query.integration.split(',') : undefined

        const events = await getEvents(integrations, page, pageSize)
        events.data.map((ev) => {
          ev.url = `${config.get('UI_BASE')}/events/${ev._id}`
          return ev
        })
        this.fetching = false
        return events
      })
  },
  async fetch(page, pageSize) {
    await this.table.getPage(1)
  },

  // Table filter
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
  },

  // Modal
  modal: null,
  modalEvent: null,
  openModal(ev) {
    this.modalEvent = ev
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
    this.initTable()
  }
}
