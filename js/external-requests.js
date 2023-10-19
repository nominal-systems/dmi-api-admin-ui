import { getExternalRequests } from './api-client'

export const externalRequests = () => {
  return {
    requests: [],
    async init() {
      console.log('externalRequests.init()') // TODO(gb): remove trace
      this.requests = await getExternalRequests()
      console.log(`this.requests= ${JSON.stringify(this.requests, null, 2)}`) // TODO(gb): remove trace
    }
  }
}
