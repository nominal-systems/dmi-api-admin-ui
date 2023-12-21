import { getIntegrationJobsStatus, getIntegrations } from './api-client'
import { Modal } from 'flowbite'
import * as moment from 'moment'

export const integrations = {
  integrations: [],

  // Modal
  operation: null,
  modal: null,
  openModal(integration) {
    this.operation = integration.status === 'RUNNING' ? 'stop' : 'start'
    this.modal.show()
  },
  closeModal() {
    this.operation = null
    this.modal.hide()
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

  // Integrations
  async fetchIntegrations() {
    const integrations = await getIntegrations()
    for (const integration of integrations) {
      await this.setIntegrationJobsStatus(integration)
      this.integrations.push({
        ...integration,
        isRunning: integration.status === 'RUNNING',
        color: integration.status === 'RUNNING' ? 'green' : 'red'
      })
    }

    setInterval(async () => {
      for (const integration of this.integrations) {
        await this.setIntegrationJobsStatus(integration)
      }
    }, 5000)
  },

  async setIntegrationJobsStatus(integration) {
    const jobsStatus = await getIntegrationJobsStatus(integration.id)
    jobsStatus.lastRun = moment(jobsStatus.lastRun).fromNow()
    integration.jobsStatus = jobsStatus
  },

  async updateIntegrationStatus() {
    //TODO(gb): implement
  },
  async init() {
    this.initModal()
    await this.fetchIntegrations()
  }
}
