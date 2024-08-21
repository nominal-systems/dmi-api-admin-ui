import { Dropdown } from 'flowbite'
import { getQueryParams, removeQueryParam, setQueryParam } from '../utils'

export default function (Alpine) {
  const defaultOptions = {
    updateQuery: false,
    toggleEnabled: true,
    toggleLabel: 'Select All',
    datePickerLabel: 'On'
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
    } else if (value === 'datepicker') {
      handleDatepicker(el, Alpine)
    }
  })
}

function handleRoot(el, Alpine, options) {
  Alpine.bind(el, {
    'x-data'() {
      return {
        _id: options.id,
        label: options.label,
        toggleLabel: options.toggleLabel,
        toggleEnabled: options.toggleEnabled,
        datePickerLabel: options.datePickerLabel,
        datePickerValue: null,
        type: options.type,
        inputType: options.type === 'date' ? 'radio' : 'checkbox',
        dirty: false,
        toggle: false,
        items: [],
        dropdown: null,
        async init() {
          const items = [...await options.items()]
          if (options.updateQuery) {
            const query = getQueryParams()
            if (query[this._id] !== undefined) {
              items.forEach(item => {
                item.checked = query[this._id].includes(item.value)
                this.dirty = true
              })
            }

            // Set query params
            const checked = []
            items.forEach(item => {
              if (item.checked) {
                checked.push(item.value)
              }
            })
            if (checked.length > 0) {
              setQueryParam(this._id, checked.join(','))
              this.dirty = true
            } else {
              removeQueryParam(this._id)
            }
          }
          this.items = items
          const $buttonEl = el.querySelector('[x-dropdown\\:button]')
          const $menuEl = el.querySelector('[x-dropdown\\:menu]')
          const dropdownOptions = {
            placement: 'bottom',
            triggerType: 'click',
            offsetSkidding: 0,
            offsetDistance: 10,
            delay: 300
          }
          if (options.type === 'date') {
            dropdownOptions.ignoreClickOutsideClass = 'datepicker'
          }
          this.dropdown = new Dropdown($menuEl, $buttonEl, dropdownOptions)
        }
      }
    },
    '@selectionChanged'() {
      const $itemEl = el.querySelectorAll('[x-dropdown\\:item] input')
      this.dirty = isDirty($itemEl)
      if (options.updateQuery) {
        this.$dispatch('updateQueryParams')
        this.$dispatch('filter')
      }
    },
    '@itemClicked'() {
      const $itemEl = el.querySelectorAll('[x-dropdown\\:item] input')
      this.toggle = countChecked($itemEl) === $itemEl.length
      this.$dispatch('selectionChanged', { el: this.$el })
    },
    '@selectAllToggled'() {
      const $itemEl = el.querySelectorAll('[x-dropdown\\:item] input')
      $itemEl.forEach(item => {
        item.checked = this.toggle
      })
      this.$dispatch('selectionChanged', { el: this.$el })
    },
    '@updateQueryParams'() {
      const checked = []
      el.querySelectorAll('[x-dropdown\\:item] input').forEach(item => {
        if (item.checked) {
          checked.push(item.value)
        }
      })
      if (checked.length > 0) {
        setQueryParam(this._id, checked.join(','))
      } else {
        removeQueryParam(this._id)
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

function handleDatepicker(el, Alpine) {
  const $datePickerRadioInput = el.querySelector('input')
  const $datePickerInput = el.querySelector('label input')
  Alpine.bind($datePickerRadioInput, {
    '@input'() {
      setQueryParam(this._id, this.datePickerValue)
      this.$dispatch('filter')
    }
  })
  Alpine.bind($datePickerInput, {
    '@datePickerInput'(ev) {
      this.datePickerValue = ev.detail.date
      $datePickerRadioInput.checked = true
      setQueryParam(this._id, this.datePickerValue)
      this.$dispatch('filter')
    }
  })
}

function handleItem(el, Alpine) {
  Alpine.bind(el.querySelector('input'), {
    '@click'() {
      this.$dispatch('itemClicked', { el: this.$el })
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
