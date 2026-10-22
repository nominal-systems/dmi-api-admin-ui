import config from './config'
import { getIntegration, republishReport } from './api-client'

const isAuthStatus = (status) => status === 401 || status === 403

const INTEGRATION_CHECK_TIMEOUT_MS = 10000

const withTimeout = (promise, ms) => Promise.race([
  promise,
  new Promise((_resolve, reject) => setTimeout(() => reject(new Error('Timed out')), ms))
])

export default ({ reportId, sourceEventId, integrationId }) => ({
  reportId,
  sourceEventId,
  integrationId,
  open: false,
  integrationStatus: null,
  integrationCheckFailed: false,
  integrationAuthFailed: false,

  init() {
    if (!this.reportId) return
    const state = this.$store.republish.for(this.reportId)
    // Reopened while a republish runs or after it ended: show that instead of fresh buttons
    if (state.inProgress || state.result || state.error) this.toggle()
  },

  // The republish lives in a store keyed by report, so closing or rebuilding the panel can't start a second one
  get state() {
    return this.$store.republish.reports[this.reportId] ?? {}
  },

  get inProgress() {
    return Boolean(this.state.inProgress)
  },

  get result() {
    return this.state.result ?? null
  },

  get error() {
    return this.state.error ?? null
  },

  async toggle() {
    this.open = !this.open
    if (this.open && this.integrationStatus === null && this.integrationId) {
      try {
        this.integrationStatus = (await withTimeout(getIntegration(this.integrationId), INTEGRATION_CHECK_TIMEOUT_MS)).status
      } catch (err) {
        // The confirm call reports the real problem, if any
        this.integrationStatus = undefined
        if (isAuthStatus(err.status)) this.integrationAuthFailed = true
        else this.integrationCheckFailed = true
      }
    }
  },

  async confirm() {
    // Captured so the outcome lands even if the panel is gone by the time the request ends
    const state = this.$store.republish.for(this.reportId)
    if (state.inProgress) return
    state.inProgress = true
    state.result = null
    state.error = null
    try {
      state.result = await republishReport(this.reportId, this.sourceEventId)
    } catch (err) {
      state.error = {
        message: err.message,
        status: err.status,
        // 5xx or network: the event may exist already
        maybePersisted: err.status === undefined || err.status >= 500
      }
    } finally {
      state.inProgress = false
    }
  },

  cancel() {
    this.open = false
    this.integrationAuthFailed = false
    this.integrationCheckFailed = false
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
    // The request may have reached the server: "try again later" would invite a duplicate
    if (maybePersisted && status === undefined) return 'The connection failed before the server answered.'
    if (maybePersisted && String(message ?? '').trimStart().startsWith('<')) {
      return `The server did not answer (HTTP ${status}).`
    }
    return message
  },

  get unknownDelivery() {
    return Boolean(this.delivery) && !['sent', 'too_large', 'error'].includes(this.delivery.status)
  },

  // At most one delivery: a subscription is unique on (event_type, subscription_type, organizationId), and there is one subscription type
  get delivery() {
    return this.result?.deliveries?.[0] ?? null
  },

  get eventUrl() {
    return `${config.get('UI_BASE')}/events/${this.result?.eventId}`
  },

  get eventsUrl() {
    return `${config.get('UI_BASE')}/events`
  }
})
