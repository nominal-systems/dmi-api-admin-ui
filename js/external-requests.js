import { getExternalRequest, getExternalRequests, getProviders } from './api-client'
import { Modal } from 'flowbite'
import table from './plugins/table'
import { getQueryParams, mapHttpStatusColor, mapHttpStatusText } from './utils'

export const externalRequests = () => {
  return {
    // Modal
    modal: null,
    externalRequest: null,
    async openModal(externalRequest) {
      this.externalRequest = await getExternalRequest(externalRequest._id)
      this.externalRequest.statusText = mapHttpStatusText(this.externalRequest.status)
      this.externalRequest.color = mapHttpStatusColor(this.externalRequest.status)
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
      status: {
        id: 'status',
        type: 'checkbox',
        label: 'Response Status',
        updateQuery: true,
        items() {
          return [
            { label: '2xx', value: '2xx', checked: false },
            { label: '3xx', value: '3xx', checked: false },
            { label: '4xx', value: '4xx', checked: true },
            { label: '5xx', value: '5xx', checked: true },
          ]
        }
      },
      provider: {
        id: 'provider',
        type: 'checkbox',
        label: 'Provider',
        updateQuery: true,
        async items() {
          return (await getProviders()).map((provider) => {
            return {
              label: provider.description,
              value: provider.id,
            }
          })
        }
      },
      method: {
        id: 'method',
        type: 'checkbox',
        label: 'Request Method',
        updateQuery: true,
        items() {
          return [
            { label: 'GET', value: 'GET' },
            { label: 'POST', value: 'POST' },
            { label: 'PUT', value: 'PUT' },
            { label: 'DELETE', value: 'DELETE' },
          ]
        }
      }
    },
    fetching: true,
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
          const query = getQueryParams()
          const status = query.status ? query.status.split(',') : undefined
          const providers = query.provider ? query.provider.split(',') : undefined
          const method = query.method ? query.method.split(',') : undefined

          const externalRequests = await getExternalRequests(providers, status, method, page, pageSize)
          this.fetching = false
          return externalRequests
        })
    },

    async init() {
      this.initTable()
      this.initModal()
    }
  }
}
