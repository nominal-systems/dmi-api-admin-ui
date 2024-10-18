import 'regenerator-runtime/runtime'
import Alpine from 'alpinejs'
import { getThemeFromLocalStorage, setThemeToLocalStorage } from './theme'
import { setTokenToLocalStorage } from './auth'
import { getProviders, login } from './api-client'
import { getIdFromPath, getProviderConfig, isProviderPage, navigateToProviderPage } from './common/utils'
import { dashboard } from './dashboard'
import { events } from './events'
import { eventPage } from './event-page'
import { refs } from './refs'
import { practices } from './practices'
import { providers } from './providers'
import { integrations } from './integrations'
import { integrationPage } from './integration-page'
import { externalRequests } from './external-requests'
import dateDirective from './directives/dateDirective'
import codeDirective from './directives/codeDirective'
import config from './config'
import filterDropdown from './plugins/filter-dropdown'
import searchInput from './plugins/search-input'
import Clipboard from "@ryangjchandler/alpine-clipboard"
import datepicker from './plugins/datepicker'
import chart from './plugins/chart'
import dropdown from './directives/dropdown'
import transactionLogs from './transaction-logs'
import accordion from './directives/accordion'

if (process.env.NODE_ENV === 'development') {
  config.log()
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
  config,

  // Auth
  user: {
    username: null,
    password: null
  },
  error: null,
  async doLogin() {
    await login(this.user)
      .then(res => {
        this.error = null
        setTokenToLocalStorage(res.token)
        window.location.href = new URLSearchParams(window.location.search).get('redirect') || `${config.get('UI_BASE')}/`
      })
      .catch(err => {
        this.error = err
      })
  },

  // Menu
  pages: [
    {
      slug: 'dashboard',
      url: `${config.get('UI_BASE')}/`,
      name: 'Dashboard',
      icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
    },
    {
      slug: 'practices',
      url: `${config.get('UI_BASE')}/practices`,
      name: 'Practices',
      icon: 'M4 16.5v-13h-.25a.75.75 0 0 1 0-1.5h12.5a.75.75 0 0 1 0 1.5H16v13h.25a.75.75 0 0 1 0 1.5h-3.5a.75.75 0 0 1-.75-.75v-2.5a.75.75 0 0 0-.75-.75h-2.5a.75.75 0 0 0-.75.75v2.5a.75.75 0 0 1-.75.75h-3.5a.75.75 0 0 1 0-1.5H4Zm3-11a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1ZM7.5 9a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1ZM11 5.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1Zm.5 3.5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1Z'
    },
    {
      slug: 'integrations',
      url: `${config.get('UI_BASE')}/integrations`,
      name: 'Integrations',
      icon: 'M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5'
    },
    {
      slug: 'events',
      url: `${config.get('UI_BASE')}/events`,
      name: 'Events',
      icon: 'M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z'
    },
    {
      slug: 'external-requests',
      url: `${config.get('UI_BASE')}/external-requests`,
      name: 'External Requests',
      icon: 'M3 6a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V6Zm14.25 6a.75.75 0 0 1-.22.53l-2.25 2.25a.75.75 0 1 1-1.06-1.06L15.44 12l-1.72-1.72a.75.75 0 1 1 1.06-1.06l2.25 2.25c.141.14.22.331.22.53Zm-10.28-.53a.75.75 0 0 0 0 1.06l2.25 2.25a.75.75 0 1 0 1.06-1.06L8.56 12l1.72-1.72a.75.75 0 1 0-1.06-1.06l-2.25 2.25Z'
    },
    {
      slug: 'refs',
      url: `${config.get('UI_BASE')}/refs`,
      name: 'Reference Data',
      icon: 'M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z'
    },
    {
      slug: 'providers',
      url: `${config.get('UI_BASE')}/providers`,
      name: 'Providers',
      icon: 'M9.348 14.651a3.75 3.75 0 010-5.303m5.304 0a3.75 3.75 0 010 5.303m-7.425 2.122a6.75 6.75 0 010-9.546m9.546 0a6.75 6.75 0 010 9.546M5.106 18.894c-3.808-3.808-3.808-9.98 0-13.789m13.788 0c3.808 3.808 3.808 9.981 0 13.79M12 12h.008v.007H12V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z'
    }
  ],
  toggleSubMenu(item) {
    item.isSubMenuOpen = !item.isSubMenuOpen
  },
  async initMenu() {
    const providers = await getProviders()
    const providersPage = this.pages.find(page => page.slug === 'providers')
    providersPage.isSubMenuOpen = isProviderPage()
    providersPage.subPages = providers.map(provider => {
      return {
        id: provider.id,
        name: getProviderConfig(provider.id).label,
        url: `${config.get('UI_BASE')}/providers/${provider.id}`,
        active: provider.id === getIdFromPath(),
        go: navigateToProviderPage
      }
    })
  },
}

// Alert
Alpine.store('alert', {
  level: null,
  html: null,
  set(level, html) {
    this.level = level
    this.html = html
  },
  close() {
    this.level = null
    this.html = null
  }
})

// Directives
dateDirective()
codeDirective()
Alpine.plugin(dropdown)
Alpine.plugin(accordion)

// Plugins
Alpine.plugin(chart)
Alpine.plugin(filterDropdown)
Alpine.plugin(datepicker)
Alpine.plugin(searchInput)
Alpine.plugin(Clipboard)

// Alpine init
window.dashboard = dashboard
window.events = events
window.eventPage = eventPage
window.refs = refs
window.providers = providers
window.integrations = integrations
window.integrationPage = integrationPage
window.external_requests = externalRequests
window.practices = practices
window.transaction_logs = transactionLogs
Alpine.start()
