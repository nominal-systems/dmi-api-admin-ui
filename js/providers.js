import Alpine from 'alpinejs'
import {
  getDefaultBreeds,
  getIntegrationsForProvider,
  getProviderRefs,
  getProviders,
  searchProviderRefs,
  setDefaultBreed,
  syncProviderRefs
} from './api-client'
import { getIdFromPath, getProviderConfig, getQueryParams, setQueryParam } from './common/utils'
import { Tabs } from 'flowbite'
import table from './plugins/table'
import modal from './plugins/modal'

const PAGE_SIZE = 20

export const providers = () => {
  return {
    provider: null,

    // Reference Data
    type: null,
    refs: {
      sexes: table(
        {
          pageSize: PAGE_SIZE,
          getPage: async (page, pageSize) => {
            const query = getQueryParams()
            const provider = getIdFromPath()
            return await getProviderRefs(provider, 'sex', query.search, page, pageSize)
          }
        }
      ),
      species: table(
        {
          pageSize: PAGE_SIZE,
          getPage: async (page, pageSize) => {
            const query = getQueryParams()
            const provider = getIdFromPath()
            return await getProviderRefs(provider, 'species', query.search, page, pageSize)
          },
          processResults: async (refs) => {
            const provider = getIdFromPath()
            const speciesCodes = refs.map((r) => r.code)
            const defaultsBreeds = await getDefaultBreeds(provider, [...new Set(speciesCodes)])
            refs.forEach((ref) => {
              const defaultBreed = defaultsBreeds.find((defaultBreed) => defaultBreed.species === ref.code)
              if (defaultBreed !== undefined) {
                ref.defaultBreed = defaultBreed
              }
            })
          }
        }
      ),
      breeds: table(
        {
          pageSize: PAGE_SIZE,
          getPage: async (page, pageSize) => {
            const query = getQueryParams()
            const provider = getIdFromPath()
            return await getProviderRefs(provider, 'breed', query.search, page, pageSize)
          }
        }
      )
    },
    allowSync: true,
    syncing: false,
    search: {
      sexes: {
        placeholder: 'Search by name...'
      },
      species: {
        placeholder: 'Search by name...'
      },
      breeds: {
        placeholder: 'Search by name...'
      }
    },
    async syncRefs() {
      this.syncing = true
      const integrations = await getIntegrationsForProvider(this.provider.id)
      if (integrations[0] !== undefined) {
        const syncResult = await syncProviderRefs(this.provider.id, this.type, integrations[0].id)
        this.syncing = false
        Alpine.store('alert')
          .set('info', `Reference data of type ${this.type} for ${this.provider.id.toUpperCase()} synchronized successfully!`)
        await this.table.getPage(1)
      }
    },

    // Tabs
    tabs: null,
    activeTab: null,
    initTabs() {
      const tabOptions = {
        defaultTabId: getQueryParams('refType').refType || 'sexes',
        activeClasses: 'text-purple-600 hover:text-purple-600 dark:text-purple-500 dark:hover:text-purple-400 border-purple-600 dark:border-purple-500',
        inactiveClasses: 'text-gray-500 hover:text-gray-600 dark:text-gray-400 border-gray-100 hover:border-gray-300 dark:border-gray-700 dark:hover:text-gray-300',
        onShow: async (tab) => {
          this.activeTab = tab.getActiveTab()
          setQueryParam('refType', this.activeTab.id)
          this.type = this.activeTab.id
        }
      }
      const tabsElement = document.querySelector('#tabExample')
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
      this.tabs = new Tabs(tabsElement, tabElements, tabOptions)
    },

    // Modal
    modal: modal({
      ref: 'providerRefModal',
      onHide: (_this) => {
        _this.editingRef = null
        _this.editingDefaultBreed = null
        _this.isEditingDefaultBreed = false
      }
    }),
    editingRef: null,
    editingDefaultBreed: null,
    isEditingDefaultBreed: false,
    async updateDefaultBreed() {
      const speciesCode = this.editingRef.code
      const defaultBreedCode = this.editingRef.defaultBreed.code
      const providerId = this.editingRef.provider.id
      await setDefaultBreed(providerId, speciesCode, defaultBreedCode)
      await this.refs[this.type].fetchData()
      this.modal.hide()
    },
    editDefaultBreed() {
      this.isEditingDefaultBreed = true
    },
    cancelDefaultBreedEdit() {
      this.isEditingDefaultBreed = false
    },
    openModal(ref) {
      this.editingRef = ref
      this.modal.open()
    },
    providerRefTypeahead() {
      const $targetEl = this.$el.getElementsByTagName('div')[0]
      const $triggerEl = this.$el.getElementsByTagName('input')[0]

      const options = {
        placement: 'bottom',
        triggerType: 'none',
        offsetSkidding: 0,
        offsetDistance: 10,
        delay: 300,
        ignoreClickOutsideClass: false,
        onHide: () => {
          this.isEditingDefaultBreed = false
        }
      }

      const dropdown = new Dropdown($targetEl, $triggerEl, options)

      return {
        query: '',
        results: [],
        placeholder: 'Search by breed name...',
        mapping: {
          provider: this.provider.id
        },
        select(breed) {
          this.editingRef.defaultBreed = breed
          dropdown.hide()
        },
        async search(provider, query) {
          const breeds = await searchProviderRefs(provider, 'breed', query)
          this.results = breeds.data
          dropdown.show()
        }
      }
    },

    async init() {
      const providers = await getProviders()
      const provider = providers.find((p) => p.id === getIdFromPath())
      provider.label = getProviderConfig(provider.id).label
      this.provider = provider
      this.initTabs()
    }
  }
}
