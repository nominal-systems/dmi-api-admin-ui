import ApexCharts from 'apexcharts'

export default function (Alpine) {
  const defaultConfig = {}

  Alpine.directive('chart', (el, { value, modifiers, expression }, { effect, evaluate, evaluateLater, cleanup }) => {
    if (!value) {
      handleRoot(el, Alpine, evaluate(expression))
    }
  })

  function handleRoot(el, Alpine, series) {
    const options = {
      series,
      colors: [
        '#ea5545',
        '#ef9b20',
        '#87bc45',
        '#27aeef',
        '#b33dc6'
      ],
      chart: {
        type: 'bar',
        height: '300px',
        fontFamily: 'Inter, sans-serif',
        toolbar: {
          show: false,
        },
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '100%',
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

    Alpine.bind(el, {
      'x-data'() {
        return {
          chart: null,
          total: series.reduce((acc, item) => acc + item.data.reduce((acc, item) => acc + item.y, 0), 0),
          init() {
            this.chart = new ApexCharts(el, options);
            this.chart.render()
          }
        }
      }
    })
  }
}
