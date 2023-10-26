import { getExternalRequests } from './api-client'

const PAGE_SIZE = 25

export const externalRequests = () => {
  return {
    page: null,
    pageSize: PAGE_SIZE,
    pagesTotal: null,
    resultsStart: null,
    resultsEnd: null,
    total: null,
    requests: [],
    async getPage(page) {
      this.page = page
      const requests = await getExternalRequests(this.page, this.pageSize)
      this.requests = requests.data
      this.total = requests.total
      this.page = requests.page
      this.resultsStart = this.page * this.pageSize - this.pageSize + 1
      this.resultsEnd = Math.min(this.page * this.pageSize, this.total)
      this.pagesTotal = Math.ceil(this.total / this.pageSize)
    },
    async init() {
      await this.getPage(1)
    }
  }
}
