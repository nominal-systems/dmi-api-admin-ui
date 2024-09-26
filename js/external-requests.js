import { getExternalRequest, getExternalRequests, getProviders } from './api-client'
import table from './plugins/table'
import {
  getProviderConfig,
  getQueryParams,
  mapHttpMethodColor,
  mapHttpStatusColor,
  mapHttpStatusText
} from './common/utils'
import moment from 'moment'
import { DATE_FORMAT } from './constants/date-format'
import modal from './plugins/modal'

export const externalRequests = () => {
  return {
    // Modal
    modal: modal({
      ref: 'externalRequestModal',
      onHide: (component) => {
        component.externalRequest = null
      }
    }),
    async openModal(externalRequest) {
      const req = await getExternalRequest(externalRequest._id)
      req.methodColor = mapHttpMethodColor(req.method)
      req.statusText = mapHttpStatusText(req.status)
      req.color = mapHttpStatusColor(req.status)
      req.providerLabel = getProviderConfig(req.provider).label
      this.externalRequest = req
      this.modal.open()
    },
    externalRequest: null,

    // Table
    table: table(
      {
        pageSize: 20,
        pagesMax: 10,
        getPage: async (page, pageSize) => {
          const query = getQueryParams()
          const providers = query.provider ? query.provider.split(',') : undefined
          const method = query.method ? query.method.split(',') : undefined
          const status = query.status ? query.status.split(',') : undefined
          const date = query.date ? query.date.split(',') : undefined

          return await getExternalRequests(providers, status, method, date, page, pageSize)
        },
        processResults: (externalRequests) => {
          externalRequests.forEach((req) => {
            req.providerLabel = getProviderConfig(req.provider).label
          })
        },
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
                  label: getProviderConfig(provider.id).label,
                  value: provider.id,
                }
              })
            },
            dropdownOptions: {
              width: '52'
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
        }
      }
    )
  }
}
