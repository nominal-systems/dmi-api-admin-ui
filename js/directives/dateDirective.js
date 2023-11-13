import Alpine from 'alpinejs'

export default () => {
  Alpine.directive('date', (el, { expression }, { evaluate }) => {
    el.textContent = new Date(evaluate(expression)).toLocaleString()
  })
}



