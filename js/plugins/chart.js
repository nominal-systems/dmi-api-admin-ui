import ApexCharts from 'apexcharts'
import { deepMerge } from '../common/utils'
import moment from 'moment/moment'
import { QUERY_DATE_FORMAT } from '../constants/query-date-format'

export default function (Alpine) {
  const defaultOptions = {
    chart: {
      type: 'bar',
      height: '100%',
      fontFamily: 'Inter, sans-serif',
      toolbar: {
        show: false,
      },
    },
    noData: {
      text: 'No data in the current filter'
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '70%',
        borderRadiusApplication: 'end',
        borderRadius: 4,
      },
    },
    tooltip: {
      shared: true,
      intersect: false,
      style: {
        fontFamily: 'Inter, sans-serif',
      },
    },
    states: {
      hover: {
        filter: {
          type: 'darken',
          value: 1,
        },
      },
    },
    stroke: {
      show: true,
      width: 0,
      colors: ['transparent'],
    },
    grid: {
      show: false,
      strokeDashArray: 4,
      padding: {
        left: 2,
        right: 2,
        top: -14
      },
    },
    dataLabels: {
      enabled: false,
    },
    legend: {
      show: true,
      position: 'bottom',
      markers: {
        strokeWidth: 0
      }
    },
    xaxis: {
      floating: false,
      labels: {
        show: true,
        style: {
          fontFamily: 'Inter, sans-serif',
          cssClass: 'text-xs font-normal fill-gray-500 dark:fill-gray-400'
        }
      },
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      show: true,
    },
    fill: {
      opacity: 1,
    },
  }

  Alpine.directive('chart', (el, { value, modifiers, expression }, { effect, evaluate, evaluateLater, cleanup }) => {
    if (!value) {
      const { series, options } = evaluate(expression)
      const chartOptions = deepMerge(options, defaultOptions)
      handleRoot(el, Alpine, series, chartOptions)
    }
  })

  function handleRoot(el, Alpine, getSeries, options) {
    const $canvas = el.querySelector('[x-chart\\:canvas]')
    Alpine.bind(el, {
      'x-data'() {
        return {
          chart: null,
          series: null,
          total: 0,
          loading: true,
          dateSelector: {
            current: null,
            options: [
              { value: 'today', label: 'Today' },
              { value: 'last7days', label: 'Last 7 Days' },
              { value: 'last30days', label: 'Last 30 Days' },
              { value: 'last60days', label: 'Last 60 Days' },
            ],
          },
          async fetch() {
            this.loading = true
            this.total = '-'
            const { startDate, endDate, granularity } = dateRangePresets(this.dateSelector.current.value)
            this.series = await getSeries(startDate, endDate, granularity)
            this.total = this.series.reduce((acc, item) => acc + item.data.reduce((acc, item) => acc + item.y, 0), 0)
            this.loading = false
          },
          async refresh() {
            await this.fetch()
            this.chart.updateSeries(this.series, false)
          },
          async init() {
            this.dateSelector.current = this.dateSelector.options[1]
            this.dateSelector.options.forEach(option => {
              option.onClick = (dropdown) => {
                this.dateSelector.current = option
                this.refresh()
                dropdown.close()
              }
            })
            await this.fetch()
            this.chart = new ApexCharts($canvas, { series: this.series, ...options });
            this.chart.render()
          }
        }
      }
    })
  }
}

function dateRangePresets(preset) {
  switch (preset) {
    case 'today':
      return {
        startDate: moment().utc().startOf('day').format(QUERY_DATE_FORMAT),
        endDate: moment().utc().endOf('day').format(QUERY_DATE_FORMAT),
        granularity: 'hour'
      }
    case 'last7days':
      return {
        startDate: moment().utc().subtract(6, 'days').startOf('day').format(QUERY_DATE_FORMAT),
        endDate: moment().utc().endOf('day').format(QUERY_DATE_FORMAT),
        granularity: 'day'
      }
    case 'last30days':
      return {
        startDate: moment().utc().subtract(29, 'days').startOf('day').format(QUERY_DATE_FORMAT),
        endDate: moment().utc().endOf('day').format(QUERY_DATE_FORMAT),
        granularity: 'day'
      }
    case 'last60days':
      return {
        startDate: moment().utc().subtract(59, 'days').startOf('day').format(QUERY_DATE_FORMAT),
        endDate: moment().utc().endOf('day').format(QUERY_DATE_FORMAT),
        granularity: 'day'
      }
  }
}
