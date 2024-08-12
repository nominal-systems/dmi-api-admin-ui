import { Dropdown } from 'flowbite'

export default function (Alpine) {
  const defaultOptions = {
    toggleLabel: 'Select All',
  }

  Alpine.directive('dropdown', (el, { value, modifiers, expression }, { effect, evaluate, evaluateLater, cleanup }) => {
    if (!value) {
      const options = Object.assign({}, defaultOptions, evaluate(expression))
      handleRoot(el, Alpine, options)
    } else if (value === 'button') {
    } else if (value === 'menu') {
    } else if (value === 'item') {
      handleItem(el, Alpine)
    } else if (value === 'toggle') {
      handleToggle(el, Alpine)
    }
  })
}

function handleRoot(el, Alpine, options) {
  Alpine.bind(el, {
    'x-data'() {
      return {
        init() {
          const $buttonEl = el.querySelector('[x-dropdown\\:button]')
          const $menuEl = el.querySelector('[x-dropdown\\:menu]')
          let $itemEl = undefined
          setTimeout(() => {
            $itemEl = el.querySelectorAll('[x-dropdown\\:item] input')
          })

          new Dropdown($menuEl, $buttonEl, {
            placement: 'bottom',
            triggerType: 'click',
            offsetSkidding: 0,
            offsetDistance: 10,
            delay: 300,
            ignoreClickOutsideClass: false
          })
          el.addEventListener('selectionChanged', (e) => {
            this.dirty = isDirty($itemEl)
            this.toggle = countChecked($itemEl) === $itemEl.length
          })
          el.addEventListener('selectAllToggled', (e) => {
            $itemEl.forEach(item => {
              item.checked = this.toggle
            })
            this.dirty = isDirty($itemEl)
          })
        },
        label: options.label,
        toggleLabel: options.toggleLabel,
        dirty: false,
        toggle: false,
        items: options.items
      }
    }
  })
}

function handleToggle(el, Alpine) {
  const $toggleInput = el.querySelector('input')
  Alpine.bind($toggleInput, {
    '@click'() {
      this.toggle = !this.toggle
      this.$dispatch('selectAllToggled', { el: this.$el })
    }
  })
}

function handleItem(el, Alpine) {
  Alpine.bind(el.querySelector('input'), {
    '@click'() {
      this.$dispatch('selectionChanged', { el: this.$el })
    }
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
