import { Dropdown } from 'flowbite'

export default function (Alpine) {
  const defaultOptions = {
    items: [],
    toggle: false,
    toggleLabel: 'Select All',
    dirty: false
  }

  Alpine.directive('dropdown', (el, { value, modifiers, expression }, { effect, evaluate, evaluateLater, cleanup }) => {
    if (value === 'button') {
      return // This will get handled by the main directive...
    }

    if (value === 'menu') {
      return // This will get handled by the main directive...
    }

    if (value === 'item') {
      return // This will get handled by the main directive...
    }

    if (value === 'toggle') {
      return // This will get handled by the main directive
    }

    // Selectors
    const $buttonEl = el.querySelector('[x-dropdown\\:button]')
    const $menuEl = el.querySelector('[x-dropdown\\:menu]')
    const $toggleEl = el.querySelector('[x-dropdown\\:toggle] input')

    // Dropdown data
    const options = Object.assign({}, defaultOptions, evaluate(expression))
    Object.assign(this, options)
    this.items = this.items.map(item => {
      item.checked = false
      return item
    })

    // Toggle
    $toggleEl.addEventListener('click', (e) => {
      this.toggle = $toggleEl.checked
      this.items.map(item => {
        item.checked = $toggleEl.checked
      })
      //TODO(gb): should set a dirty class on the dropdown button
    })

    // TODO (gb) add event listener on menu item change and update the toggle state

    // Dropdown
    new Dropdown($menuEl, $buttonEl, {
      placement: 'bottom',
      triggerType: 'click',
      offsetSkidding: 0,
      offsetDistance: 10,
      delay: 300,
      ignoreClickOutsideClass: false,
      onHide: () => {
        console.log('dropdown has been hidden')
      },
      onShow: () => {
        console.log('dropdown has been shown')
      },
      onToggle: () => {
        console.log('dropdown has been toggled')
      },
    })
  })
}
