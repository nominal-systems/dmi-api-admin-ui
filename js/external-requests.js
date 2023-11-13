import { getExternalRequest, getExternalRequests, getProviders } from './api-client'
import { Modal } from 'flowbite'

const PAGE_SIZE = 100
const MAX_PAGES = 10

export const externalRequests = () => {
  return {
    page: null,
    pageSize: PAGE_SIZE,
    pagesMax: MAX_PAGES,
    pagesTotal: null,
    resultsStart: null,
    resultsEnd: null,
    total: null,
    requests: [],
    providers: [],
    modal: null,
    externalRequest: null,
    async openModal(externalRequest) {
      this.externalRequest = await getExternalRequest(externalRequest._id)
      this.modal.show()
    },
    closeModal() {
      this.externalRequest = null
      this.modal.hide()
    },
    async getPage(page) {
      this.page = page
      const requests = await getExternalRequests(this.page, this.pageSize)
      this.requests = requests.data
      this.total = requests.total
      this.page = requests.page
      this.resultsStart = this.page * this.pageSize - this.pageSize + 1
      this.resultsEnd = Math.min(this.page * this.pageSize, this.total)
      this.pagesTotal = Math.ceil(this.total / this.pageSize)
    },
    initModal() {
      const modalOptions = {
        placement: 'bottom-right',
        backdrop: 'dynamic',
        backdropClasses: 'bg-gray-900 bg-opacity-50 dark:bg-opacity-80 fixed inset-0 z-40',
        closable: true
      }
      this.modal = new Modal(this.$refs['externalRequestModal'], modalOptions)
    },
    async init() {
      this.initModal()
      await this.getPage(1)
      this.providers = await getProviders()
    }
  }
}
