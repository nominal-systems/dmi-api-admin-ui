import { Datepicker } from 'flowbite-datepicker'
import moment from 'moment'
import { DATE_FORMAT } from '../constants/date-format'

export default function (Alpine) {
  const defaultOptions = {}

  Alpine.directive('datepicker', (el, { value, modifiers, expression }, {
    effect,
    evaluate,
    evaluateLater,
    cleanup
  }) => {
    if (!value) {
      const options = Object.assign({}, defaultOptions, evaluate(expression))
      handleRoot(el, Alpine, options)
    }
  })
}

function handleRoot(el, Alpine, options) {
  Alpine.bind(el, {
    'x-data'() {
      return {
        _id: options.id,
        label: options.label,
        dirty: false,
        datepicker: null,
        init() {
          this.datepicker = new Datepicker(el, {
            defaultDatepickerId: null,
            autohide: true,
            format: 'mm/dd/yyyy',
            maxDate: null,
            minDate: null,
            orientation: 'bottom',
            buttons: false,
            autoSelectToday: false,
            title: null,
            rangePicker: false
          })
        }
      }
    },
    '@hide'() {
      const date = this.datepicker.getDate()
      if (date !== undefined) {
        this.$dispatch('datePickerInput', { date: moment(date).format(DATE_FORMAT) })
      }
    }
  })
}
