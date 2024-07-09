import { getIntegrations, getOrganizations, updateIntegrationStatus } from './api-client'
import Alpine from 'alpinejs'
import { Modal } from 'flowbite'
import { getQueryParams, setQueryParam } from './utils'

export const integrations = {
  integrations: [],
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

  // Filter
  filter: {
    organizations: null
  },
  async initFilter() {
    const query = getQueryParams()
    const organizations = await getOrganizations()
    this.filter.organizations = organizations.map((org) => {
      org.checked = query.organizations !== undefined ? query.organizations.includes(org.id) : true
      return org
    })
    this.updateQueryParams()
  },
  updateQueryParams() {
    setQueryParam('organizations', this.filter.organizations.filter((org) => org.checked).map((org) => org.id))
  },
  filterIntegrations() {
    setQueryParam('organizations', this.filter.organizations.filter((org) => org.checked).map((org) => org.id))
    const query = getQueryParams()
    this.integrations.map((i) => {
      i.show = query.organizations.includes(i.practice.organization.id)
    })
  },

  async fetchIntegrations() {
    const query = getQueryParams()
    // TODO(gb): eventually do filtering in backend
    this.integrations = (await getIntegrations()).map(i => {
      return {
        ...i,
        isRunning: i.status === 'RUNNING',
        color: i.status === 'RUNNING' ? 'green' : 'red',
        show: query.organizations !== undefined ? query.organizations.includes(i.practice.organization.id) : true
      }
    })
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
          .set('info', `Integration ${this.selectedIntegration.id} ${this.operation}${this.operation === 'stop' ? 'p': ''}ed.`)
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
    await this.initFilter()
    await this.fetchIntegrations()
  }
}
