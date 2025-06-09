import Alpine from 'alpinejs'
import { getQueryParams, mapHttpStatusColor, mapHttpStatusText } from './common/utils'
import { getTransactionLogs } from './api-client'

export default () => {
  return {
    logs: [],
    accessionId: null,
    error: null,
    filter: {
      type: [
        { label: 'Events', value: 'event', checked: true },
        { label: 'External Requests', value: 'external-request', checked: true },
        { label: 'Internal Events', value: 'internal-event', checked: false }
      ]
    },
    doFilter() {
      this.logs.map((log) => {
        log.show = log.type === 'order' || this.filter.type
          .filter((t) => t.checked)
          .map((t) => t.value)
          .includes(log.type)
      })
    },

    async init() {
      const queryParams = getQueryParams()
      this.accessionId = queryParams.accessionId
      Alpine.store('title').set(`Transaction Logs for ${this.accessionId}`)
      const transactionLogs = await getTransactionLogs(this.accessionId)
      if (transactionLogs.errors === undefined) {
        transactionLogs.forEach(log => {
          log.timestamp = new Date(log.timestamp).toLocaleString()
          log.message = buildMessage(log)
          log.tag = buildTag(log)
          if (log.type === 'external-request') {
            prepareExternalRequest(log)
          }
        })
        this.logs = transactionLogs
      } else {
        this.error = transactionLogs.message
      }
      this.doFilter();
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

function prepareExternalRequest(log) {
  const data = log.data
  let body = data.body
  if (!body) return

  const contentType = data.headers?.['content-type'] ||
    data.headers?.['Content-Type'] ||
    'application/pdf'

  if (typeof body === 'object' && body.type === 'Buffer' && Array.isArray(body.data)) {
    const uint8 = Uint8Array.from(body.data)
    data.body = `data:${contentType};base64,${bytesToBase64(uint8)}`
    data.bodyIsBinary = true
    return
  }

  if (typeof body === 'string') {
    try {
      const parsed = JSON.parse(body)
      if (parsed.type === 'Buffer' && Array.isArray(parsed.data)) {
        const uint8 = Uint8Array.from(parsed.data)
        data.body = `data:${contentType};base64,${bytesToBase64(uint8)}`
        data.bodyIsBinary = true
        return
      }
    } catch (e) {
      /* not JSON */
    }
    const binaryHint = contentType.includes('pdf') || body.startsWith('%PDF-') ||
      /[\x00-\x08\x0E-\x1F]/.test(body)
    if (binaryHint) {
      data.body = `data:${contentType};base64,${stringToBase64(body)}`
      data.bodyIsBinary = true
    }
  }
}

function bytesToBase64(bytes) {
  let binary = ''
  const len = bytes.length
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

function stringToBase64(str) {
  const bytes = new Uint8Array(str.length)
  for (let i = 0; i < str.length; i++) {
    bytes[i] = str.charCodeAt(i) & 0xff
  }
  return bytesToBase64(bytes)
}
