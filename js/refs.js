import { Tabs } from 'flowbite'
import { apiGet } from "./api-client";

const DMI_API_URL = process.env.API_URL
const options = {
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

export const refs = {
  tabs: [],
  items: [],
  referenceData: {
    sexes: [],
    species: [],
    breeds: []
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
    await this.fetchReferenceData()
    this.tabs = new Tabs(tabElements, options);
  }
}
