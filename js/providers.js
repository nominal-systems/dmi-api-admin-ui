import Alpine from 'alpinejs'
import {
  getDefaultBreeds,
  getIntegrationsForProvider,
  getProviderRefs,
  searchProviderRefs,
  setDefaultBreed,
  syncProviderRefs
} from './api-client'
import { getIdFromPath, getProviderConfig, getQueryParams, setQueryParam } from './common/utils'
import { Modal, Tabs } from 'flowbite'
import table from './plugins/table'
import { PROVIDERS } from './constants/provider-list'

const PAGE_SIZE = 20

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
    syncing: false,
    query: null,
    fetching: true,
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
    async fetch($event) {
      this.query = $event.detail.query
      await this.doFetch()
    },
    async doFetch() {
      this.fetching = true
      await this.refs[this.type].getPage(1)
      this.fetching = false
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
          this.query = null
          this.activeTab = tab.getActiveTab()
          setQueryParam('refType', this.activeTab.id)
          this.type = this.activeTab.id
          this.table = this.refs[this.type]
          await this.doFetch()
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
    modal: null,
    editingRef: null,
    editingDefaultBreed: null,
    isEditingDefaultBreed: false,
    async updateDefaultBreed() {
      const speciesCode = this.editingRef.code
      const defaultBreedCode = this.editingRef.defaultBreed.code
      const providerId = this.editingRef.provider.id
      await setDefaultBreed(providerId, speciesCode, defaultBreedCode)
      await this.doFetch()
      this.closeModal()
    },
    editDefaultBreed() {
      this.isEditingDefaultBreed = true
    },
    cancelDefaultBreedEdit() {
      this.isEditingDefaultBreed = false
    },
    openModal(ref) {
      this.editingRef = ref
      this.modal.show()
    },
    closeModal() {
      this.editingRef = null
      this.modal.hide()
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

    // Tables
    initTables() {
      this.refs.sexes = table(
        {
          pageSize: PAGE_SIZE
        }, async (page, pageSize) => {
          return await getProviderRefs(this.provider.id, 'sex', this.query, page, pageSize)
        }
      )
      this.refs.species = table(
        {
          pageSize: PAGE_SIZE
        }, async (page, pageSize) => {
          const refs = await getProviderRefs(this.provider.id, 'species', this.query, page, pageSize)
          const speciesCodes = refs.data.map((r) => r.code)
          const defaultsBreeds = await getDefaultBreeds(this.provider.id, [...new Set(speciesCodes)])
          refs.data = refs.data.map((ref) => {
            const defaultBreed = defaultsBreeds.find((defaultBreed) => defaultBreed.species === ref.code)
            if (defaultBreed !== undefined) {
              ref.defaultBreed = defaultBreed
            }
            return ref
          })
          return refs
        }
      )
      this.refs.breeds = table(
        {
          pageSize: PAGE_SIZE
        }, async (page, pageSize) => {
          return await getProviderRefs(this.provider.id, 'breed', this.query, page, pageSize)
        }
      )
    },

    async init() {
      const provider = PROVIDERS[getIdFromPath()]   //TODO(gb): get provider from API
      provider.label = getProviderConfig(provider.id).label
      this.provider = provider
      this.initTables()
      this.initTabs()
      this.initModal()
    }
  }
}
