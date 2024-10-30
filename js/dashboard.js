import Alpine from 'alpinejs'
import { getEventsStats, getExternalRequestsStats, getIntegrations } from './api-client'
import moment from 'moment'
import { QUERY_DATE_FORMAT } from './constants/query-date-format'
import { createTimeSeries } from './common/chart-utils'
import { PROVIDERS_CONFIG } from './constants/providers-config'
import { navigateTo } from './common/utils'

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
          chart: {
            stacked: true,
            events: {
              dataPointSelection: function (event, chartContext, opts) {
                const provider = opts.w.config.series[opts.seriesIndex].id
                const date = moment(opts.w.config.series[opts.seriesIndex].data[opts.dataPointIndex].x)
                navigateTo(`/external-requests?provider=${provider}&date=${date.format('MM/DD/YYYY')}&status=4xx,5xx`)
              },
              dataPointMouseEnter: function (event) {
                event.target.style.cursor = 'pointer'
              }
            }
          },
          colors: [function ({ value, seriesIndex, w }) {
            return PROVIDERS_CONFIG[seriesIndex].color
          }]
        }
      },
      events: {
        series: null,
        options: {
          colors: ['#69656a'],
          dataLabels: {
            enabled: true
          }
        }
      }
    },

    async init() {
      Alpine.store('title').set('Dashboard')
      const runningIntegrations = await getIntegrations(null, null, ['RUNNING'], 1, 1)

      // Dates
      const today = moment().utc().startOf('day').format(QUERY_DATE_FORMAT)
      const sevenDaysAgo = moment().utc().subtract(6, 'days').startOf('day').format(QUERY_DATE_FORMAT)

      // Today
      // TODO(gb): make only one request and filter for today?
      const todayEvents = await getEventsStats(undefined, today, today, ['type'])
      const todayExternalRequests = await getExternalRequestsStats(today, today)

      // Last 7 days
      const last7DaysOrderCreatedEvents = await getEventsStats(['order:created'], sevenDaysAgo, today, ['createdAt'])
      const last7DaysExternalRequests = await getExternalRequestsStats(sevenDaysAgo, today)

      // Cards
      this.stats.integrations_running = runningIntegrations.total
      this.stats.orders_created_today = todayEvents.find((s) => s.type === 'order:created')?.count || 0
      this.stats.reports_updated_today = todayEvents.find((s) => s.type === 'report:updated')?.count || 0
      this.stats.provider_errors_today = todayExternalRequests.reduce((acc, s) => acc + s.count, 0)

      // Charts
      this.charts.provider_api_errors.series = createTimeSeries(last7DaysExternalRequests, sevenDaysAgo, today, {
        series: PROVIDERS_CONFIG,
        grouping: 'provider'
      })
      this.charts.events.series = createTimeSeries(last7DaysOrderCreatedEvents, sevenDaysAgo, today, {
        series: [
          {
            label: 'Orders Created'
          }
        ]
      })
    }
  }
}
