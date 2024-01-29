import { apiPost, getIntegrations } from './api-client'
import { Modal } from 'flowbite'

export const integrations = {
  integrations: [],
  operation: null,
  selectedIntegration: null,
  inProgress: false,
  error: null,
  modal: null,
  openModal(integration) {
    this.error = null
    this.inProgress = false
    this.operation = integration.status === 'RUNNING' ? 'stop' : 'start'
    this.selectedIntegration = integration
    this.modal.show()
  },
  closeModal() {
    this.operation = null
    this.modal.hide()
  },
  async fetchIntegrations() {
    this.integrations = (await getIntegrations()).map(integration => {
      return {
        ...integration,
        isRunning: integration.status === 'RUNNING',
        color: integration.status === 'RUNNING' ? 'green' : 'red'
      }
    })
  },
  async updateIntegrationStatus() {
    this.error = null
    this.inProgress = true
    await apiPost(`/integrations/${this.selectedIntegration.id}/${this.operation}`, null)
      .then(res => {
        this.inProgress = false
        this.fetchIntegrations()
        this.modal.hide()
      })
      .catch(err => {
        this.inProgress = false
        this.error = {
          message: err.body.error
        }
      })
  },
  initModal() {
    const modalOptions = {
      placement: 'bottom-right',
      backdrop: 'dynamic',
      backdropClasses: 'bg-gray-900 bg-opacity-50 dark:bg-opacity-80 fixed inset-0 z-40',
      closable: true
    }
    this.modal = new Modal(this.$refs['integrationModal'], modalOptions)
  },
  async init() {
    this.initModal()
    await this.fetchIntegrations()
  }
}
