import { getTokenFromLocalStorage, unsetTokenFromLocalStorage } from "./auth";

const API_BASE_URL = `${process.env.API_URL}/admin`
const UI_BASE_URL = `${process.env.UI_URL}`

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
        window.location.href = `${UI_BASE_URL}/login`
      }
      next(res)
    })
}

export const getEvents = async (page, limit) => {
  let events = []
  await apiGet(`${API_BASE_URL}/events?page=${page}&limit=${limit}`, (body) => {
    events = body
  })
  return events
}
export const getIntegrations = async (next) => {
  let integrations = []
  await apiGet(`${API_BASE_URL}/integrations`, (body) => {
    integrations = body
  })
  return integrations
}
export const getIntegrationForProvider = async (providerId) => {
  let integration = {}
  await apiGet(`${API_BASE_URL}/integrations?providerId=${providerId}`, (body) => {
    integration = body[0]
  })
  return integration
}
export const getProviders = async () => {
  let providers = []
  await apiGet(`${API_BASE_URL}/providers`, (body) => {
    providers = body
  })
  return providers
}

export const getRefs = async (type, page, limit) => {
  let refs = []
  await apiGet(`${API_BASE_URL}/refs/${type}?page=${page}&limit=${limit}`, (body) => {
    refs = body
  })
  return refs
}

export const getProvider = async (id) => {
  let provider = {}
  await apiGet(`${API_BASE_URL}/providers/${id}`, (body) => {
    provider = body
  })
  return provider
}

export const getProviderRefs = async (id, type, page, limit) => {
  let refs = []
  await apiGet(`${API_BASE_URL}/providers/${id}/refs/${type}?page=${page}&limit=${limit}`, (body) => {
    refs = body
  })
  return refs
}

export const getDefaultBreeds = async (providerId, speciesCodes) => {
  let defaultBreeds = []
  await apiGet(`${API_BASE_URL}/providers/${providerId}/defaultBreed?speciesCodes=${speciesCodes.join(',')}`, (body) => {
    defaultBreeds = body
  })
  return defaultBreeds
}

export const syncProviderRefs = async (provider, type, integrationId, next) => {
  await apiPost(`${API_BASE_URL}/refs/sync/${provider}/${type}?integrationId=${integrationId}`, null, (body) => {
    next(body)
  })
}

export const getExternalRequests = async (providers, status, page, limit) => {
  let result = {}
  await apiGet(`${API_BASE_URL}/external-requests?providers=${providers}&status=${status}&page=${page}&limit=${limit}`, (body) => {
    result = body
  })
  return result
}

export const getExternalRequest = async (id) => {
  let result = {}
  await apiGet(`${API_BASE_URL}/external-requests/${id}`, (body) => {
    result = body
  })
  return result
}
