import { getIntegrationForProvider, getProvider, getProviderRefs, syncProviderRefs } from './api-client'
import { getProviderFromUrl } from './utils'
import { Tabs } from 'flowbite'

export const providers = {
  provider: null,
  providerRefs: {
    sex: [],
    species: [],
    breed: []
  },
  async fetchProviderRefs() {
    this.providerRefs[this.activeTab.id] = await getProviderRefs(this.provider.id, this.activeTab.id)
  },
  tabs: null,
  activeTab: null,
  async doSyncProviderRefs(type) {
    const integration = await getIntegrationForProvider(this.provider.id)
    if (integration !== undefined) {
      await syncProviderRefs(this.provider.id, type, integration.id, async (body) => {
        await this.fetchProviderRefs()
      })
    }
  },
  initTabs() {
    const tabs = [
      {
        id: 'sex',
        triggerEl: this.$refs.sexTab,
        targetEl: this.$refs.sex
      },
      {
        id: 'species',
        triggerEl: this.$refs.speciesTab,
        targetEl: this.$refs.species
      },
      {
        id: 'breed',
        triggerEl: this.$refs.breedTab,
        targetEl: this.$refs.breed
      }
    ]
    const tabOptions = {
      defaultTabId: tabs[0].id,
      activeClasses: 'text-purple-600 hover:text-purple-600 dark:text-purple-500 dark:hover:text-purple-400 border-purple-600 dark:border-purple-500',
      inactiveClasses: 'text-gray-500 hover:text-gray-600 dark:text-gray-400 border-gray-100 hover:border-gray-300 dark:border-gray-700 dark:hover:text-gray-300',
      onShow: async (tab) => {
        this.activeTab = tab.getActiveTab()
        await this.fetchProviderRefs(this.activeTab.id)
      }
    }
    this.tabs = new Tabs(tabs, tabOptions)
  },
  async initProvider() {
    this.provider = await getProvider(getProviderFromUrl())
    this.initTabs()
  }
}
