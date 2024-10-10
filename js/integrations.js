import { getIntegrations, getOrganizations, getProviders, updateIntegrationStatus } from './api-client'
import Alpine from 'alpinejs'
import { delay, getIntegrationConfig, getProviderConfig, getQueryParams } from './common/utils'
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
        const integrationConfig = getIntegrationConfig(integration.status)
        integration.providerLabel = getProviderConfig(integration.providerConfiguration.providerId).label
        integration.operations = integrationConfig.operations
        integration.color = integrationConfig.color
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
              value: 'NEW',
              label: 'New'
            },
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

  // Modals
  actionModal: modal({
    ref: 'integrationModal',
    data: {
      inProgress: false,
      operation: null,
      integration: null
    },
    onShow: (self, data) => {
      data.error = null
      data.inProgress = false
    },
    onHide: (self) => {
      self.operation = null
    }
  }),
  batchActionsModal: modal({
    ref: 'actionsModal',
    data: {
      inProgress: false,
      operation: null,
      currentIntegration: {},
      done: 0,
      step: 0,
      logs: [],
    },
    onShow: (self, data) => {
      data.inProgress = false
      data.error = null
      data.step = 0
      data.done = 0
      data.logs = []
    },
    onHide: async (self) => {
      self.table.clearSelection()
      await self.table.goToPage(1)
    }
  }),

  async updateIntegrationStatus(data) {
    data.error = null
    data.inProgress = true
    await updateIntegrationStatus(data.integration.id, data.operation)
      .then(res => {
        data.inProgress = false
        this.table.fetchData()
        this.actionModal.close()
        Alpine.store('alert')
          .set('info', `Integration ${data.integration.id} ${data.operation}${data.operation === 'stop' ? 'p' : ''}ed.`)
      })
      .catch(err => {
        data.inProgress = false
        data.error = {
          message: err.body.error
        }
      })
  },

  async batchUpdateIntegrations(data) {
    data.error = null
    data.inProgress = true

    try {
      data.step += 1
      for (const integration of data.integrations) {
        data.currentIntegration = integration
        const response = await updateIntegrationStatus(data.currentIntegration.id, data.operation)
        data.logs.push({
          status: 'ok',
          message: `Integration/${data.currentIntegration.id}: ${response.ok}`
        })
        data.done += 1
        data.step = Math.min(data.step + 1, data.integrations.length)
        await delay(500)
      }
    } catch (err) {
      data.inProgress = false
      data.error = {
        message: err.body.error
      }
      data.logs.push({
        status: 'error',
        message: err.body.error
      })
    } finally {

    }
  }
}

