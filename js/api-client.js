import { getTokenFromLocalStorage, unsetTokenFromLocalStorage } from "./auth";

export function apiPost(url, body, next) {
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

export function apiGet(url, next) {
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
