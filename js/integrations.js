import { getIntegrations, getOrganizations, getProviders, updateIntegrationStatus } from './api-client'
import Alpine from 'alpinejs'
import { Modal } from 'flowbite'
import { getProviderConfig, getQueryParams } from './common/utils'
import table from './plugins/table'

export const integrations = {
  // Table
  table: table({
    pageSize: 10,
    getPage: async (page, pageSize) => {
      const query = getQueryParams()
      const providers = query.provider ? query.provider.split(',') : undefined
      const organizations = query.organization ? query.organization.split(',') : undefined
      const statuses = query.status ? query.status.split(',') : undefined
      return await getIntegrations(providers, organizations, statuses, page, pageSize)
    },
    processResults: (integrations) => {
      integrations.forEach(integration => {
        integration.providerLabel = getProviderConfig(integration.providerConfiguration.providerId).label
        integration.isRunning = integration.status === 'RUNNING'
        integration.color = integration.status === 'RUNNING' ? 'green' : 'red'
      })
    },
    filter: {
      organization: {
        id: 'organization',
        type: 'checkbox',
        label: 'Organization',
        updateQuery: true,
        items: async () => {
          return (await getOrganizations()).map((org) => {
            return {
              label: org.name,
              value: org.id
            }
          })
        }
      },
      provider: {
        id: 'provider',
        type: 'checkbox',
        label: 'Provider',
        updateQuery: true,
        items: async () => {
          return (await getProviders()).map((provider) => {
            return {
              label: getProviderConfig(provider.id).label,
              value: provider.id
            }
          })
        },
        dropdownOptions: {
          width: '52'
        }
      },
      status: {
        id: 'status',
        type: 'checkbox',
        label: 'Status',
        updateQuery: true,
        items: () => {
          return [
            {
              value: 'RUNNING',
              label: 'Running'
            },
            {
              value: 'STOPPED',
              label: 'Stopped'
            }
          ]
        }
      }
    }
  }),
  // integrations: [],
  operation: null,
  selectedIntegration: null,
  inProgress: false,
  error: null,

  // Modal
  modal: null,
  initModal() {
    const modalOptions = {
      placement: 'bottom-right',
      backdrop: 'dynamic',
      backdropClasses: 'bg-gray-900 bg-opacity-50 dark:bg-opacity-80 fixed inset-0 z-40',
      closable: true
    }
    this.modal = new Modal(this.$refs['integrationModal'], modalOptions)
  },
  openModal(integration, operation) {
    this.error = null
    this.inProgress = false
    this.operation = operation
    this.selectedIntegration = integration
    this.modal.show()
  },
  closeModal() {
    this.operation = null
    this.modal.hide()
  },

  async updateIntegrationStatus() {
    this.error = null
    this.inProgress = true
    await updateIntegrationStatus(this.selectedIntegration.id, this.operation)
      .then(res => {
        this.inProgress = false
        this.table.fetchData()
        this.modal.hide()
        Alpine.store('alert')
          .set('info', `Integration ${this.selectedIntegration.id} ${this.operation}${this.operation === 'stop' ? 'p' : ''}ed.`)
      })
      .catch(err => {
        this.inProgress = false
        this.error = {
          message: err.body.error
        }
      })
  },

  async init() {
    this.initModal()
  }
}
