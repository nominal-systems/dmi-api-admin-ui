import { Modal, Tabs } from 'flowbite'
import { getProviders, getRefs } from "./api-client"

const PAGE_SIZE = 100
const MAX_PAGES = 10

const $modalTarget = document.getElementById('refsModal')
const modalOptions = {
  placement: 'bottom-right',
  backdrop: 'dynamic',
  backdropClasses: 'bg-gray-900 bg-opacity-50 dark:bg-opacity-80 fixed inset-0 z-40',
  closable: true
}

export const refs = {
  // Providers
  providers: [],
  async fetchProviders() {
    this.providers = await getProviders()
  },

  // Reference data
  referenceData: {
    sex: [],
    species: [],
    breed: []
  },
  type: null,
  page: null,
  pageSize: PAGE_SIZE,
  pagesMax: MAX_PAGES,
  pagesTotal: null,
  resultsStart: null,
  resultsEnd: null,
  total: null,
  updateRef() {
    //TODO(gb): implement ref update
  },
  async getPage(type, page) {
    this.page = page
    this.type = type
    const refs = await getRefs(type, this.page, this.pageSize)
    this.referenceData[type] = refs.data
    this.total = refs.total
    this.page = refs.page
    this.resultsStart = this.page * this.pageSize - this.pageSize + 1
    this.resultsEnd = Math.min(this.page * this.pageSize, this.total)
    this.pagesTotal = Math.ceil(this.total / this.pageSize)
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
    const tabOptions = {
      defaultTabId: 'sex',
      activeClasses: 'text-purple-600 hover:text-purple-600 dark:text-purple-500 dark:hover:text-purple-400 border-purple-600 dark:border-purple-500',
      inactiveClasses: 'text-gray-500 hover:text-gray-600 dark:text-gray-400 border-gray-100 hover:border-gray-300 dark:border-gray-700 dark:hover:text-gray-300',
      onShow: async (tab) => {
        this.activeTab = tab.getActiveTab()
        await this.getPage(this.activeTab.id, 1)
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
  async initRefs() {
    await this.fetchProviders()
    this.initTabs()
  }
}
