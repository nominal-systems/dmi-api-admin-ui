import 'regenerator-runtime/runtime'
import Alpine from 'alpinejs'
import { getThemeFromLocalStorage, setThemeToLocalStorage } from "./theme"
import { setTokenToLocalStorage } from "./auth"
import { apiGet, apiPost } from "./api-client"
import { refs } from "./refs";

const DMI_API_URL = process.env.API_URL

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
      url: '/',
      name: 'Dashboard',
      icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
    },
    {
      slug: 'integrations',
      url: '/integrations',
      name: 'Integrations',
      icon: 'M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5'
    },
    {
      slug: 'events',
      url: '/events',
      name: 'Events',
      icon: 'M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z'
    },
    {
      slug: 'refs',
      url: '/refs',
      name: 'Reference Data',
      icon: 'M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z'
    }
  ],


  // Integrations
  integrations: [],
  operation: null,
  integrationId: null,
  isIntegrationStatusUpdating: false,
  async fetchIntegrations() {
    await apiGet(`${DMI_API_URL}/admin/integrations`, (body) => {
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
    await apiPost(`${DMI_API_URL}/admin/integrations/${this.integrationId}/${this.operation}`, null, (body) => {
      this.isIntegrationStatusUpdating = false
      this.closeModal()
    })
  },

  // Events
  events: [],
  async fetchEvents() {
    await apiGet(`${DMI_API_URL}/admin/events`, (body) => {
      this.events = body.map(event => {
        return {
          ...event,
          createdAtString: new Date(event.createdAt).toLocaleString()
        }
      })
    })
  },
}

window.refs = refs

Alpine.start()
