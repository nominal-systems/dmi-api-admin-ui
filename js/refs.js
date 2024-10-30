import Alpine from 'alpinejs'
import { Tabs } from 'flowbite'
import { getProviders, getRefs, searchProviderRefs, updateRefMapping } from "./api-client"
import table from './plugins/table'
import { getProviderConfig, getQueryParams, removeQueryParam, setQueryParam } from './common/utils'
import modal from './plugins/modal'

export const refs = () => {
  return {
    // Providers
    providers: [],

    // Reference Data
    type: null,
    refs: {
      sexes: table(
        {
          pageSize: 20,
          getPage: async (page, pageSize) => {
            const query = getQueryParams()
            return await getRefs('sex', query.search, page, pageSize)
          }
        }
      ),
      species: table(
        {
          pageSize: 20,
          getPage: async (page, pageSize) => {
            const query = getQueryParams()
            return await getRefs('species', query.search, page, pageSize)
          }
        }
      ),
      breeds: table(
        {
          pageSize: 20,
          getPage: async (page, pageSize) => {
            const query = getQueryParams()
            return await getRefs('breed', query.search, page, pageSize)
          }
        }
      )
    },
    allowSync: false,
    updates: {},
    updatingRefs: false,
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
    async updateRef() {
      this.updatingRefs = true
      for (const provider of Object.keys(this.updates)) {
        const update = this.updates[provider]
        await updateRefMapping(this.editingRef.id, update.ref.id)
        update.done = true
      }
      const type = this.editingRef.type
      Alpine.store('alert')
        .set('info', `Mappings for ${this.editingRef.code} (${this.editingRef.name}) updated successfully!`)
      this.modal.hide()
      await this.refs[type].fetchData()

      this.updates = {}
      this.updatingRefs = false
    },

    // Modal
    modal: modal({
      ref: 'refsModal',
      onHide: (_this) => {
        _this.editingRef = {}
        _this.editingRefMappings = []
        _this.editingMapping = null
        _this.isEditingMapping = false
        _this.updates = {}
        _this.editingRef = false
      }
    }),
    editingRef: {},
    editingMapping: null,
    editingRefMappings: [],
    isEditingMapping: false,
    editMapping(mapping) {
      this.isEditingMapping = true
      this.editingMapping = mapping
    },
    cancelMappingEdit() {
      this.isEditingMapping = false
      this.editingMapping = null
    },
    providerRefTypeahead() {
      //TODO(gb): make these selections safer
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
          this.isEditingMapping = false
          this.editingMapping = null
        }
      }

      const dropdown = new Dropdown($targetEl, $triggerEl, options)

      return {
        query: '',
        results: [],
        placeholder: 'Search by name...',
        select(ref) {
          const mapping = this.editingRefMappings.find((mapping) => mapping.provider === ref.provider.id)
          this.updates[ref.provider.id] = mapping
          mapping.ref = ref
          this.isEditingMapping = false
          this.editingMapping = null
          dropdown.hide()
        },
        async search(provider, query) {
          const providerRefs = await searchProviderRefs(provider, this.type, query)
          this.results = providerRefs.data
          dropdown.show()
        }
      }
    },
    openModal(ref) {
      this.editingRef = ref
      this.editingRefMappings = []
      this.providers.forEach((provider) => {
        this.editingRefMappings.push({
          provider: provider.id,
          label: getProviderConfig(provider.id).label,
          ref: ref.providerRef[provider.id]
        })
      })
      this.modal.open()
    },

    // Tabs
    tabs: null,
    activeTab: null,
    initTabs() {
      this.type = 'sex'
      const tabOptions = {
        defaultTabId: getQueryParams('ref').ref || 'sexes',
        activeClasses: 'text-purple-600 hover:text-purple-600 dark:text-purple-500 dark:hover:text-purple-400 border-purple-600 dark:border-purple-500',
        inactiveClasses: 'text-gray-500 hover:text-gray-600 dark:text-gray-400 border-gray-100 hover:border-gray-300 dark:border-gray-700 dark:hover:text-gray-300',
        onShow: async (tab) => {
          this.activeTab = tab.getActiveTab()
          this.type = this.activeTab.id
          setQueryParam('ref', this.activeTab.id)
          removeQueryParam('search')
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

    async init() {
      Alpine.store('title').set('Reference Data')
      this.initTabs()
      const providers = await getProviders()
      providers.forEach((provider) => {
        provider.label = getProviderConfig(provider.id).label
      })
      this.providers = providers
    }
  }
}
