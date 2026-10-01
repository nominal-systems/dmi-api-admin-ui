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
    dates.push(moment(endDate).endOf('day').toISOString())
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
  const lastWeek = `${moment().subtract(6, 'days').startOf('day').format(DATE_FORMAT)}-${today}`
  const lastMonth = `${moment().subtract(29, 'days').startOf('day').format(DATE_FORMAT)}-${today}`
  return [
    { label: 'Today', value: today },
    { label: 'Yesterday', value: yesterday },
    { label: 'Last 7 days', value: lastWeek },
    { label: 'Last 30 days', value: lastMonth }
  ]
}

export function dateFilterConfig() {
  return {
    id: 'date',
    type: 'date',
    label: 'Date',
    updateQuery: true,
    toggleEnabled: false,
    defaultValue: defaultDateFilterValue,
    items: dateFilterPresets
  }
}

export function parseDateRangeQuery(dateParam) {
  return parseDateRange(dateParam || defaultDateFilterValue())
}

// Converts a `YYYYMMDD[-YYYYMMDD]` filter value into its [start, end] dates, or null when the value
// is not in that format, so the picker starts empty instead of showing a mis-parsed date
export function dateFilterValueToDates(value) {
  const [startDate, endDate = startDate] = value.split('-')
  const dates = [moment(startDate, DATE_FORMAT, true), moment(endDate, DATE_FORMAT, true)]
  return dates.every((date) => date.isValid()) ? dates.map((date) => date.toDate()) : null
}

export function datesToDateFilterValue(startDate, endDate) {
  const start = moment(startDate).format(DATE_FORMAT)
  const end = moment(endDate).format(DATE_FORMAT)
  return start === end ? start : `${start}-${end}`
}

export const MAX_DATE_RANGE_DAYS = 31

export function exceedsDateRangeLimit(startDate, endDate) {
  const days = moment(endDate).startOf('day').diff(moment(startDate).startOf('day'), 'days')
  return Math.abs(days) >= MAX_DATE_RANGE_DAYS
}

export function validateDateRangeLimit(dateRange) {
  const [startDate, endDate] = dateRange
  if (exceedsDateRangeLimit(startDate, endDate)) {
    throw new Error(`The date range cannot exceed ${MAX_DATE_RANGE_DAYS} days`)
  }
}
