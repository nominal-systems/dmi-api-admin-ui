import { getQueryParams, mapHttpStatusColor, mapHttpStatusText } from './common/utils'
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
        log.message = buildMessage(log)
        log.tag = buildTag(log)
      })
      this.logs = transactionLogs
    }
  }
}

function buildMessage(log) {
  let message = ''
  const data = log.data
  if (log.type === 'event') {
    let operation = ''
    if (data.type.includes('created')) {
      operation = 'created'
    } else if (data.type.includes('updated')) {
      operation = 'updated'

    }
    let entity = ''
    switch (data.namespace) {
      case 'orders':
        entity = `Order/${data.data.orderId}`
        break
      case 'reports':
        entity = `Report/${data.data.reportId}`
        break
    }
    message = `${operation} ${entity}`
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
      if (['COMPLETED', 'FINAL'].includes(log.data.status)) {
        tag.color = 'green'
      }
      break
    case 'external-request':
      tag.label = `${log.data.status} ${mapHttpStatusText(log.data.status)}`
      tag.color = mapHttpStatusColor(log.data.status)
      break
  }
  return tag
}
