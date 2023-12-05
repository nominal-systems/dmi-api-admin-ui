import { getDefaultBreeds, getIntegrationForProvider, getProviderRefs, syncProviderRefs } from './api-client'
import { getProviderFromUrl, getReferenceDataTypeFromUrl } from './utils'
import { Modal, Tabs } from 'flowbite'
import table from './plugins/table'

const PAGE_SIZE = 20
const PROVIDERS = {
  antech: {
    id: 'antech',
    description: 'Antech'
  },
  idexx: {
    id: 'idexx',
    description: 'IDEXX'
  },
  heska: {
    id: 'heska',
    description: 'Heska'
  },
  zoetis: {
    id: 'zoetis',
    description: 'Zoetis'
  },
}

export const providers = () => {
  return {
    provider: null,

    // Reference Data
    type: null,
    refs: {
      sexes: null,
      species: null,
      breeds: null
    },
    async doSyncProviderRefs(type) {
      const integration = await getIntegrationForProvider(this.provider.id)
      if (integration !== undefined) {
        await syncProviderRefs(this.provider.id, this.ref(type).typeName, integration.id, async (body) => {
          //TODO(gb): refresh table
        })
      }
    },

    // Tabs
    tabs: null,
    activeTab: null,
    initTabs() {
      const tabOptions = {
        defaultTabId: getReferenceDataTypeFromUrl() || 'sexes',
        activeClasses: 'text-purple-600 hover:text-purple-600 dark:text-purple-500 dark:hover:text-purple-400 border-purple-600 dark:border-purple-500',
        inactiveClasses: 'text-gray-500 hover:text-gray-600 dark:text-gray-400 border-gray-100 hover:border-gray-300 dark:border-gray-700 dark:hover:text-gray-300',
        onShow: async (tab) => {
          this.activeTab = tab.getActiveTab()
          this.type = this.activeTab.id
          this.table = this.refs[this.type]
          await this.table.getPage(1)
        }
      }
      const tabElements = [
        {
          id: 'sexes',
          triggerEl: document.querySelector('#sexes-tab'),
          targetEl: document.querySelector('#sexes')
        },
        {
          id: 'species',
          triggerEl: document.querySelector('#species-tab'),
          targetEl: document.querySelector('#species')
        },
        {
          id: 'breeds',
          triggerEl: document.querySelector('#breeds-tab'),
          targetEl: document.querySelector('#breeds')
        }
      ]
      this.tabs = new Tabs(tabElements, tabOptions)
    },

    // Modal
    modal: null,
    editingRef: null,
    openModal(ref) {
      this.editingRef = ref
      this.modal.show()
    },
    initModal() {
      const targetE = this.$refs['providerRefModal']
      const modalOptions = {
        placement: 'bottom-right',
        backdrop: 'dynamic',
        backdropClasses: 'bg-gray-900 bg-opacity-50 dark:bg-opacity-80 fixed inset-0 z-40',
        closable: true
      }
      this.modal = new Modal(targetE, modalOptions)
    },

    // Tables
    initTables() {
      this.refs.sexes = table(
        {
          pageSize: PAGE_SIZE
        }, async (page, pageSize) => {
          return await getProviderRefs(this.provider.id, 'sex', page, pageSize)
        }
      )
      this.refs.species = table(
        {
          pageSize: PAGE_SIZE
        }, async (page, pageSize) => {
          const refs = await getProviderRefs(this.provider.id, 'species', page, pageSize)
          const defaults = await getDefaultBreeds(this.provider.id, refs.data.map((r) => r.code))
          defaults.forEach((defaultBreed) => {
            const ref = refs.data.find((r) => r.code === defaultBreed.species)
            if (ref !== undefined) {
              ref.defaultBreed = defaultBreed.defaultBreed
            }
          })
          return refs
        }
      )
      this.refs.breeds = table(
        {
          pageSize: PAGE_SIZE
        }, async (page, pageSize) => {
          return await getProviderRefs(this.provider.id, 'breed', page, pageSize)
        }
      )
    },

    async init() {
      this.provider = PROVIDERS[getProviderFromUrl()]   //TODO(gb): get provider from API
      this.initTables()
      this.initTabs()
      this.initModal()
    }
  }
}
