import 'regenerator-runtime/runtime'
import Alpine from 'alpinejs'
import {Modal} from 'flowbite'

const DMI_API_URL = 'http://localhost:3000'

function getThemeFromLocalStorage() {
  // if user already changed the theme, use it
  if (window.localStorage.getItem('dark')) {
    return JSON.parse(window.localStorage.getItem('dark'))
  }

  // else return their preferences
  return (
    !!window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  )
}

function setThemeToLocalStorage(value) {
  window.localStorage.setItem('dark', value)
}

function getTokenFromLocalStorage() {
  if (window.localStorage.getItem('token')) {
    return window.localStorage.getItem('token')
  }
}

function setTokenToLocalStorage(token) {
  window.localStorage.setItem('token', token)
}

function unsetTokenFromLocalStorage() {
  window.localStorage.removeItem('token')
}

function apiPost(url, body, next) {
  const req = {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getTokenFromLocalStorage()}`
    }
  }

  if (body !== null) {
    req.headers['Content-Type'] = 'application/json'
    req.body = body
  }

  return fetch(url, req).then(response => response.json())
    .then(next)
}

function apiGet(url, next) {
  return fetch(url, {
    headers: new Headers({
      Authorization: `Bearer ${getTokenFromLocalStorage()}`
    })
  }).then(res => res.json())
    .then(res => {
      if (res.statusCode === 401 || res.statusCode === 403) {
        unsetTokenFromLocalStorage()
        window.location.href = '/login'
      }
      next(res)
    })
}

window.data = {
  dark: getThemeFromLocalStorage(),
  toggleTheme() {
    this.dark = !this.dark
    setThemeToLocalStorage(this.dark)
  },
  isSideMenuOpen: false,
  toggleSideMenu() {
    this.isSideMenuOpen = !this.isSideMenuOpen
  },
  closeSideMenu() {
    this.isSideMenuOpen = false
  },
  isProfileMenuOpen: false,
  toggleProfileMenu() {
    this.isProfileMenuOpen = !this.isProfileMenuOpen
  },
  closeProfileMenu(event) {
    this.isProfileMenuOpen = false
  },
  isPagesMenuOpen: false,
  isModalOpen: false,
  trapCleanup: null,
  openModal(sel) {
    this.isModalOpen = true
    this.trapCleanup = focusTrap(document.querySelector(sel))
  },
  closeModal() {
    this.isModalOpen = false
    this.trapCleanup()
  },

  // Auth
  user: {
    username: null,
    password: null
  },
  login() {
    apiPost(`${DMI_API_URL}/admin/login`, JSON.stringify(this.user), (res) => {
      if (res.token !== undefined) {
        setTokenToLocalStorage(res.token)
        window.location.href = '/'
      }
    })
  },

  // Menu
  menu: [
    {
      slug: 'dashboard',
      url: '/ui',
      name: 'Dashboard',
      icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'
    },
    {
      slug: 'integrations',
      url: '/ui/integrations',
      name: 'Integrations',
      icon: 'M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5'
    },
    {
      slug: 'events',
      url: '/ui/events',
      name: 'Events',
      icon: 'M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z'
    }
  ],

  // Integrations
  integrations: [],
  operation: null,
  integrationId: null,
  isIntegrationStatusUpdating: false,
  async fetchIntegrations() {
    apiGet(`${DMI_API_URL}/admin/integrations`, (body) => {
      this.integrations = body.map(integration => {
        return {
          ...integration,
          isRunning: integration.status === 'RUNNING',
          color: integration.status === 'RUNNING' ? 'green' : 'red'
        }
      })
    })
  },
  async updateIntegrationStatus() {
    this.isIntegrationStatusUpdating = true
    apiPost(`/admin/integrations/${this.integrationId}/${this.operation}`, null, (body) => {
      this.isIntegrationStatusUpdating = false
      this.closeModal()
    })
  },

  // Events
  events: [],
  async fetchEvents() {
    apiGet('/admin/events', (body) => {
      this.events = body.map(event => {
        return {
          ...event,
          createdAtString: new Date(event.createdAt).toLocaleString()
        }
      })
    })
  },
}

Alpine.start()
