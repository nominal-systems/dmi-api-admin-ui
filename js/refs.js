import { Modal, Tabs } from 'flowbite'
import { getProviders, getRefs } from "./api-client"
import table from './plugins/table'

const PAGE_SIZE = 20

const $modalTarget = document.getElementById('refsModal')
const modalOptions = {
  placement: 'bottom-right',
  backdrop: 'dynamic',
  backdropClasses: 'bg-gray-900 bg-opacity-50 dark:bg-opacity-80 fixed inset-0 z-40',
  closable: true
}

export const refs = () => {
  return {
    // Providers
    providers: [],

    // Reference data
    type: null,
    refs: {
      sex: null,
      species: null,
      breed: null
    },
    updateRef() {
      //TODO(gb): implement ref update
    },

    // Modal
    modal: new Modal($modalTarget, modalOptions),
    editingRef: {},
    editingRefMappings: [],
    openModal(ref) {
      this.editingRef = ref
      this.editingRefMappings = []
      this.providers.forEach((provider) => {
        this.editingRefMappings.push({
          provider: provider.id,
          ref: ref.providerRef.find((providerRef) => providerRef.provider.id === provider.id)
        })
      })
      this.modal.show()
    },
    closeModal() {
      this.editingRef = {}
      this.editingRefMappings = []
      this.modal.hide()
    },

    // Tabs
    tabs: null,
    activeTab: null,
    initTabs() {
      this.type = 'sex'
      const tabOptions = {
        defaultTabId: 'sex',
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
          id: 'sex',
          triggerEl: document.querySelector('#sex-tab'),
          targetEl: document.querySelector('#sex')
        },
        {
          id: 'species',
          triggerEl: document.querySelector('#species-tab'),
          targetEl: document.querySelector('#species')
        },
        {
          id: 'breed',
          triggerEl: document.querySelector('#breed-tab'),
          targetEl: document.querySelector('#breed')
        }
      ]
      this.tabs = new Tabs(tabElements, tabOptions)
    },

    // Tables
    initTables() {
      this.refs.sex = table(
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
      this.refs.breed = table(
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
      this.providers = await getProviders()
    }
  }
}
