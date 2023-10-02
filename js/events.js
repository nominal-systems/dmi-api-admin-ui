import { getEvents } from './api-client'
import { Modal } from 'flowbite'

export const events = {
    events: [],
    event: null,
    modal: null,
    openModal(event) {
        this.event = event
        this.modal.show()
    },
    closeModal() {
        this.event = null
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
    async fetchEvents() {
        this.events = (await getEvents()).map(event => {
            event.createdAtString = new Date(event.createdAt).toLocaleString()
            return event
        })
    }
}
