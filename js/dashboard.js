import { getEventsStats, getExternalRequestsStats, getIntegrations } from './api-client'
import moment from 'moment'
import { QUERY_DATE_FORMAT } from './constants/query-date-format'
import { createTimeSeries } from './common/chart-utils'
import { PROVIDERS_CONFIG } from './constants/providers-config'

export const dashboard = () => {
  return {
    stats: {
      integrations_running: 0,
      orders_created_today: 0,
      reports_updated_today: 0,
      provider_errors_today: 0
    },
    charts: {
      provider_api_errors: {
        series: null,
        options: {
          chart: { stacked: true },
          colors: [function ({ value, seriesIndex, w }) {
            return PROVIDERS_CONFIG[seriesIndex].color
          }]
        }
      },
      events: {
        series: null,
        options: {
          colors: ['#0E9F6E'],
          dataLabels: {
            enabled: true
          }
        }
      }
    },

    async init() {
      const runningIntegrations = (await getIntegrations()).filter((i) => i.status === 'RUNNING')

      // Dates
      const today = moment().utc().startOf('day').format(QUERY_DATE_FORMAT)
      const sevenDaysAgo = moment().utc().subtract(6, 'days').startOf('day').format(QUERY_DATE_FORMAT)

      // Today
      // TODO(gb): make only one request and filter for today?
      const todayEvents = await getEventsStats(undefined, today, today, ['type'])
      const todayExternalRequests = await getExternalRequestsStats(today, today)

      // Last 7 days
      const last7DaysOrderCreatedEvents = await getEventsStats(['order:created'], sevenDaysAgo, today, ['createdAt'])
      const last7DaysExternalRequestsStats = await getExternalRequestsStats(sevenDaysAgo, today)

      // Cards
      this.stats.integrations_running = runningIntegrations.length
      this.stats.orders_created_today = todayEvents.find((s) => s.type === 'order:created')?.count || 0
      this.stats.reports_updated_today = todayEvents.find((s) => s.type === 'report:updated')?.count || 0
      this.stats.provider_errors_today = todayExternalRequests.reduce((acc, s) => acc + s.count, 0)

      // Charts
      this.charts.provider_api_errors.series = createTimeSeries(last7DaysExternalRequestsStats, sevenDaysAgo, today, {
        series: PROVIDERS_CONFIG.map((p) => p.id),
        grouping: 'provider'
      })
      this.charts.events.series = createTimeSeries(last7DaysOrderCreatedEvents, sevenDaysAgo, today, {
        series: ['Orders created']
      })
    }
  }
}
