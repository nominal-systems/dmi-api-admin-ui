export function getTokenFromLocalStorage() {
  if (window.localStorage.getItem('token')) {
    return window.localStorage.getItem('token')
  }
}

export function setTokenToLocalStorage(token) {
  window.localStorage.setItem('token', token)
}

export function unsetTokenFromLocalStorage() {
  window.localStorage.removeItem('token')
}
