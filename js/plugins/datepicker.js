import { DateRangePicker } from 'flowbite-datepicker'
import moment from 'moment'
import { DATE_FORMAT } from '../constants/date-format'

export default function (Alpine) {
  Alpine.directive('datepicker', (el, { value }) => {
    if (!value) {
      handleRoot(el)
    }
  })
}

function handleRoot(el) {
  const inputs = Array.from(el.querySelectorAll('input'))
  if (inputs.length < 2) {
    return
  }

  const datepicker = new DateRangePicker(el, {
    inputs,
    defaultDatepickerId: null,
    autohide: true,
    format: 'mm/dd/yyyy',
    maxDate: null,
    minDate: null,
    orientation: 'bottom',
    allowOneSidedRange: true,
    buttons: false,
    autoSelectToday: false,
    title: null
  })

  inputs.forEach((input) => {
    input.addEventListener('hide', () => {
      const [startDate, endDate] = datepicker.getDates()
      if (startDate === undefined || endDate === undefined) {
        return
      }

      const start = moment(startDate).format(DATE_FORMAT)
      const end = moment(endDate).format(DATE_FORMAT)
      el.dispatchEvent(new CustomEvent('datePickerInput', {
        detail: { date: start === end ? start : `${start}-${end}` },
        bubbles: true
      }))
    })
  })
}
