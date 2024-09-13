import ApexCharts from 'apexcharts'
import { deepMerge } from '../common/utils'

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
      // const chartOptions = Object.assign({ series }, defaultOptions, options)
      const chartOptions = deepMerge(defaultOptions, options)
      handleRoot(el, Alpine, series, chartOptions)
    }
  })

  function handleRoot(el, Alpine, series, options) {
    Alpine.bind(el, {
      'x-data'() {
        return {
          chart: null,
          total: series.reduce((acc, item) => acc + item.data.reduce((acc, item) => acc + item.y, 0), 0),
          init() {
            this.chart = new ApexCharts(el, { series, ...options });
            this.chart.render()
          }
        }
      }
    })
  }
}
