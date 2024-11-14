import moment from 'moment/moment'

export function dateRangePresets(preset) {
  switch (preset) {
    case 'today':
      return {
        startDate: moment().startOf('day').toISOString(),
        endDate: moment().endOf('hour').toISOString(),
        granularity: 'hour',
        formatter: 'htt'
      }
    case 'last24hours':
      return {
        startDate: moment().subtract(23, 'hours').startOf('hour').toISOString(),
        endDate: moment().endOf('hour').toISOString(),
        granularity: 'hour',
        formatter: 'htt'
      }
    case 'last48hours':
      return {
        startDate: moment().subtract(47, 'hours').startOf('hour').toISOString(),
        endDate: moment().endOf('hour').toISOString(),
        granularity: 'hour',
        formatter: 'htt'
      }
    case 'last7days':
      return {
        startDate: moment().subtract(6, 'days').startOf('day').toISOString(),
        endDate: moment().endOf('day').toISOString(),
        granularity: 'day',
        formatter: 'dd MMM'
      }
    case 'last30days':
      return {
        startDate: moment().subtract(29, 'days').startOf('day').toISOString(),
        endDate: moment().endOf('day').toISOString(),
        granularity: 'day',
        formatter: 'dd MMM'
      }
  }
}

export function formatDateInLocalTimezone(date) {
  return moment(date).local().format('YYYY-MM-DDTHH:mm:ss.SSS[Z]')
}

export function parseDateRange(dateRange) {
  const dates = []
  const [startDate, endDate] = dateRange.split('-')
  dates.push(moment(startDate).toISOString())
  if (endDate !== undefined) {
    dates.push(moment(endDate).toISOString())
  } else {
    dates.push(moment(startDate).endOf('day').toISOString())
  }

  return dates
}
