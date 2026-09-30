import { Dropdown } from 'flowbite'
import { getQueryParams, removeQueryParam, setQueryParam } from '../common/utils'
import { dateFilterPresets } from '../common/date-utils'

export default function (Alpine) {
  const defaultConfig = {
    updateQuery: false,
    toggleEnabled: true,
    toggleLabel: 'Select All',
    datePickerLabel: 'On',
    dropdownOptions: {
      placement: 'bottom',
      triggerType: 'click',
      offsetSkidding: 0,
      offsetDistance: 10,
      delay: 300,
      width: '48'
    }
  }

  Alpine.directive('filter-dropdown', (el, { value, modifiers, expression }, { effect, evaluate, evaluateLater, cleanup }) => {
    if (!value) {
      const config = Object.assign({}, defaultConfig, evaluate(expression))
      handleRoot(el, Alpine, config)
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

function handleRoot(el, Alpine, config) {
  Alpine.bind(el, {
    'x-data'() {
      return {
        _id: config.id,
        label: config.label,
        toggleLabel: config.toggleLabel,
        toggleEnabled: config.toggleEnabled,
        datePickerLabel: config.datePickerLabel,
        datePickerValue: null,
        type: config.type,
        inputType: config.type === 'date' ? 'radio' : 'checkbox',
        dirty: false,
        toggle: false,
        items: [],
        dropdownOptions: {},
        dropdown: null,
        async init() {
          const items = typeof config.items === 'function' ? await config.items() : config.items
          if (config.updateQuery) {
            const query = getQueryParams()
            if (query[this._id] !== undefined) {
              items.forEach(item => {
                item.checked = query[this._id].split(',').includes(item.value)
                this.dirty = true
              })
            }

            const checked = items.filter((i) => i.checked)
            if (checked.length > 0) {
              this.dirty = true
            }
          }
          this.items = items
          const $buttonEl = el.querySelector('[x-filter-dropdown\\:button]')
          const $menuEl = el.querySelector('[x-filter-dropdown\\:menu]')
          this.dropdownOptions = config.type === 'date'
            // Wide enough to show a full range in the picker input
            ? { ...config.dropdownOptions, width: '72', ignoreClickOutsideClass: 'flatpickr-calendar' }
            : config.dropdownOptions
          this.dropdown = new Dropdown($menuEl, $buttonEl, this.dropdownOptions)
        }
      }
    },
    '@selectionChanged'() {
      const $itemEl = el.querySelectorAll('[x-filter-dropdown\\:item] input')
      this.dirty = isDirty($itemEl)
      if (config.updateQuery) {
        this.$dispatch('updateQueryParams')
        this.$dispatch('filter', { page: 1 })
      }
    },
    '@itemClicked'() {
      const $itemEl = el.querySelectorAll('[x-filter-dropdown\\:item] input')
      this.toggle = countChecked($itemEl) === $itemEl.length
      this.$dispatch('selectionChanged', { el: this.$el })
    },
    '@selectAllToggled'() {
      const $itemEl = el.querySelectorAll('[x-filter-dropdown\\:item] input')
      $itemEl.forEach(item => {
        item.checked = this.toggle
      })
      this.$dispatch('selectionChanged', { el: this.$el })
    },
    '@updateQueryParams'() {
      const checked = []
      el.querySelectorAll('[x-filter-dropdown\\:item] input').forEach(item => {
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
  Alpine.bind(el, {
    'x-data'() {
      return {
        init() {
          const date = getQueryParams().date
          const presetValues = dateFilterPresets().map((preset) => preset.value)
          if (date && !presetValues.includes(date)) {
            this.datePickerValue = date
            $datePickerRadioInput.checked = true
          }
        }
      }
    },
    '@selectionChanged.window'(ev) {
      // Ignore selection changes from other dropdowns
      if (ev.target !== el.closest('[x-filter-dropdown]')) {
        return
      }

      this.datePickerValue = null
      const picker = $datePickerInput._flatpickr
      picker?.clear()
      picker?.jumpToDate(new Date())
      $datePickerRadioInput.checked = false
    },
    '@datePickerInput'(ev) {
      if (ev.detail.date === this.datePickerValue && $datePickerRadioInput.checked) {
        return
      }

      this.datePickerValue = ev.detail.date
      $datePickerRadioInput.checked = true
      setQueryParam(this._id, this.datePickerValue)
      this.$dispatch('filter', { page: 1 })
    }
  })
  Alpine.bind($datePickerRadioInput, {
    '@input'() {
      setQueryParam(this._id, this.datePickerValue)
      this.$dispatch('filter', { page: 1 })
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
