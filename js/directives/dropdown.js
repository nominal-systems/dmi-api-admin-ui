import { Dropdown } from 'flowbite'

export default function (Alpine) {
  Alpine.directive('dropdown', (el, { value, modifiers, expression }, { effect, evaluate, evaluateLater, cleanup }) => {
    if (!value) {
      handleRoot(el, Alpine)
    }
  })
}

function handleRoot(el, Alpine) {
  Alpine.bind(el, {
    'x-data'() {
      return {
        dropdown: null,
        isOpen: false,
        init() {
          const $menuEl = el.querySelector('[x-dropdown\\:menu]')
          const $buttonEl = el.querySelector('[x-dropdown\\:button]')
          this.dropdown = new Dropdown($menuEl, $buttonEl, {
            placement: 'bottom',
            triggerType: 'click',
            offsetSkidding: 0,
            offsetDistance: 10,
            delay: 300,
            onShow: () => {
              this.isOpen = true
            },
            onHide: () => {
              this.isOpen = false
            }
          })
        },
        toggle() {
          this.dropdown.toggle()
        },
        open() {
          this.dropdown.show()
        },
        close() {
          this.dropdown.hide()
        }
      }
    }
  })
}
