import { getEventsStats, getExternalRequestsStats, getIntegrations } from './api-client'
import moment from 'moment'

export const dashboard = () => {
  return {
    stats: {
      integrations_running: 0,
      orders_created_today: 0,
      reports_updated_today: 0,
      provider_errors_today: 0
    },
    async init() {
      const startOfToday = moment().startOf('month').toISOString()
      const endOfToday = moment().endOf('day').toISOString()
      const runningIntegrations = (await getIntegrations()).filter((i) => i.status === 'RUNNING')
      const eventStats = await getEventsStats(startOfToday, endOfToday)
      const externalRequestsStats = await getExternalRequestsStats(startOfToday, endOfToday)

      this.stats.integrations_running = runningIntegrations.length
      this.stats.orders_created_today = eventStats.find((s) => s.type === 'order:created')?.count || 0
      this.stats.reports_updated_today = eventStats.find((s) => s.type === 'report:updated')?.count || 0
      this.stats.provider_errors_today = externalRequestsStats.reduce((acc, s) => acc + s.count, 0)
    }
  }
}
