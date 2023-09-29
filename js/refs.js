import { Modal, Tabs } from 'flowbite'
import { apiGet } from "./api-client";

const DMI_API_URL = process.env.API_URL
let DEFAULT_TAB_ID = 'sexes'
const tabOptions = {
  defaultTabId: DEFAULT_TAB_ID,
  activeClasses: 'text-purple-600 hover:text-purple-600 dark:text-purple-500 dark:hover:text-purple-400 border-purple-600 dark:border-purple-500',
  inactiveClasses: 'text-gray-500 hover:text-gray-600 dark:text-gray-400 border-gray-100 hover:border-gray-300 dark:border-gray-700 dark:hover:text-gray-300',
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
const $modalTarget = document.getElementById('refsModal');
const modalOptions = {
  placement: 'bottom-right',
  backdrop: 'dynamic',
  backdropClasses: 'bg-gray-900 bg-opacity-50 dark:bg-opacity-80 fixed inset-0 z-40',
  closable: true
}

export const refs = {
  tabs: [],
  referenceData: {
    sexes: [],
    species: [],
    breeds: []
  },
  providers: [],
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
  updateRef() {
    console.log(`this.editingRef= ${JSON.stringify(this.editingRef, null, 2)}`) // TODO(gb): remove trace
    //TODO(gb): implement ref update
  },
  async fetchProviders() {
    await apiGet(`${DMI_API_URL}/admin/providers`, (body) => {
      this.providers = body
    })
  },
  async fetchReferenceData() {
    await Promise.all([
      apiGet(`${DMI_API_URL}/admin/refs/sexes`, (body) => {
        this.referenceData.sexes = body.items
      }),
      apiGet(`${DMI_API_URL}/admin/refs/species`, (body) => {
        this.referenceData.species = body.items
      }),
      apiGet(`${DMI_API_URL}/admin/refs/breeds`, (body) => {
        this.referenceData.breeds = body.items
      })
    ])
  },
  async initRefs() {
    this.tabs = new Tabs(tabElements, tabOptions)
    await this.fetchReferenceData()
    await this.fetchProviders()
  }
}
