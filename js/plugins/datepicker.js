import { Datepicker } from 'flowbite-datepicker'
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
  const input = el.querySelector('input')
  if (!input) {
    return
  }

  const initialValue = input.value
  const datepicker = new Datepicker(input, {
    defaultDatepickerId: null,
    autohide: false,
    format: 'mm/dd/yyyy',
    maxDate: null,
    minDate: null,
    orientation: 'bottom',
    buttons: false,
    autoSelectToday: false,
    title: null
  })
  if (initialValue && input.value !== initialValue) {
    input.value = initialValue
  }

  const format = (date) => moment(date).format('MM/DD/YYYY')
  let pendingStart = null
  let suppressHide = false

  const commit = (startDate, endDate) => {
    const start = moment(startDate).format(DATE_FORMAT)
    const end = moment(endDate).format(DATE_FORMAT)

    input.value = start === end ? format(startDate) : `${format(startDate)} - ${format(endDate)}`
    pendingStart = null
    suppressHide = true
    setTimeout(() => {
      suppressHide = false
    }, 0)
    datepicker.hide()

    el.dispatchEvent(new CustomEvent('datePickerInput', {
      detail: { date: start === end ? start : `${start}-${end}` },
      bubbles: true
    }))
    input.blur()
  }

  input.addEventListener('changeDate', (ev) => {
    if (!datepicker.picker.active) {
      return
    }

    const date = ev.detail.date
    if (!date) {
      return
    }

    if (!pendingStart) {
      pendingStart = date
      return
    }

    commit(date < pendingStart ? date : pendingStart, date < pendingStart ? pendingStart : date)
  })

  input.addEventListener('hide', () => {
    if (suppressHide) {
      suppressHide = false
      return
    }

    if (pendingStart) {
      commit(pendingStart, pendingStart)
    }
    input.blur()
  })

  // The picker can't parse the range value, so dismiss it before its own blur
  // handling rewrites the field, and keep the pending selection in sync.
  document.addEventListener('mousedown', (ev) => {
    if (input.contains(ev.target) || datepicker.picker.element.contains(ev.target)) {
      return
    }

    if (datepicker.picker.active) {
      datepicker.hide()
    } else if (pendingStart) {
      commit(pendingStart, pendingStart)
    }
    input.blur()
  }, true)

  // Keep the picker's Tab handling from reparsing the range value on the way out
  el.addEventListener('keydown', (ev) => {
    if (ev.key !== 'Tab') {
      return
    }

    ev.stopPropagation()
    datepicker.hide()
  }, true)
}