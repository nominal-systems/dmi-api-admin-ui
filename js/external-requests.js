import { getExternalRequest, getExternalRequests, getProviders } from './api-client'
import { Modal } from 'flowbite'
import table from './plugins/table'
import { getQueryParams, mapHttpMethodColor, mapHttpStatusColor, mapHttpStatusText } from './utils'
import moment from 'moment'
import { DATE_FORMAT } from './constants/date-format'

export const externalRequests = () => {
  return {
    // Modal
    modal: null,
    externalRequest: null,
    async openModal(externalRequest) {
      this.externalRequest = await getExternalRequest(externalRequest._id)
      this.externalRequest.methodColor = mapHttpMethodColor(this.externalRequest.method)
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
          const providers = query.provider ? query.provider.split(',') : undefined
          const method = query.method ? query.method.split(',') : undefined
          const status = query.status ? query.status.split(',') : undefined
          const date = query.date ? query.date.split(',') : undefined

          const externalRequests = await getExternalRequests(providers, status, method, date, page, pageSize)
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
