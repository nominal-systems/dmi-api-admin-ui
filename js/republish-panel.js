import config from './config'
import { getIntegration, republishReport } from './api-client'

const isAuthStatus = (status) => status === 401 || status === 403

export default ({ reportId, sourceEventId, integrationId }) => ({
  reportId,
  sourceEventId,
  integrationId,
  open: false,
  inProgress: false,
  integrationStatus: null,
  result: null,
  error: null,
  integrationAuthFailed: false,

  async toggle() {
    this.open = !this.open
    if (this.open && this.integrationStatus === null && this.integrationId) {
      try {
        this.integrationStatus = (await getIntegration(this.integrationId)).status
      } catch (err) {
        // The confirm call reports the real problem, if any
        this.integrationStatus = undefined
        if (isAuthStatus(err.status)) this.integrationAuthFailed = true
      }
    }
  },

  async confirm() {
    if (this.inProgress) return
    this.inProgress = true
    this.result = null
    this.error = null
    try {
      this.result = await republishReport(this.reportId, this.sourceEventId)
    } catch (err) {
      if (err.redirected) return
      this.error = {
        message: err.message,
        status: err.status,
        // 5xx or network: the event may exist already
        maybePersisted: err.status === undefined || err.status >= 500
      }
    } finally {
      this.inProgress = false
    }
  },

  cancel() {
    this.open = false
    this.result = null
    this.error = null
    this.integrationAuthFailed = false
    // Retry the lookup next time if it failed
    if (this.integrationStatus === undefined) this.integrationStatus = null
  },

  get checkingIntegration() {
    return Boolean(this.integrationId) && this.integrationStatus === null
  },

  get sessionExpired() {
    return this.integrationAuthFailed || isAuthStatus(this.error?.status)
  },

  // 4xx other than auth: the request was rejected before creating anything
  get nothingSent() {
    const status = this.error?.status
    return status >= 400 && status < 500 && !this.sessionExpired
  },

  get errorText() {
    const { message, status, maybePersisted } = this.error ?? {}
    // An order's report before any results arrive: the API refuses it with a 409
    if (status === 409) return 'The report has no results yet.'
    if (maybePersisted && String(message ?? '').trimStart().startsWith('<')) {
      return status ? `The server did not answer (HTTP ${status}).` : 'The server did not answer.'
    }
    return message
  },

  get unknownDelivery() {
    return Boolean(this.delivery) && !['sent', 'too_large', 'error'].includes(this.delivery.status)
  },

  get delivery() {
    return this.result?.deliveries?.[0] ?? null
  },

  get eventUrl() {
    return `${config.get('UI_BASE')}/events/${this.result?.eventId}`
  }
})
