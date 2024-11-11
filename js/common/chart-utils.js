import { formatDateInLocalTimezone } from './date-utils'

export function createTimeSeries(data, startDate, endDate, options = {}) {
  data.forEach(item => {
    const dateUTC = new Date(Date.UTC(
      item.year,
      item.month - 1,
      item.day,
      item.hour
    ));
    const dateLocal = new Date(dateUTC.getTime())
    item.year = dateLocal.getFullYear()
    item.month = dateLocal.getMonth() + 1
    item.day = dateLocal.getDate()
    item.hour = dateLocal.getHours()
  })
  const defaultOptions = {
    granularity: 'day',
    series: [
      {
        label: 'Series 1',
      }
    ],
  }
  const opts = Object.assign({}, defaultOptions, options)

  // Build Time Series
  const series = opts.series.map((s) => {
    return { name: s.label, id: s.id, data: [] }
  })
  const start = new Date(startDate)
  const end = new Date(endDate)
  const timeSeries = []
  while (start <= end) {
    let x
    if (opts.granularity === 'month') {
      x = formatDateInLocalTimezone(start).slice(0, 7) // YYYY-MM
      start.setMonth(start.getMonth() + 1)
    } else if (opts.granularity === 'day') {
      x = formatDateInLocalTimezone(start).slice(0, 10) // YYYY-MM-DD
      start.setDate(start.getDate() + 1)
    } else if (opts.granularity === 'hour') {
      x = formatDateInLocalTimezone(start)
      start.setHours(start.getHours() + 1)
    } else {
      throw new Error('Invalid granularity. Use \'month\', \'day\', or \'hour\'.')
    }
    timeSeries.push({ x, y: 0 })
  }

  // Grouping
  series.forEach((s) => {
    const seriesData = data.filter((d) => {
      return opts.grouping !== undefined ? d[opts.grouping] === s.id : true
    })
    s.data = [...timeSeries].map((ts) => {
      const intervalParts = ts.x.replace('T', '-').split('-').map((part) => parseInt(part))
      return {
        x: new Date(ts.x),
        y: seriesData.reduce((sum, item) => {
          if (
            (opts.granularity === 'year' && item.year === intervalParts[0]) ||
            (opts.granularity === 'month' && item.year === intervalParts[0] && item.month === intervalParts[1]) ||
            (opts.granularity === 'day' && item.year === intervalParts[0] && item.month === intervalParts[1] && item.day === intervalParts[2]) ||
            (opts.granularity === 'hour' && item.year === intervalParts[0] && item.month === intervalParts[1] && item.day === intervalParts[2] && item.hour === intervalParts[3])
          ) {
            sum += item.count
          }
          return sum
        }, 0)
      }
    })
  })

  return series
}
