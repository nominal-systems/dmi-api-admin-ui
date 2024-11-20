import Alpine from 'alpinejs'
import { getEventsStats, getExternalRequestsStats, getIntegrations, getOrderStats } from './api-client'
import moment from 'moment'
import { createTimeSeries } from './common/chart-utils'
import { PROVIDERS_CONFIG } from './constants/providers-config'
import { navigateTo } from './common/utils'

export const dashboard = () => {
  return {
    stats: {
      integrations_running: '-',
      orders_created_today: '-',
      reports_updated_today: '-',
      provider_errors_today: '-'
    },
    charts: {
      provider_api_errors: {
        async series(startDate, endDate, granularity) {
          const externalRequests = await getExternalRequestsStats(startDate, endDate)
          return createTimeSeries(externalRequests, startDate, endDate, {
            series: PROVIDERS_CONFIG,
            grouping: 'provider',
            granularity
          })
        },
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
          }],
          xaxis: {
            type: 'datetime',
            labels: {
              datetimeFormatter: {
                year: 'yyyy',
                month: 'dd MMM',
                day: 'dd MMM',
                hour: 'htt'
              }
            }
          }
        }
      },
      events: {
        async series(startDate, endDate, granularity) {
          const orderCreatedEvents = await getOrderStats('countByProvider', { startDate, endDate })
          return createTimeSeries(orderCreatedEvents, startDate, endDate, {
            series: PROVIDERS_CONFIG,
            grouping: 'provider',
            granularity
          })
        },
        options: {
          chart: {
            stacked: true
          },
          colors: [function ({ value, seriesIndex, w }) {
            return PROVIDERS_CONFIG[seriesIndex].color
          }],
          dataLabels: {
            enabled: true
          },
          xaxis: {
            type: 'datetime',
            labels: {
              datetimeFormatter: {
                year: 'yyyy',
                month: 'dd MMM',
                day: 'dd MMM',
                hour: 'htt'
              }
            }
          }
        }
      }
    },

    async init() {
      Alpine.store('title').set('Dashboard')
      const runningIntegrations = await getIntegrations(null, null, ['RUNNING'], 1, 1)

      // Cards
      const startOfToday = moment().startOf('day').toISOString()
      const endOfToday = moment().endOf('day').toISOString()
      const todayEvents = await getEventsStats(undefined, startOfToday, endOfToday, ['type'])
      const todayExternalRequests = await getExternalRequestsStats(startOfToday, endOfToday)
      this.stats.integrations_running = runningIntegrations.total
      this.stats.orders_created_today = todayEvents.find((s) => s.type === 'order:created')?.count || 0
      this.stats.reports_updated_today = todayEvents.find((s) => s.type === 'report:updated')?.count || 0
      this.stats.provider_errors_today = todayExternalRequests.reduce((acc, s) => acc + s.count, 0)
    }
  }
}
