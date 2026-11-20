import { getQueryParams, isNullOrUndefinedOrEmpty, removeQueryParam, setQueryParam } from '../common/utils'

const defaultOptions = {
  placeholder: 'Search...',
  label: 'Search',
  // The page query parameter that holds the search
  param: 'search'
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
      const queryParams = getQueryParams()
      this.query = queryParams[options.param] || null
      return {
        placeholder: options.placeholder,
        label: options.label,
        query: this.query,
        dirty: this.query || false,
        clear() {
          this.query = null
          this.dirty = false
          removeQueryParam(options.param)
          this.$dispatch('filter', {
            page: 1
          })
        },
        search() {
          this.dirty = !isNullOrUndefinedOrEmpty(this.query)
          setQueryParam(options.param, this.query)
          this.$dispatch('filter', {
            query: this.query,
            page: 1
          })
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
