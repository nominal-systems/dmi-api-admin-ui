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
    charts: {
      provider_api_errors: {
        series: null,
        options: {
          chart: { stacked: true }
        }
      },
      events: {
        series: null,
        options: {
          colors: ['#0E9F6E']
        }
      }
    },

    async init() {
      const runningIntegrations = (await getIntegrations()).filter((i) => i.status === 'RUNNING')

      // Today
      const startOfToday = moment().utc().startOf('day').local().toISOString()
      const endOfToday = moment().utc().endOf('day').toISOString()
      const eventStats = await getEventsStats(startOfToday, endOfToday)
      const todayExternalRequestsStats = await getExternalRequestsStats(startOfToday, endOfToday)

      // Last 7 days
      const startOfLast7Days = moment().utc().subtract(7, 'days').startOf('day').utc().toISOString()
      const last7DaysExternalRequestsStats = await getExternalRequestsStats(startOfLast7Days, endOfToday)
      const last7DaysEventsStats = await getEventsStats(startOfLast7Days, endOfToday)

      this.stats.integrations_running = runningIntegrations.length
      this.stats.orders_created_today = eventStats.find((s) => s.type === 'order:created')?.count || 0
      this.stats.reports_updated_today = eventStats.find((s) => s.type === 'report:updated')?.count || 0
      this.stats.provider_errors_today = todayExternalRequestsStats.reduce((acc, s) => acc + s.count, 0)
      this.charts.provider_api_errors.series = createExternalRequestsSeries(last7DaysExternalRequestsStats, 'provider', startOfLast7Days, endOfToday)
      this.charts.events.series = createExternalRequestsSeries(last7DaysEventsStats, 'type', startOfLast7Days, endOfToday)
    }
  }
}

function createExternalRequestsSeries(data, grouping, startDate, endDate, granularity = 'day') {
  const series = []
  const groups = [...new Set(data.map((d) => d[grouping]))]

  // Build Time Series
  const start = new Date(startDate)
  const end = new Date(endDate)
  const timeSeries = [];
  while (start <= end) {
    let x;
    if (granularity === 'month') {
      x = start.toISOString().slice(0, 7); // YYYY-MM
      start.setMonth(start.getMonth() + 1);
    } else if (granularity === 'day') {
      x = start.toISOString().slice(0, 10); // YYYY-MM-DD
      start.setDate(start.getDate() + 1);
    } else if (granularity === 'hours') {
      x = start.toISOString().slice(0, 13); // YYYY-MM-DDTHH
      start.setHours(start.getHours() + 1);
    } else {
      throw new Error('Invalid granularity. Use \'month\', \'day\', or \'hours\'.');
    }
    timeSeries.push({ x, y: 0 });
  }

  groups.forEach((provider) => {
    const providerData = data.filter((d) => d[grouping] === provider)
    series.push({
      name: provider,
      data: [...timeSeries].map((ts) => {
        const intervalParts = ts.x.split('-').map((part) => parseInt(part))
        return {
          x: ts.x,
          y: providerData.reduce((sum, item) => {
            if (
              (granularity === 'year' && item.year === intervalParts[0]) ||
              (granularity === 'month' && item.year === intervalParts[0] && item.month === intervalParts[1]) ||
              (granularity === 'day' && item.year === intervalParts[0] && item.month === intervalParts[1] && item.day === intervalParts[2]) ||
              (granularity === 'hour' && item.year === intervalParts[0] && item.month === intervalParts[1] && item.day === intervalParts[2] && item.hour === intervalParts[3])
            ) {
              sum += item.count;
            }
            return sum;
          }, 0)
        }
      })
    })
  })

  return series
}
