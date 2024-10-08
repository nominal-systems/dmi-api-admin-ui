import { getIntegrations, getOrganizations, getProviders, updateIntegrationStatus } from './api-client'
import Alpine from 'alpinejs'
import { getProviderConfig, getQueryParams } from './common/utils'
import table from './plugins/table'
import modal from './plugins/modal'

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
    },
    actions: [
      {
        label: 'Start',
        async onClick() {
          await this.batchActionsModal.open({
            operation: 'start',
            integrations: this.table.getSelection()
          })
        }
      },
      {
        label: 'Stop',
        async onClick() {
          await this.batchActionsModal.open({
            operation: 'stop',
            integrations: this.table.getSelection()
          })
        }
      },
      {
        label: 'Restart',
        async onClick() {
          await this.batchActionsModal.open({
            operation: 'restart',
            integrations: this.table.getSelection()
          })
        }
      }
    ]
  }),

  // Modal
  modal: modal({
    ref: 'integrationModal',
    onHide: (_this) => {
      _this.operation = null
    }
  }),
  async openModal(integration, operation) {
    this.error = null
    this.inProgress = false
    this.operation = operation
    this.selectedIntegration = integration
    await this.modal.open()
  },
  operation: null,
  selectedIntegration: null,
  inProgress: false,
  error: null,

  // Actions
  batchActionsModal: modal({
    ref: 'actionsModal',
    data: {
      currentIntegration: {},
      done: 0
    },
    onShow: (self, data) => {
      data.inProgress = false
      data.error = null
      data.done = 0
    }
  }),

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

  async batchUpdateIntegrations(data) {
    data.error = null
    data.inProgress = true

    try {
      for (const integration of data.integrations) {
        data.currentIntegration = integration
        await updateIntegrationStatus(data.currentIntegration.id, data.operation)
        data.done += 1
      }
    } catch (err) {
      data.inProgress = false
      data.error = {
        message: err.body.error
      }
    } finally {
      setTimeout(async () => {
        this.table.clearSelection()
        await this.batchActionsModal.close()
      }, 1000)
    }
  }
}
