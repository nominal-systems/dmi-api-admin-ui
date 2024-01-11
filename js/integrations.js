import { getIntegrationJobsStatus, getIntegrations } from './api-client'
import { Modal } from 'flowbite'
import * as moment from 'moment'

const JOBS_STATUS_POLLING_INTERVAL = 30 * 1000

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
      this.integrations.push({
        ...integration,
        isRunning: integration.status === 'RUNNING',
        color: integration.status === 'RUNNING' ? 'green' : 'red'
      })
    }

    await this.pollIntegrationJobsStatus()
    setInterval(async () => {
      await this.setIntegrationJobsStatus()
    }, JOBS_STATUS_POLLING_INTERVAL)
    console.log(`Polling job status every ${JOBS_STATUS_POLLING_INTERVAL}MS`)
  },

  async pollIntegrationJobsStatus(i) {
    const promises = []
    for (const integration of this.integrations) {
      promises.push(this.setIntegrationJobsStatus(integration))
    }
    await Promise.all(promises)
  },
  async setIntegrationJobsStatus(integration) {
    const jobsStatus = await getIntegrationJobsStatus(integration.id)
    const timestamp = jobsStatus.lastRun
    jobsStatus.lastRun = moment(timestamp).fromNow()
    integration.jobsStatus = jobsStatus
    console.log(`Get job status for ${integration.id} (lastRun: ${timestamp})`)
  },

  async updateIntegrationStatus() {
    //TODO(gb): implement
  },
  async init() {
    this.initModal()
    await this.fetchIntegrations()
  }
}
