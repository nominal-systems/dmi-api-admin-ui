import { getExternalRequest, getExternalRequests, getProviders } from './api-client'
import { Modal } from 'flowbite'
import table from './plugins/table'

export const externalRequests = () => {
  return {
    providers: [],

    // Modal
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
    initModal() {
      const modalOptions = {
        placement: 'bottom-right',
        backdrop: 'dynamic',
        backdropClasses: 'bg-gray-900 bg-opacity-50 dark:bg-opacity-80 fixed inset-0 z-40',
        closable: true
      }
      this.modal = new Modal(this.$refs['externalRequestModal'], modalOptions)
    },

    // Table
    table: null,
    initTable() {
      this.table = table(
        {
        pageSize: 20,
        pagesMax: 10,
      }, async (page, pageSize) => {
          return await getExternalRequests(page, pageSize)
        })
    },
    async init() {
      this.initTable()
      this.initModal()
      this.providers = await getProviders()
    }
  }
}
