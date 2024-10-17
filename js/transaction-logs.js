import { getQueryParams } from './common/utils'
import { getTransactionLogs } from './api-client'

export default () => {
  return {
    accessionId: null,
    logs: [],
    async init() {
      const queryParams = getQueryParams()
      this.accessionId = queryParams.accessionId
      const transactionLogs = await getTransactionLogs(this.accessionId)
      transactionLogs.forEach(log => {
        log.timestamp = new Date(log.timestamp).toLocaleString()
      })
      this.logs = transactionLogs
    }
  }
}
