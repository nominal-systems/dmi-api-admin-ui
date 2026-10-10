import config from './config'
import { getIntegration, republishReport } from './api-client'

export default ({ reportId, sourceEventId, integrationId, type }) => ({
  reportId,
  sourceEventId,
  integrationId,
  type,
  open: false,
  inProgress: false,
  integrationStatus: null,
  result: null,
  error: null,

  async toggle() {
    this.open = !this.open
    if (this.open && this.integrationStatus === null && this.integrationId) {
      try {
        this.integrationStatus = (await getIntegration(this.integrationId)).status
      } catch (err) {
        // The confirm call reports the real problem, if any
        this.integrationStatus = undefined
      }
    }
  },

  async confirm() {
    this.inProgress = true
    this.result = null
    this.error = null
    try {
      this.result = await republishReport(this.reportId, this.sourceEventId)
    } catch (err) {
      if (err.redirected) return
      this.error = {
        message: err.message,
        // 5xx or network: the event may exist already
        maybePersisted: err.status === undefined || err.status >= 500
      }
    } finally {
      this.inProgress = false
    }
  },

  get delivery() {
    return this.result?.deliveries?.[0] ?? null
  },

  get eventUrl() {
    return `${config.get('UI_BASE')}/events/${this.result?.eventId}`
  }
})
