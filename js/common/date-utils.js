import moment from 'moment/moment'
import { DATE_FORMAT } from '../constants/date-format'

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

export function defaultDateFilterValue() {
  return moment().startOf('day').format(DATE_FORMAT)
}

export function dateFilterPresets() {
  const today = defaultDateFilterValue()
  const yesterday = `${moment().subtract(1, 'days').startOf('day').format(DATE_FORMAT)}`
  const lastWeek = `${moment().subtract(7, 'days').startOf('day').format(DATE_FORMAT)}-${today}`
  const lastMonth = `${moment().subtract(30, 'days').startOf('day').format(DATE_FORMAT)}-${today}`
  return [
    { label: 'Today', value: today },
    { label: 'Yesterday', value: yesterday },
    { label: 'Last 7 days', value: lastWeek },
    { label: 'Last 30 days', value: lastMonth }
  ]
}
