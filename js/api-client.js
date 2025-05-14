import { getToken, unsetToken } from "./auth";
import config from './config'
import { isNullOrUndefined, isNullOrUndefinedOrEmpty } from './common/utils'

const API_BASE_URL = config.get('API_BASE')
const UI_BASE_URL = config.get('UI_BASE')

const apiPost = async (path, body, baseUrl = API_BASE_URL) => {
  return await apiRequest('POST', path, body, baseUrl)
}

const apiRequest = async (method, path, body, baseUrl = API_BASE_URL) => {
  const req = {
    method: method,
    headers: {
      Authorization: `Bearer ${getToken()}`
    }
  }

  if (body !== null) {
    req.headers['Content-Type'] = 'application/json'
    req.body = JSON.stringify(body)
  }

  try {
    if (process.env.NODE_ENV === 'development') {
      console.log(`POST ${baseUrl}${path}`)
    }
    const response = await fetch(`${baseUrl}${path}`, req)
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
      Authorization: `Bearer ${getToken()}`
    })
  }).then(res => res.json())
    .then(res => {
      if (res.statusCode === 401 || res.statusCode === 403) {
        unsetToken()
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
      Authorization: `Bearer ${getToken()}`
    })
  }).then(res => res.json())
    .then(res => {
      if (res.statusCode === 401 || res.statusCode === 403) {
        unsetToken()
        window.location.href = `${UI_BASE_URL}/login?redirect=${window.location.href}`
      }
      return res
    })
}

export const login = async (user) => {
  return await apiPost(`/login`, user, `${config.get('API_HOST')}/auth/admin`)
}

export const getOrganizations = async () => {
  return await apiGet2('/organizations')
}

export const getEvents = async ({ providers, integrations, types, date }, page, limit) => {
  let qs = `page=${page}&limit=${limit}`
  if (providers !== undefined) {
    qs += `&providers=${providers.join(',')}`
  }
  if (integrations !== undefined) {
    qs += `&integrations=${integrations.join(',')}`
  }
  if (types !== undefined) {
    qs += `&types=${types.join(',')}`
  }
  if (date !== undefined) {
    qs += `&startDate=${date[0]}&endDate=${date[1]}`
  }

  return await apiGet2(`/events?${qs}`)
}

export const getEventsStats = async (types, startDate, endDate, groupBy) => {
  let qs = `startDate=${startDate}&endDate=${endDate}`
  if (types !== undefined) {
    qs += `&types=${types.join(',')}`
  }
  if (groupBy !== undefined) {
    qs += `&groupBy=${groupBy.join(',')}`
  }
  return await apiGet2(`/events/stats?${qs}`)
}

export const getEvent = async (id) => {
  return await apiGet2(`/events/${id}`)
}

export const getIntegrations = async ({ providers, organizations, statuses, practices }, page, limit) => {
  let qs = `page=${page}&limit=${limit}`
  if (!isNullOrUndefined(providers)) {
    qs += `&providers=${providers.join(',')}`
  }
  if (!isNullOrUndefined(organizations)) {
    qs += `&organizations=${organizations.join(',')}`
  }
  if (!isNullOrUndefined(statuses)) {
    qs += `&statuses=${statuses.join(',')}`
  }
  if (!isNullOrUndefined(practices)) {
    qs += `&practices=${practices.join(',')}`
  }
  return await apiGet2(`/integrations?${qs}`)
}

export const getIntegration = async (id) => {
  return await apiGet2(`/integrations/${id}`)
}

export const getIntegrationsForProvider = async (providerId) => {
  return await apiGet2(`/providers/${providerId}/integrations`)
}

export const updateIntegrationStatus = async (integrationId, operation) => {
  return await apiPost(`/integrations/${integrationId}/${operation}`, null)
}

export const getProviders = async () => {
  return (await apiGet2(`/providers`)).filter(provider => provider.id !== 'heska' && provider.id !== 'demo')
}

export const getRefs = async (type, search, page, limit) => {
  let queryString = `page=${page}&limit=${limit}`
  if (!isNullOrUndefinedOrEmpty(search)) {
    queryString += `&search=${search}`
  }

  const refs = await apiGet2(`/refs/${type}?${queryString}`)
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

export const getProviderRefs = async (provider, type, query, page, limit) => {
  let queryString = `page=${page}&limit=${limit}`
  if (!isNullOrUndefinedOrEmpty(query)) {
    queryString += `&search=${query}`
  }
  return await apiGet2(`/providers/${provider}/refs/${type}?${queryString}`)
}

export const searchProviderRefs = async ({ provider, type, species, search }) => {
  let queryString = `page=1&limit=100`
  if (!isNullOrUndefinedOrEmpty(species)) {
    queryString += `&species=${species}`
  }
  if (!isNullOrUndefinedOrEmpty(search)) {
    queryString += `&search=${search}`
  }
  return await apiGet2(`/providers/${provider}/refs/${type}?${queryString}`)
}

export const getDefaultBreeds = async (providerId, speciesCodes) => {
  let defaultBreeds = []
  await apiGet(`/providers/${providerId}/defaultBreed?speciesCodes=${speciesCodes.join(',')}`, (body) => {
    defaultBreeds = body
  })
  return defaultBreeds
}

export const setDefaultBreed = async (providerId, speciesCode, breedCode) => {
  return await apiRequest('PUT', `/providers/${providerId}/defaultBreed?species=${speciesCode}&breed=${breedCode}`, {})
}

export const syncProviderRefs = async (provider, type, integrationId, next) => {
  return await apiPost(`/refs/sync/${provider}/${type}?integrationId=${integrationId}`, null)
}

export const getExternalRequests = async (providers, status, method, date, page, limit) => {
  let qs = `page=${page}&limit=${limit}`
  if (providers !== undefined) {
    qs += `&providers=${providers.join(',')}`
  }
  if (method !== undefined) {
    qs += `&method=${method.join(',')}`
  }
  if (status !== undefined) {
    qs += `&status=${status.join(',')}`
  }
  if (date !== undefined) {
    qs += `&startDate=${date[0]}&endDate=${date[1]}`
  }
  return await apiGet2(`/external-requests?${qs}`)
}

export const getExternalRequestsStats = async (startDate, endDate) => {
  return await apiGet2(`/external-requests/stats?startDate=${startDate}&endDate=${endDate}`)
}

export const getExternalRequest = async (id) => {
  let result = {}
  await apiGet(`/external-requests/${id}`, (body) => {
    result = body
  })
  return result
}

export const getPractices = async ({ ids, search }, page, limit) => {
  let qs = `page=${page}&limit=${limit}`
  if (ids !== undefined) {
    qs += `&ids=${ids.join(',')}`
  }
  if (search !== undefined) {
    qs += `&search=${search}`
  }
  return await apiGet2(`/practices?${qs}`)
}

export const getTransactionLogs = async (accessionId) => {
  return await apiGet2(`/transaction-logs?accessionId=${accessionId}`)
}

export const getOrderStats = async (stat, { startDate, endDate }) => {
  let qs = `startDate=${startDate}&endDate=${endDate}`
  if (stat !== undefined) {
    qs += `&stat=${stat}`
  }
  return await apiGet2(`/orders/stats?${qs}`)
}
