import flatpickr from 'flatpickr'
import { dateFilterValueToDates, datesToDateFilterValue, exceedsDateRangeLimit } from '../common/date-utils'

export default function (Alpine) {
  Alpine.directive('datepicker', (el, { value, expression }, { evaluate, cleanup }) => {
    if (!value) {
      const picker = handleRoot(el, expression ? evaluate(expression) : null)
      cleanup(() => picker.destroy())
    }
  })
}

function handleRoot(el, initialValue) {
  let picker = null
  picker = flatpickr(el, {
    mode: 'range',
    dateFormat: 'm/d/Y',
    maxDate: 'today',
    monthSelectorType: 'static',
    locale: { rangeSeparator: ' - ' },
    defaultDate: initialValue ? dateFilterValueToDates(initialValue) : null,
    // Once the start date is picked, only allow ends within the API limit
    disable: [
      (date) => picker !== null && picker.selectedDates.length === 1 && exceedsDateRangeLimit(picker.selectedDates[0], date)
    ],
    // Refresh the max date in case the page stayed open past midnight
    onOpen(selectedDates, dateStr, instance) {
      instance.set('maxDate', 'today')
    },
    onClose(selectedDates, dateStr, instance) {
      if (selectedDates.length === 0) {
        return
      }

      // Closing after picking only the start date selects that single day
      const [startDate, endDate = startDate] = selectedDates
      if (selectedDates.length === 1) {
        instance.setDate([startDate, endDate], false)
      }

      el.dispatchEvent(new CustomEvent('datePickerInput', {
        detail: { date: datesToDateFilterValue(startDate, endDate) },
        bubbles: true
      }))
    }
  })

  return picker
}
