const PAGE_SIZE = 10
const MAX_PAGES = 10

export default (opts, getPageFn) => ({
  items: null,
  page: null,
  pageSize: opts.pageSize || PAGE_SIZE,
  pagesMax: opts.pagesMax || MAX_PAGES,
  total: null,
  resultsStart: null,
  resultsEnd: null,
  pagesTotal: null,
  getPageFn: getPageFn,
  async getPage(page) {
    const response = await this.getPageFn(page || this.page, this.pageSize)
    this.items = response.data
    this.total = response.total
    this.page = parseInt(response.page)
    this.resultsStart = this.page * this.pageSize - this.pageSize + 1
    this.resultsEnd = Math.min(this.page * this.pageSize, this.total)
    this.pagesTotal = Math.ceil(this.total / this.pageSize)
  },
  async nextPage() {
    if (this.page < this.pagesTotal) {
      await this.getPage(this.page + 1)
    }
  },
  async prevPage() {
    if (this.page > 1) {
      await this.getPage(this.page - 1)
    }
  },
  async init() {
    await this.getPage(1)
  }
})
