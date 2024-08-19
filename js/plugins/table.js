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
  nav: null,
  getPageFn: getPageFn,
  async getPage(page) {
    const response = await this.getPageFn(page || this.page, this.pageSize)
    this.items = response.data
    this.total = response.total
    this.page = parseInt(response.page)
    this.resultsStart = this.page * this.pageSize - this.pageSize + 1
    this.resultsEnd = Math.min(this.page * this.pageSize, this.total)
    this.pagesTotal = Math.ceil(this.total / this.pageSize)
    this.nav = navPages(this.page, this.pagesTotal, this.pagesMax)
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
