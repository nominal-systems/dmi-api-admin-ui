export function getToken() {
  if (window.localStorage.getItem('token')) {
    return window.localStorage.getItem('token')
  } else if (document.cookie) {
    return document.cookie.split('; ').find(row => row.startsWith('JWT_TOKEN='))
  }
}

export function setToken(token) {
  window.localStorage.setItem('token', token)
  document.cookie = `JWT_TOKEN=${token}; path=/; max-age=31536000;`
}

export function unsetToken() {
  window.localStorage.removeItem('token')
  document.cookie = 'JWT_TOKEN=; path=/; max-age=0;'
}
