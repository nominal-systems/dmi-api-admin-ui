import { isNullOrUndefinedOrEmpty } from '../utils'

const defaultOptions = {
  placeholder: 'Search...',
  label: 'Search'
}

export default function (Alpine) {
  Alpine.directive('search', (el, { value, modifiers, expression }, { effect, evaluate, evaluateLater, cleanup }) => {
    if (!value) {
      const options = Object.assign({}, defaultOptions, evaluate(expression))
      handleRoot(el, Alpine, options)
    } else if (value === 'input') {
      handleInput(el, Alpine)
    } else if (value === 'button') {
      handleButton(el, Alpine)
    }
  })
}

function handleRoot(el, Alpine, options) {
  Alpine.bind(el, {
    'x-data'() {
      return {
        placeholder: options.placeholder,
        label: options.label,
        query: null,
        dirty: false,
        clear() {
          this.query = null
          this.dirty = false
          this.$dispatch('filter', { query: this.query })
        },
        search() {
          this.dirty = !isNullOrUndefinedOrEmpty(this.query)
          this.$dispatch('filter', { query: this.query })
        }
      }
    }
  })
}

function handleInput(el, Alpine) {
  Alpine.bind(el, {
    'x-model': 'query',
    '@keyup.enter': 'search',
    '@keyup.escape': 'clear'
  })
}

function handleButton(el, Alpine) {
  Alpine.bind(el, {
    '@click': 'search'
  })
}
