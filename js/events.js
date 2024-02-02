import { getEvents } from './api-client'
import { Modal } from 'flowbite'
import table from './plugins/table'

export const events = {
  // Events
  table: null,
  initTable() {
    this.table = table(
      {
        pageSize: 20,
        pagesMax: 10,
      }, async (page, pageSize) => {
        return await getEvents(page, pageSize)
      })
  },

  // Modal
  modal: null,
  modalEvent: null,
  openModal(ev) {
    this.modalEvent = ev
    this.modal.show()
  },
  closeModal() {
    this.modalEvent = null
    this.modal.hide()
  },
  initModal() {
    const modalOptions = {
      placement: 'bottom-right',
      backdrop: 'dynamic',
      backdropClasses: 'bg-gray-900 bg-opacity-50 dark:bg-opacity-80 fixed inset-0 z-40',
      closable: true
    }
    this.modal = new Modal(this.$refs['eventModal'], modalOptions)
  },

  async init() {
    this.initModal()
    this.initTable()
  }
}
