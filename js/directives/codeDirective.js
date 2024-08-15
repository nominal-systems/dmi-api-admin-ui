import Alpine from 'alpinejs'

export default () => {
  Alpine.directive('code', (el, { expression }, { evaluateLater, effect }) => {
    let formatCode = evaluateLater(expression)

    effect(() => {
      formatCode(code => {
        let text = null
        if (code === null || code === undefined) {
          text = ''
        } else if (typeof code === 'object') {
          // Directly format the object
          text = JSON.stringify(code, null, 2)
        } else if (code.startsWith('{') && code.endsWith('}') || code.startsWith('[') && code.endsWith(']')) {
          // Format as JSON
          text = JSON.stringify(JSON.parse(code), null, 2)
        } else if (code.startsWith('"') && code.endsWith('"')) {
          // Format as stringified JSON
          text = JSON.stringify(JSON.parse(code), null, 2)
        } else if (code.startsWith('<') && code.endsWith('>')) {
          // Format as XML (basic formatting, might need a more robust solution)
          let formatted = ''
          const parser = new DOMParser()
          const xmlDoc = parser.parseFromString(code, 'application/xml')
          const serializer = new XMLSerializer()
          formatted = serializer.serializeToString(xmlDoc)
          return formatted
        } else {
          // Return the original code if the type is unrecognized
          text = code
        }

        el.textContent = `\n${text}`
      })
    })
  })
}



