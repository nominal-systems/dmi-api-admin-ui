import { getIntegrations, getOrganizations, updateIntegrationStatus } from './api-client'
import Alpine from 'alpinejs'
import { Modal } from 'flowbite'
import { getQueryParams, setQueryParam } from './utils'
import { PROVIDERS } from './constants/provider-list'

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
    organizations: [],
    providers: []
  },
  async initFilter() {
    const query = getQueryParams()
    const organizations = await getOrganizations()
    this.filter.organizations = organizations.map((org) => {
      org.checked = query.organizations !== undefined ? query.organizations.includes(org.id) : true
      return org
    })
    this.filter.providers = Object.keys(PROVIDERS).map((key) => {
      return {
        label: PROVIDERS[key].description,
        value: PROVIDERS[key].id,
        checked: query.providers !== undefined ? query.providers.split(',').includes(PROVIDERS[key].id) : true
      }
    })
    this.updateQueryParams()
  },
  updateQueryParams() {
    setQueryParam('organizations', this.filter.organizations.filter((org) => org.checked).map((org) => org.id))
    setQueryParam('providers', this.filter.providers.filter((provider) => provider.checked).map((provider) => provider.value))
  },
  filterIntegrations() {
    this.updateQueryParams()
    this.integrations.map((integration) => {
      integration.show = this.showIntegration(integration)
    })
  },

  async fetchIntegrations() {

    // TODO(gb): eventually do filtering in backend
    this.integrations = (await getIntegrations()).map(integration => {
      return {
        ...integration,
        isRunning: integration.status === 'RUNNING',
        color: integration.status === 'RUNNING' ? 'green' : 'red',
        show: this.showIntegration(integration)
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
    const isFromOrganization = query.organizations === undefined ? true : query.organizations.split(',').includes(integration.practice.organization.id)
    const isFromProvider = query.providers === undefined ? true : query.providers.split(',').includes(integration.providerConfiguration.providerId)
    return isFromOrganization && isFromProvider
  },

  async init() {
    this.initModal()
    await this.initFilter()
    await this.fetchIntegrations()
  }
}
