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
            onOpen: (_, item) => expand(item.targetEl),
            onClose: (_, item) => collapse(item.targetEl)
          }
          this.accordion = new Accordion(el, accordionItems, options)
        }
      }
    }
  })
}

function expand(el) {
  el.classList.remove('hidden')
  const height = el.scrollHeight
  el.style.height = '0px'
  el.style.overflow = 'hidden'
  requestAnimationFrame(() => {
    el.style.transition = 'height 0.3s ease'
    el.style.height = `${height}px`
  })
  el.addEventListener('transitionend', function handler() {
    el.style.height = 'auto'
    el.style.overflow = ''
    el.style.transition = ''
    el.removeEventListener('transitionend', handler)
  })
}

function collapse(el) {
  el.classList.remove('hidden')
  const height = el.scrollHeight
  el.style.height = `${height}px`
  el.style.overflow = 'hidden'
  requestAnimationFrame(() => {
    el.style.transition = 'height 0.3s ease'
    el.style.height = '0px'
  })
  el.addEventListener('transitionend', function handler() {
    el.classList.add('hidden')
    el.style.height = 'auto'
    el.style.overflow = ''
    el.style.transition = ''
    el.removeEventListener('transitionend', handler)
  })
}
