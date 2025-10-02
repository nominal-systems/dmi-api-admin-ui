import Alpine from 'alpinejs'
import { Tabs } from 'flowbite'
import {
  getMappingDefaultBreed,
  getProviders,
  getRefs,
  searchProviderRefs,
  setMappingDefaultBreed,
  updateRefMapping
} from "./api-client"
import table from './plugins/table'
import { getProviderConfig, getQueryParams, removeQueryParam, setQueryParam } from './common/utils'
import modal from './plugins/modal'

export const refs = () => {
  return {
    // Providers
    providers: [],

    // Reference Data
    _initialTabShowHandled: false,
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

        // 1) Apply provider ref mapping if present
        if (update.ref?.id) {
          await updateRefMapping(this.editingRef.id, update.ref.id)
        }

        // 2) Apply mapping-level default breed (species only) if queued
        if (this.type === 'species' && (update.hasOwnProperty('defaultBreed'))) {
          const refSpeciesCode = this.editingRef.code
          // Prefer the mapping we are setting now; otherwise fallback to existing mapping
          const providerSpeciesCode = (update.ref?.code) || (this.editingRef?.providerRef?.[provider]?.code)
          if (providerSpeciesCode) {
            try {
              await setMappingDefaultBreed(provider, refSpeciesCode, providerSpeciesCode, update.defaultBreed || '')
            } catch (e) {
              // Surface a non-blocking alert; continue other providers
              Alpine.store('alert').set('error', e?.message || 'Failed to update mapping default breed')
            }
          }
        }

        update.done = true
      }
      const type = this.editingRef.type
      Alpine.store('alert')
        .set('info', `Mappings for ${this.editingRef.code} (${this.editingRef.name}) updated successfully!`)
      this.modal.hide()
      const searchTerm = type === 'breed' ? 'breeds' : type
      await this.refs[searchTerm].fetchData()

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
    editingMappingDefault: null,
    updatingMappingDefault: false,
    editMapping(mapping) {
      this.isEditingMapping = true
      this.editingMapping = mapping
    },
    cancelMappingEdit() {
      this.isEditingMapping = false
      this.editingMapping = null
    },
    async loadMappingDefault(mapping) {
      // Only for species tab and when mapping is set
      if (this.type !== 'species' || !mapping?.ref?.code) return
      try {
        mapping._loadingDefault = true
        const res = await getMappingDefaultBreed(mapping.provider, this.editingRef.code, mapping.ref.code)
        mapping.mappingDefaultBreed = res?.defaultBreed || null
      } catch (_) {
        mapping.mappingDefaultBreed = null
      } finally {
        mapping._loadingDefault = false
      }
    },
    editMappingDefault(mapping) {
      this.editingMappingDefault = mapping
    },
    cancelMappingDefaultEdit() {
      this.editingMappingDefault = null
    },

    async setMappingDefault(mapping, breedRef) {
      if (!mapping?.ref?.code) return
      // Queue the default breed update; do not call API here
      const providerId = mapping.provider
      this.updates[providerId] = this.updates[providerId] || { provider: providerId, label: mapping.label }
      this.updates[providerId].defaultBreed = breedRef.code
      mapping.mappingDefaultBreed = { code: breedRef.code, name: breedRef.name }
      this.editingMappingDefault = null
    },
    async clearMappingDefault(mapping) {
      if (!mapping?.ref?.code) return
      // Queue clearing the default breed; do not call API here
      const providerId = mapping.provider
      this.updates[providerId] = this.updates[providerId] || { provider: providerId, label: mapping.label }
      this.updates[providerId].defaultBreed = ''
      mapping.mappingDefaultBreed = null
    },
    providerRefTypeahead(cfg = {}) {
      // Shared typeahead for selecting provider refs (species/breeds)
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
        }
      }

      const dropdown = new Dropdown($targetEl, $triggerEl, options)

      const provider = cfg.provider
      const type = cfg.type || this.type
      const species = cfg.species
      const onSelect = cfg.onSelect
      const placeholder = cfg.placeholder || 'Search by code or name...'

      return {
        query: '',
        results: [],
        placeholder,
        select(ref) {
          if (typeof onSelect === 'function') {
            onSelect(ref)
          } else {
            // Default behavior: set provider mapping selection
            const mapping = this.editingRefMappings.find((m) => m.provider === ref.provider.id)
            if (mapping) {
              this.updates[ref.provider.id] = mapping
              mapping.ref = ref
              this.isEditingMapping = false
              this.editingMapping = null
              // Clear any pending default-breed update; it should be re-selected for the new mapping
              if (this.updates[ref.provider.id]) {
                delete this.updates[ref.provider.id].defaultBreed
              }
              if (this.type === 'species') {
                // Load mapping-level default for the selected pair
                this.loadMappingDefault(mapping)
              }
            }
          }
          dropdown.hide()
        },
        async search(arg1, arg2) {
          const query = (arg2 === undefined ? arg1 : arg2)
          const q = (query || '').toString().toLowerCase()
          if (q.length === 0) {
            this.results = []
            dropdown.hide()
            return
          }
          const effectiveProvider = provider || arg1
          const providerRefs = await searchProviderRefs({ provider: effectiveProvider, type, species, search: null })
          const data = providerRefs?.data || []
          this.results = data.filter(r => {
            const name = (r.name || '').toString().toLowerCase()
            const code = (r.code || '').toString().toLowerCase()
            return name.includes(q) || code.includes(q)
          })
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
          ref: ref.providerRef[provider.id],
          mappingDefaultBreed: null,
          _loadingDefault: false
        })
      })
      // For species mappings, load mapping-level defaults
      if (this.type === 'species') {
        this.editingRefMappings.forEach((m) => this.loadMappingDefault(m))
      }
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
          if (this._initialTabShowHandled) {
            removeQueryParam('search')
          } else {
            this._initialTabShowHandled = true
          }
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
          id: 'breed',
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
