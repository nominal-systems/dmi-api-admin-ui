import { getTokenFromLocalStorage, unsetTokenFromLocalStorage } from "./auth";

const BASE_URL = `${process.env.API_URL}/admin`

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

  return fetch(url, req)
    .then(response => response.json())
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

export const getIntegrations = async (next) => {
  let integrations = []
  await apiGet(`${BASE_URL}/integrations`, (body) => {
    integrations = body
  })
  return integrations
}
export const getIntegrationForProvider = async (providerId) => {
  let integration = {}
  await apiGet(`${BASE_URL}/integrations?providerId=${providerId}`, (body) => {
    integration = body[0]
  })
  return integration
}
export const getProviders = async () => {
  let providers = []
  await apiGet(`${BASE_URL}/providers`, (body) => {
    providers = body
  })
  return providers
}

export const getProvider = async (id) => {
  let provider = {}
  await apiGet(`${BASE_URL}/providers/${id}`, (body) => {
    provider = body
  })
  return provider
}

export const getProviderRefs = async (id, type) => {
  let refs = []
  await apiGet(`${BASE_URL}/providers/${id}/refs/${type}`, (body) => {
    refs = body
  })
  return refs
}

export const syncProviderRefs = async (provider, type, integrationId, next) => {
  await apiPost(`${BASE_URL}/refs/sync/${provider}/${type}?integrationId=${integrationId}`, null, (body) => {
    next(body)
  })
}
