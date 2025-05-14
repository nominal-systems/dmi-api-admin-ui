const API_HOST = `${process.env.API_URL || ''}`
const API_BASE = `${process.env.API_URL || ''}/admin`
const UI_BASE = `${process.env.UI_URL || ''}`

const keys = {
  API_HOST,
  API_BASE,
  UI_BASE,
  TITLE_PREFIX: 'DMI Admin'
}

function log() {
  console.log(`Environment: ${process.env.NODE_ENV}`)
  console.log(`API Host: ${get('API_HOST')}`)
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
