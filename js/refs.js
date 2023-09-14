import { Tabs } from 'flowbite'
import { apiGet } from "./api-client";

const DMI_API_URL = process.env.API_URL
const tabOptions = {
  defaultTabId: 'sexes',
  activeClasses: 'text-blue-600 hover:text-blue-600 dark:text-blue-500 dark:hover:text-blue-400 border-blue-600 dark:border-blue-500',
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
  closable: true,
  onHide: () => {
    console.log('modal is hidden');
  },
  onShow: () => {
    console.log('modal is shown');
  },
  onToggle: () => {
    console.log('modal has been toggled');
  }
};

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
  async init() {
    this.tabs = new Tabs(tabElements, tabOptions)
    await this.fetchReferenceData()
    await this.fetchProviders()
  }
}
