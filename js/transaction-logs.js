import { getQueryParams, mapHttpStatusColor, mapHttpStatusText } from './common/utils'
import { getTransactionLogs } from './api-client'

export default () => {
  return {
    logs: [],
    accessionId: null,
    error: null,
    async init() {
      const queryParams = getQueryParams()
      this.accessionId = queryParams.accessionId
      const transactionLogs = await getTransactionLogs(this.accessionId)
      if (transactionLogs.errors === undefined) {
        transactionLogs.forEach(log => {
          log.timestamp = new Date(log.timestamp).toLocaleString()
          log.message = buildMessage(log)
          log.tag = buildTag(log)
        })
        this.logs = transactionLogs
      } else {
        this.error = transactionLogs.message
      }

    }
  }
}

function buildMessage(log) {
  let message = ''
  const data = log.data
  if (log.type === 'event') {
    message = 'Event sent'
  } else if (log.type === 'order') {
    message = `Order/${log.data.id} (${log.data.requisitionId || log.data.requisitionId}) created`
  }
  return message
}

function buildTag(log) {
  const tag = {
    label: '',
    color: 'blue'
  }
  switch (log.type) {
    case 'event':
      tag.label = log.data.namespace === 'orders' ?
        log.data.data.order.status :
        log.data.data.report.status
      switch (tag.label) {
        case 'COMPLETED':
        case 'FINAL':
          tag.color = 'green'
          break
        case 'ERROR':
          tag.color = 'red'
          break
        default:
          tag.color = 'blue'
      }
      break
    case 'external-request':
      tag.label = `${log.data.status} ${mapHttpStatusText(log.data.status)}`
      tag.color = mapHttpStatusColor(log.data.status)
      break
  }
  return tag
}
