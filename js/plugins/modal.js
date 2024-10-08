import { Modal } from 'flowbite'

export default (opts) => ({
  modal: null,
  ref: opts.ref,
  onShow: opts.onShow,
  onHide: opts.onHide,
  data: opts.data,
  async init() {
    const modalOptions = {
      placement: 'bottom-right',
      backdrop: 'dynamic',
      backdropClasses: 'bg-gray-900 bg-opacity-50 dark:bg-opacity-80 fixed inset-0 z-40',
      closable: true,
      onShow: () => {
        if (this.onShow) {
          this.onShow(this)
        }
      },
      onHide: () => {
        if (this.onHide) {
          this.onHide(this)
        }
      }
    }

    this.modal = new Modal(this.$refs[this.ref], modalOptions)
  },
  async open(data) {
    if (data) {
      Object.assign(this.data, data)
    }
    this.modal.show()
  },
  async close() {
    this.modal.hide()
  }
})
