import { Accordion } from 'flowbite'

export default function (Alpine) {
  Alpine.directive('accordion', (el, { value }) => {
    if (!value) {
      handleRoot(el, Alpine)
    }
  })
}

function handleRoot(el, Alpine) {
  Alpine.bind(el, {
    'x-data'() {
      return {
        accordion: null,
        init() {
          const accordionElement = el
          const accordionItems = [
            {
              triggerEl: accordionElement.querySelector('[x-accordion\\:heading]'),
              targetEl: accordionElement.querySelector('[x-accordion\\:body]'),
              active: false
            }
          ]
          const options = {
            alwaysOpen: true,
            activeClasses: 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white',
            inactiveClasses: 'text-gray-500 dark:text-gray-400',
          }
          this.accordion = new Accordion(el, accordionItems, options)
        }
      }
    }
  })
}
