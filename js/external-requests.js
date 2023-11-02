import { getExternalRequests, getProviders } from './api-client'

const PAGE_SIZE = 100
const MAX_PAGES = 10

export const externalRequests = () => {
  return {
    page: null,
    pageSize: PAGE_SIZE,
    pagesMax: MAX_PAGES,
    pagesTotal: null,
    resultsStart: null,
    resultsEnd: null,
    total: null,
    requests: [],
    providers: [],
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
      this.providers = await getProviders()
    }
  }
}
