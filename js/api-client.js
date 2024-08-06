import { getTokenFromLocalStorage, unsetTokenFromLocalStorage } from "./auth";
import config from './config'

const API_BASE_URL = config.get('API_BASE')
const UI_BASE_URL = config.get('UI_BASE')

const apiPost = async (url, body, next) => {
  const req = {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getTokenFromLocalStorage()}`
    }
  }

  if (body !== null) {
    req.headers['Content-Type'] = 'application/json'
    req.body = JSON.stringify(body)
  }

  try {
    if (process.env.NODE_ENV === 'development') {
      console.log(`POST ${API_BASE_URL}${url}`)
    }
    const response = await fetch(`${API_BASE_URL}${url}`, req)
    const responseBody = await response.json()

    if (!response.ok) {
      const error = new Error(responseBody.message || 'Server responded with an error');
      error.status = response.status;
      error.statusText = response.statusText;
      error.body = responseBody; // Including server response data
      throw error;
    }

    return responseBody
  } catch (error) {
    if (error.name === 'TypeError') {
      error.message = 'Network issue. Please try again later.'
    }
    throw error
  }


}

function apiGet(url, next) {
  if (process.env.NODE_ENV === 'development') {
    console.log(`GET ${API_BASE_URL}${url}`)
  }
  return fetch(`${API_BASE_URL}${url}`, {
    headers: new Headers({
      Authorization: `Bearer ${getTokenFromLocalStorage()}`
    })
  }).then(res => res.json())
    .then(res => {
      if (res.statusCode === 401 || res.statusCode === 403) {
        unsetTokenFromLocalStorage()
        window.location.href = `${UI_BASE_URL}/login?redirect=${window.location.href}`
      }
      next(res)
    })
}

function apiGet2(url) {
  if (process.env.NODE_ENV === 'development') {
    console.log(`GET ${API_BASE_URL}${url}`)
  }
  return fetch(`${API_BASE_URL}${url}`, {
    headers: new Headers({
      Authorization: `Bearer ${getTokenFromLocalStorage()}`
    })
  }).then(res => res.json())
    .then(res => {
      if (res.statusCode === 401 || res.statusCode === 403) {
        unsetTokenFromLocalStorage()
        window.location.href = `${UI_BASE_URL}/login?redirect=${window.location.href}`
      }
      return res
    })
}

export const login = async (user) => {
  return await apiPost(`/login`, user)
}

export const getOrganizations = async () => {
  return await apiGet2('/organizations')
}

export const getEvents = async (page, limit) => {
  return await apiGet2(`/events?page=${page}&limit=${limit}`)
}

export const getEvent = async (id) => {
  return await apiGet2(`/events/${id}`)
}

export const getIntegrations = async () => {
  return await apiGet2(`/integrations`)
}

export const getIntegration = async (id) => {
  return await apiGet2(`/integrations/${id}`)
}

export const getIntegrationForProvider = async (providerId) => {
  let integration = {}
  await apiGet(`/integrations?providerId=${providerId}`, (body) => {
    integration = body[0]
  })
  return integration
}

export const updateIntegrationStatus = async (integrationId, operation) => {
  return await apiPost(`/integrations/${integrationId}/${operation}`, null)
}

export const getProviders = async () => {
  return (await apiGet2(`/providers`)).filter(provider => provider.id !== 'heska')
}

export const getRefs = async (type, page, limit) => {
  const refs = await apiGet2(`/refs/${type}?page=${page}&limit=${limit}`)
  refs.data.map((ref) => {
    ref.providerRef = ref.providerRef.reduce((acc, item) => {
      acc[item.provider.id] = item;
      return acc;
    }, {})
    return ref
  })
  return refs
}

export const updateRefMapping = async (refId, providerRefId) => {
  return await apiPost(`/refs/${refId}/mapping`, { providerRefId })
}

export const getProvider = async (id) => {
  let provider = {}
  await apiGet(`/providers/${id}`, (body) => {
    provider = body
  })
  return provider
}

export const getProviderRefs = async (provider, type, page, limit) => {
  return await apiGet2(`/providers/${provider}/refs/${type}?page=${page}&limit=${limit}`)
}

export const searchProviderRefs = async (provider, type, query) => {
  return await apiGet2(`/providers/${provider}/refs/${type}?page=1&limit=100&search=${query}`)
}

export const getDefaultBreeds = async (providerId, speciesCodes) => {
  let defaultBreeds = []
  await apiGet(`/providers/${providerId}/defaultBreed?speciesCodes=${speciesCodes.join(',')}`, (body) => {
    defaultBreeds = body
  })
  return defaultBreeds
}

export const syncProviderRefs = async (provider, type, integrationId, next) => {
  await apiPost(`/refs/sync/${provider}/${type}?integrationId=${integrationId}`, null, (body) => {
    next(body)
  })
}

export const getExternalRequests = async (providers, status, page, limit) => {
  let result = {}
  await apiGet(`/external-requests?providers=${providers}&status=${status}&page=${page}&limit=${limit}`, (body) => {
    result = body
  })
  return result
}

export const getExternalRequest = async (id) => {
  let result = {}
  await apiGet(`/external-requests/${id}`, (body) => {
    result = body
  })
  return result
}
