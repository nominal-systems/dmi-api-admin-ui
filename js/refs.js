import Alpine from 'alpinejs'
import { Modal, Tabs } from 'flowbite'
import { getProviders, getRefs, searchProviderRefs, updateRefMapping } from "./api-client"
import table from './plugins/table'
import { getQueryParams, setQueryParam } from './utils'

const PAGE_SIZE = 20

export const refs = () => {
  return {
    // Providers
    providers: [],

    // Reference Data
    type: null,
    refs: {
      sexes: null,
      species: null,
      breeds: null
    },
    syncing: false,
    updates: {},
    updatingRefs: false,
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
      this.closeModal()
      await this.refs[type].getPage(0)

      this.updatingRefs = false
    },

    // Modal
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
          ref: ref.providerRef[provider.id]
        })
      })
      this.modal.show()
    },
    closeModal() {
      this.editingRef = {}
      this.editingRefMappings = []
      this.modal.hide()
    },
    initModal() {
      const $modalTarget = document.getElementById('refsModal')
      const modalOptions = {
        placement: 'bottom-right',
        backdrop: 'dynamic',
        backdropClasses: 'bg-gray-900 bg-opacity-50 dark:bg-opacity-80 fixed inset-0 z-40',
        closable: true
      }
      this.modal = new Modal($modalTarget, modalOptions)
    },

    // Tabs
    tabs: null,
    activeTab: null,
    initTabs() {
      this.type = 'sex'
      const tabOptions = {
        defaultTabId: getQueryParams('ref').ref || 'sex',
        activeClasses: 'text-purple-600 hover:text-purple-600 dark:text-purple-500 dark:hover:text-purple-400 border-purple-600 dark:border-purple-500',
        inactiveClasses: 'text-gray-500 hover:text-gray-600 dark:text-gray-400 border-gray-100 hover:border-gray-300 dark:border-gray-700 dark:hover:text-gray-300',
        onShow: async (tab) => {
          this.activeTab = tab.getActiveTab()
          setQueryParam('ref', this.activeTab.id)
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

    // Tables
    initTables() {
      this.refs.sexes = table(
        {
          pageSize: PAGE_SIZE
        }, async (page, pageSize) => {
          return await getRefs('sex', page, pageSize)
        }
      )
      this.refs.species = table(
        {
          pageSize: PAGE_SIZE
        }, async (page, pageSize) => {
          return await getRefs('species', page, pageSize)
        }
      )
      this.refs.breeds = table(
        {
          pageSize: PAGE_SIZE
        }, async (page, pageSize) => {
          return await getRefs('breed', page, pageSize)
        }
      )
    },
    async init() {
      this.initTables()
      this.initTabs()
      this.initModal()
      this.providers = await getProviders()
    }
  }
}
