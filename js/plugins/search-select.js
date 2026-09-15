import { getQueryParams, isNullOrUndefinedOrEmpty, removeQueryParam, setQueryParam } from '../common/utils'

const defaultOptions = {
  id: 'search',
  placeholder: 'Search...',
  emptyLabel: 'No results found',
  minLength: 2,
  debounce: 300
}

export default function (Alpine) {
  Alpine.directive('search-select', (el, { value, modifiers, expression }, { effect, evaluate, evaluateLater, cleanup }) => {
    if (!value) {
      const options = Object.assign({}, defaultOptions, evaluate(expression))
      handleRoot(el, Alpine, options)
    } else if (value === 'input') {
      handleInput(el, Alpine)
    }
  })
}

function handleRoot(el, Alpine, options) {
  Alpine.bind(el, {
    'x-data'() {
      return {
        _id: options.id,
        placeholder: options.placeholder,
        emptyLabel: options.emptyLabel,
        query: '',
        items: [],
        open: false,
        loading: false,
        dirty: false,
        timeout: null,
        async init() {
          const selected = getQueryParams()[this._id]
          if (isNullOrUndefinedOrEmpty(selected)) {
            return
          }
          // Keep the filter clearable even if the selection can no longer be resolved
          this.dirty = true
          if (typeof options.selected === 'function') {
            try {
              const item = await options.selected(selected)
              if (item) {
                this.query = item.label
              }
            } catch (error) {
              console.error(error)
            }
          }
        },
        search() {
          clearTimeout(this.timeout)
          const term = this.query
          if (isNullOrUndefinedOrEmpty(term) || term.length < options.minLength) {
            this.items = []
            this.open = false
            return
          }
          this.loading = true
          this.open = true
          this.timeout = setTimeout(async () => {
            try {
              const items = await options.items(term)
              // Ignore responses for terms the user has already moved on from
              if (term === this.query) {
                this.items = items
              }
            } catch (error) {
              console.error(error)
              this.items = []
            } finally {
              this.loading = false
            }
          }, options.debounce)
        },
        select(item) {
          clearTimeout(this.timeout)
          this.query = item.label
          this.items = []
          this.open = false
          this.dirty = true
          setQueryParam(this._id, item.value)
          this.$dispatch('filter', {
            page: 1
          })
        },
        close() {
          this.open = false
        },
        clear() {
          clearTimeout(this.timeout)
          this.query = ''
          this.items = []
          this.open = false
          if (this.dirty) {
            this.dirty = false
            removeQueryParam(this._id)
            this.$dispatch('filter', {
              page: 1
            })
          }
        }
      }
    }
  })
}

function handleInput(el, Alpine) {
  Alpine.bind(el, {
    'x-model': 'query',
    '@input': 'search',
    '@focus': 'search',
    '@keyup.escape': 'clear'
  })
}
