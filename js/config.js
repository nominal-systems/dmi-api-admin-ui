const API_BASE = `${process.env.API_URL || ''}/admin`
const UI_BASE = `${process.env.UI_URL || ''}`

const keys = {
  API_BASE,
  UI_BASE,
  TITLE_PREFIX: 'DMI Admin'
}

function log() {
  console.log(`Environment: ${process.env.NODE_ENV}`)
  console.log(`API Base: ${get('API_BASE')}`)
  console.log(`UI Base: ${get('UI_BASE')}`)
}

function get(key) {
  return keys[key]
}

const config = {
  log,
  get
}

export {
  config as default
}
