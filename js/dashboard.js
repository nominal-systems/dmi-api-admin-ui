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
                hour: 'hhtt'
              }
            }
          }
        }
      },
      events: {
        async series(startDate, endDate, granularity) {
          const orderCreatedEvents = await getEventsStats(['order:created'], startDate, endDate, ['createdAt'])
          return createTimeSeries(orderCreatedEvents, startDate, endDate, {
            granularity,
            series: [
              {
                label: 'Orders Created'
              }
            ]
          })
        },
        options: {
          colors: ['#69656a'],
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
                hour: 'hhtt'
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
      const today = moment().utc().startOf('day').format(QUERY_DATE_FORMAT)
      const todayEvents = await getEventsStats(undefined, today, today, ['type'])
      const todayExternalRequests = await getExternalRequestsStats(today, today)
      this.stats.integrations_running = runningIntegrations.total
      this.stats.orders_created_today = todayEvents.find((s) => s.type === 'order:created')?.count || 0
      this.stats.reports_updated_today = todayEvents.find((s) => s.type === 'report:updated')?.count || 0
      this.stats.provider_errors_today = todayExternalRequests.reduce((acc, s) => acc + s.count, 0)
    }
  }
}
