import { getQueryParams, isNullOrUndefined, setQueryParam } from '../common/utils'

export default (opts) => ({
  currentPage: opts.initialPage || 1,
  pageTarget: null,
  pageSize: opts.pageSize || 10,
  pagesMax: opts.pagesMax || 10,
  totalPages: null,
  items: [],
  loading: false,
  error: null,
  totalItems: null,
  resultsStart: null,
  resultsEnd: null,
  pagesNav: null,
  filter: opts.filter,
  actions: opts.actions,
  selectedItems: [],
  selectAllCheckbox: false,
  async init() {
    if (!isNullOrUndefined(this.filter)) {
      initFilter(this.filter)
    }
    await this.fetchData()
  },
  async fetchData($event) {
    this.loading = true
    this.error = null
    if ($event && $event.detail.page) {
      this.currentPage = $event.detail.page
    }
    try {
      // Table rows
      const response = await opts.getPage(this.currentPage, this.pageSize)
      if (opts.processResults) {
        await opts.processResults(response.data)
      }
      this.items = response.data

      // Bulk actions
      if (this.actions) {
        this.items.forEach((item) => {
          item._checked = isInSelection(this.selectedItems, item)
          this.selectionUpdated(item)
        })
      }

      // Pagination
      this.totalItems = response.total
      this.resultsStart = this.currentPage * this.pageSize - this.pageSize + 1
      this.resultsEnd = Math.min(this.currentPage * this.pageSize, this.totalItems)
      this.totalPages = Math.ceil(this.totalItems / this.pageSize)
      this.pagesNav = navPages(this.currentPage, this.totalPages, this.pagesMax)
    } catch (error) {
      console.error(error)
      this.error = error
    } finally {
      this.loading = false
    }
  },
  async setPageSize(pageSize) {
    this.currentPage = 1
    await this.fetchData()
  },
  async goToPage(pageNumber) {
    if (isNaN(pageNumber)) {
      this.pageTarget = null
      return
    }
    if (parseInt(pageNumber) > this.totalPages) {
      pageNumber = this.totalPages
    }
    this.currentPage = parseInt(pageNumber)
    this.pageTarget = null
    await this.fetchData()
  },
  async nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++
      await this.fetchData()
    }
  },
  async prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--
      await this.fetchData()
    }
  },
  getSelection() {
    return this.selectedItems
  },
  selectionUpdated(item) {
    updateSelection(this.selectedItems, item, item._checked)
    this.selectAllCheckbox = this.items.every((item) => item._checked)
  },
  clearSelection() {
    this.selectedItems = []
    this.items.forEach((item) => {
      item._checked = false
    })
    this.selectAllCheckbox = this.items.every((item) => item._checked)
  },
  toggleSelectAll() {
    const allChecked = this.items.every((item) => item._checked)
    this.items.forEach((item) => {
      item._checked = !allChecked
      this.selectionUpdated(item)
    })
  }
})

function initFilter(filter) {
  Object.keys(filter).forEach((key) => {
    if (filter[key].updateQuery) {
      // Set query params
      if (typeof filter[key].items !== 'function') {
        const queryParams = getQueryParams()
        const checked = filter[key].items.filter((i) => {
          return i.checked || queryParams[key]?.split(',').includes(i.value)
        }).map((i) => i.value)
        if (checked.length > 0) {
          setQueryParam(key, checked.join(','))
        }
      }
    }
  })
}

function navPages(page, pagesTotal, pagesMax) {
  const half = Math.floor(pagesMax / 2)
  let start = Math.max(1, page - half)
  let end = Math.min(pagesTotal, page + half)

  // Adjust the start and end if the pagesMax window goes out of bounds
  if (end - start + 1 < pagesMax) {
    if (start === 1) {
      end = Math.min(pagesTotal, start + pagesMax - 1)
    } else if (end === pagesTotal) {
      start = Math.max(1, end - pagesMax + 1)
    }
  }

  let pages = [];
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  return pages
}

function updateSelection(selection, item, checked) {
  if (checked) {
    if (!isInSelection(selection, item)) {
      selection.push(item)
    }
  } else {
    const index = indexInSelection(selection, item)
    if (index >= 0) {
      selection.splice(index, 1)
    }
  }
}

function isInSelection(selection, item) {
  return selection.some((el) => el.id === item.id)
}

function indexInSelection(selection, item) {
  return selection.findIndex((el) => el.id === item.id)
}
