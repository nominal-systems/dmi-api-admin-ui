import Alpine from 'alpinejs'

export default () => {
  Alpine.directive('date', (el, { expression }, { evaluateLater, effect }) => {
    const dateString = evaluateLater(expression)

    effect(() => {
      dateString((str) => {
        el.textContent = new Date(str).toLocaleString()
      })
    })
  })
}



