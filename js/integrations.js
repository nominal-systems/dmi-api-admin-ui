import { getIntegrations, getOrganizations, getProviders, updateIntegrationStatus } from './api-client'
import Alpine from 'alpinejs'
import { Modal } from 'flowbite'
import { getProviderConfig, getQueryParams } from './utils'

export const integrations = {
  integrations: [],
  operation: null,
  selectedIntegration: null,
  inProgress: false,
  fetching: true,
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

  // Filter
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
            label: provider.description,
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
  },
  filterIntegrations() {
    this.integrations.map((integration) => {
      integration.show = this.showIntegration(integration)
    })
  },

  async fetchIntegrations() {
    // TODO(gb): eventually do filtering in backend
    this.fetching = true
    const integrations = await getIntegrations()
    integrations.forEach(integration => {
      const providerConfig = getProviderConfig(integration.providerConfiguration.providerId)
      integration.providerLabel = providerConfig !== undefined ? providerConfig.label : integration.providerConfiguration.providerId
      integration.isRunning = integration.status === 'RUNNING'
      integration.color = integration.status === 'RUNNING' ? 'green' : 'red'
      integration.show = this.showIntegration(integration)
    })
    this.integrations = integrations
    this.fetching = false
  },
  async updateIntegrationStatus() {
    this.error = null
    this.inProgress = true
    await updateIntegrationStatus(this.selectedIntegration.id, this.operation)
      .then(res => {
        this.inProgress = false
        this.fetchIntegrations()
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
  showIntegration(integration) {
    const query = getQueryParams()
    const isFromOrganization = query.organization === undefined ? true : query.organization.split(',').includes(integration.practice.organization.id)
    const isFromProvider = query.provider === undefined ? true : query.provider.split(',').includes(integration.providerConfiguration.providerId)
    const isInStatus = query.status === undefined ? true : query.status.split(',').includes(integration.status)
    return isFromOrganization && isFromProvider && isInStatus
  },

  async init() {
    this.initModal()
    await this.fetchIntegrations()
  }
}
