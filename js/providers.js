import { getIntegrationForProvider, getProvider, getProviderRefs, syncProviderRefs } from './api-client'
import { getProviderFromUrl } from './utils'
import { Tabs } from 'flowbite'

export const providers = {
  provider: null,
  refs: [
      {
        id: 'sex',
        typeName: 'sexes',
        triggerRef: 'sexTab',
        targetRef: 'sex',
        name: 'Sexes',
        items: []
      },
    {
      id: 'species',
      typeName: 'species',
      triggerRef: 'speciesTab',
      targetRef: 'species',
      name: 'Species',
      items: []
    },
    {
      id: 'breeds',
      typeName: 'breeds',
      triggerRef: 'breedsTab',
      targetRef: 'breeds',
      name: 'Breeds',
      items: []
    }
  ],
  ref(type) {
    return this.refs.find((ref) => ref.id === type)
  },
  refItems(type) {
    return this.ref(type).items
  },
  async fetchProviderRefs() {
    this.ref(this.activeTab.id).items = await getProviderRefs(this.provider.id, this.activeTab.id)
  },
  tabs: null,
  activeTab: null,
  async doSyncProviderRefs(type) {
    const integration = await getIntegrationForProvider(this.provider.id)
    if (integration !== undefined) {
      await syncProviderRefs(this.provider.id, this.ref(type).typeName, integration.id, async (body) => {
        await this.fetchProviderRefs()
      })
    }
  },
  initTabs() {
    const tabs = this.refs.map((ref) => {
      return {
        id: ref.id,
        triggerEl: this.$refs[ref.triggerRef],
        targetEl: this.$refs[ref.targetRef]
      }
    })
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
