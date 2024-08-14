import { getExternalRequest, getExternalRequests } from './api-client'
import { Modal } from 'flowbite'
import table from './plugins/table'
import { PROVIDERS } from './constants/provider-list'

export const externalRequests = () => {
  return {
    providers: [],

    // Modal
    modal: null,
    externalRequest: null,
    async openModal(externalRequest) {
      this.externalRequest = await getExternalRequest(externalRequest._id)
      this.modal.show()
    },
    closeModal() {
      this.externalRequest = null
      this.modal.hide()
    },
    initModal() {
      const modalOptions = {
        placement: 'bottom-right',
        backdrop: 'dynamic',
        backdropClasses: 'bg-gray-900 bg-opacity-50 dark:bg-opacity-80 fixed inset-0 z-40',
        closable: true
      }
      this.modal = new Modal(this.$refs['externalRequestModal'], modalOptions)
    },

    // Filter
    filter: {
      status: [
        { label: '2xx', value: '2xx', checked: false },
        { label: '3xx', value: '3xx', checked: false },
        { label: '4xx', value: '4xx', checked: true },
        { label: '5xx', value: '5xx', checked: true },
      ],
      providers: []
    },
    fetching: true,
    initFilter() {
      this.filter.providers = Object.keys(PROVIDERS).map((key) => {
        return { label: PROVIDERS[key].description, value: PROVIDERS[key].id, checked: true }
      })
    },
    async search() {
      this.fetching = true
      await this.table.getPage(1)
      this.fetching = false
    },

    // Table
    table: null,
    initTable() {
      this.table = table(
        {
          pageSize: 20,
          pagesMax: 10,
        }, async (page, pageSize) => {
          this.fetching = true
          const filter = JSON.parse(JSON.stringify(this.filter))
          const status = filter.status.filter((s) => s.checked).map((s) => s.value)
          const providers = filter.providers.filter((p) => p.checked).map((p) => p.value)
          const externalRequests = await getExternalRequests(providers, status, page, pageSize)
          this.fetching = false
          return externalRequests
        })
    },

    async init() {
      this.initFilter()
      this.initTable()
      this.initModal()
    }
  }
}
