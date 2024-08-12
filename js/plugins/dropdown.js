import { Dropdown } from 'flowbite'

export default function (Alpine) {
  const defaultOptions = {
    toggleLabel: 'Select All',
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
    let $itemEl = null
    document.addEventListener('alpine:initialized', () => {
      $itemEl = el.querySelectorAll('[x-dropdown\\:item] input')
      for (const item of $itemEl) {
        item.addEventListener('click', (e) => {
          this.state.dirty = isDirty($itemEl)
          this.state.toggle = countChecked($itemEl) === $itemEl.length
        })
      }
    })

    // Dropdown data
    const options = Object.assign({}, defaultOptions, evaluate(expression))
    this.label = options.label
    this.state = Alpine.reactive({
      toggle: false,
      dirty: false
    })
    this.items = Alpine.reactive(options.items)
    this.toggleLabel = options.toggleLabel

    // Toggle
    $toggleEl.addEventListener('click', (e) => {
      this.toggle = $toggleEl.checked
      $itemEl.forEach(item => {
        item.checked = this.toggle
      })
      this.state.dirty = isDirty($itemEl)
    })

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

function countChecked($nodeList) {
  let checked = 0
  $nodeList.forEach(item => {
    if (item.checked) {
      checked += 1
    }
  })

  return checked
}

function isDirty($nodeList) {
  return countChecked($nodeList) > 0
}
