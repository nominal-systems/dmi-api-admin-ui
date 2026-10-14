import { getToken, unsetToken } from "./auth";
import config from './config'
import { isNullOrUndefined, isNullOrUndefinedOrEmpty } from './common/utils'

const API_BASE_URL = config.get('API_BASE')
const UI_BASE_URL = config.get('UI_BASE')

const REAUTH_STORAGE_KEY = 'dmi-admin:reauth-at';
const REAUTH_COOLDOWN_MS = 30 * 1000;
let reauthenticating = false;

/**
 * Reloads the page once so the API restarts the login for its auth strategy and brings the user back here.
 * Parallel failures share that single reload. Returns false when a reload already happened within the
 * cooldown, so a login that keeps failing surfaces as an error instead of looping.
 */
const reauthenticate = () => {
  if (reauthenticating) {
    return true;
  }
  try {
    const lastAttempt = Number(window.sessionStorage.getItem(REAUTH_STORAGE_KEY)) || 0;
    if (Date.now() - lastAttempt < REAUTH_COOLDOWN_MS) {
      return false;
    }
    window.sessionStorage.setItem(REAUTH_STORAGE_KEY, String(Date.now()));
  } catch (_) {
  }
  reauthenticating = true;
  unsetToken();
  window.location.reload();
  return true;
};

/**
 * Core request function used by both GET and POST/PUT calls.
 * Omits the Authorization header if getToken() returns null or undefined.
 */
const apiRequest = async (method, path, body = null, baseUrl = API_BASE_URL) => {
  // Build headers, including Authorization only if a token is present
  const headers = {};
  const token = getToken();
  if (token != null) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  headers['Accept'] = 'application/json';
  headers['X-Requested-With'] = 'XMLHttpRequest';
  if (body !== null) {
    headers['Content-Type'] = 'application/json';
  }

  const req = { method, headers, redirect: 'manual' };
  if (body !== null) {
    req.body = JSON.stringify(body);
  }

  try {
    if (process.env.NODE_ENV === 'development') {
      console.log(`${method} ${baseUrl}${path}`);
    }
    const response = await fetch(`${baseUrl}${path}`, req);
    const contentType = response.headers ? (response.headers.get('content-type') || '') : '';
    // The session expired: 401 from the admin API, or a redirect to Okta from APIs that predate the 401
    const isRedirect = response.type === 'opaqueredirect' || (response.status >= 300 && response.status < 400);
    if (baseUrl === API_BASE_URL && (isRedirect || response.status === 401)) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`[apiRequest] Authentication required for ${method} ${baseUrl}${path}`);
      }
      if (reauthenticate()) {
        // The page is reloading: never settle, so callers don't render errors in the meantime
        return new Promise(() => {});
      }
      if (isRedirect) {
        const error = new Error('Your session expired and logging in again failed. Please reload the page.');
        error.status = 401;
        throw error;
      }
    }

    let responseBody = null;
    if (response.status !== 204) {
      if (contentType.includes('application/json')) {
        responseBody = await response.json();
      } else {
        try {
          responseBody = await response.text();
        } catch (_) {
          responseBody = null;
        }
      }
    }

    if (!response.ok) {
      const msg = (typeof responseBody === 'object' && responseBody && responseBody.message)
        ? responseBody.message
        : (typeof responseBody === 'string' && responseBody ? responseBody : 'Server responded with an error');
      const error = new Error(msg);
      error.status = response.status;
      error.statusText = response.statusText;
      error.body = responseBody;
      throw error;
    }

    return responseBody;
  } catch (error) {
    if (error.name === 'TypeError') {
      error.message = 'Network issue. Please try again later.';
    }
    throw error;
  }
};

/**
 * Wrapper for GET requests.
 * Clears the stored token on 401/403 so later requests don't resend it. Re-login is handled by apiRequest.
 */
const apiGet = async (path, baseUrl = API_BASE_URL) => {
  try {
    const res = await apiRequest('GET', path, null, baseUrl);
    return res;
  } catch (error) {
    if (error.status === 401 || error.status === 403) {
      unsetToken();
    }
    throw error;
  }
};

/**
 * Wrapper for POST requests. Uses apiRequest under the hood.
 */
const apiPost = async (path, body, baseUrl = API_BASE_URL) => {
  return await apiRequest('POST', path, body, baseUrl);
};


export const login = async (user) => {
  return await apiPost(`/login`, user, `${config.get('API_HOST')}/auth/admin`)
}

export const profile = async () => {
  return await apiGet(`/profile`, `${config.get('API_HOST')}/auth`)
}

export const getOrganizations = async () => {
  return await apiGet('/organizations')
}

export const getEvents = async ({ providers, integrations, types, date, search }, page, limit) => {
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
  if (search !== undefined) {
    qs += `&search=${search}`
  }

  return await apiGet(`/events?${qs}`)
}

export const getEventsStats = async (types, startDate, endDate, groupBy) => {
  let qs = `startDate=${startDate}&endDate=${endDate}`
  if (types !== undefined) {
    qs += `&types=${types.join(',')}`
  }
  if (groupBy !== undefined) {
    qs += `&groupBy=${groupBy.join(',')}`
  }
  return await apiGet(`/events/stats?${qs}`)
}

export const getEvent = async (id) => {
  return await apiGet(`/events/${id}`)
}

export const getIntegrations = async ({
                                        providers,
                                        providerConfigurations,
                                        organizations,
                                        statuses,
                                        practices,
                                        search
                                      }, page, limit) => {
  let qs = `page=${page}&limit=${limit}`
  if (!isNullOrUndefined(providers)) {
    qs += `&providers=${providers.join(',')}`
  }
  if (!isNullOrUndefined(providerConfigurations)) {
    qs += `&providerConfigurations=${providerConfigurations.join(',')}`
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
  if (!isNullOrUndefined(search)) {
    qs += `&search=${search}`
  }
  return await apiGet(`/integrations?${qs}`)
}

export const getIntegration = async (id) => {
  return await apiGet(`/integrations/${id}`)
}

export const getIntegrationsForProvider = async (providerId) => {
  return await apiGet(`/providers/${providerId}/integrations`)
}

export const updateIntegrationStatus = async (integrationId, operation) => {
  return await apiPost(`/integrations/${integrationId}/${operation}`, null)
}

export const updateIntegrationOptions = async (integrationId, integrationOptions) => {
  return await apiRequest('PATCH', `/integrations/${integrationId}`, { integrationOptions })
}

export const updateProviderConfiguration = async (providerConfigurationId, providerConfiguration) => {
  return await apiRequest('PUT', `/providerConfigurations/${providerConfigurationId}`, providerConfiguration)
}

export const getProviderConfigurations = async ({}, page, limit) => {
  const qs = `page=${page}&limit=${limit}`
  return await apiGet(`/providerConfigurations?${qs}`)
}

export const getProviderConfiguration = async (id) => {
  return await apiGet(`/providerConfigurations/${id}`)
}

export const getProviders = async () => {
  return (await apiGet(`/providers`)).filter(provider => provider.id !== 'heska' && provider.id !== 'demo')
}

export const getRefs = async (type, search, page, limit) => {
  let queryString = `page=${page}&limit=${limit}`
  if (!isNullOrUndefinedOrEmpty(search)) {
    queryString += `&search=${search}`
  }

  const refs = await apiGet(`/refs/${type}?${queryString}`)
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

// Unset a mapping by provider; API expects providerId in body
export const unsetRefMapping = async (refId, providerId) => {
  return await apiPost(`/refs/${refId}/mapping`, { providerId })
}

export const getProviderRefs = async (provider, type, query, page, limit) => {
  let queryString = `page=${page}&limit=${limit}`
  if (!isNullOrUndefinedOrEmpty(query)) {
    queryString += `&search=${query}`
  }
  return await apiGet(`/providers/${provider}/refs/${type}?${queryString}`)
}

export const searchProviderRefs = async ({ provider, type, species, search }) => {
  let queryString = `page=1&limit=500`
  if (!isNullOrUndefinedOrEmpty(species)) {
    queryString += `&species=${species}`
  }
  if (!isNullOrUndefinedOrEmpty(search)) {
    queryString += `&search=${search}`
  }
  return await apiGet(`/providers/${provider}/refs/${type}?${queryString}`)
}

export const getDefaultBreeds = async (providerId, speciesCodes) => {
  return await apiGet(`/providers/${providerId}/defaultBreed?speciesCodes=${speciesCodes.join(',')}`)
}

export const setDefaultBreed = async (providerId, speciesCode, breedCode) => {
  return await apiRequest('PUT', `/providers/${providerId}/defaultBreed?species=${speciesCode}&breed=${breedCode}`, {})
}

// Mapping-level default breed for a specific refSpecies -> providerSpecies pair
export const getMappingDefaultBreed = async (providerId, refSpeciesCode, providerSpeciesCode) => {
  const qs = `refSpecies=${encodeURIComponent(refSpeciesCode)}&providerSpecies=${encodeURIComponent(providerSpeciesCode)}`
  return await apiGet(`/providers/${providerId}/mappingDefaultBreed?${qs}`)
}

export const setMappingDefaultBreed = async (providerId, refSpeciesCode, providerSpeciesCode, breedCode) => {
  let qs = `refSpecies=${encodeURIComponent(refSpeciesCode)}&providerSpecies=${encodeURIComponent(providerSpeciesCode)}`
  if (breedCode && `${breedCode}`.length > 0) {
    qs += `&breed=${encodeURIComponent(breedCode)}`
  }

  return await apiRequest('PUT', `/providers/${providerId}/mappingDefaultBreed?${qs}`, {})
}

export const syncProviderRefs = async (provider, type, integrationId, next) => {
  return await apiPost(`/refs/sync/${provider}/${type}?integrationId=${integrationId}`, null)
}

export const getExternalRequests = async ({ providers, status, method, practices, date }, page, limit) => {
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
  if (practices !== undefined) {
    qs += `&practiceId=${practices.join(',')}`
  }
  if (date !== undefined) {
    qs += `&startDate=${date[0]}&endDate=${date[1]}`
  }
  return await apiGet(`/external-requests?${qs}`)
}

export const getExternalRequestsStats = async (startDate, endDate) => {
  return await apiGet(`/external-requests/stats?startDate=${startDate}&endDate=${endDate}`)
}

export const getExternalRequest = async (id) => {
  return await apiGet(`/external-requests/${id}`)
}

export const getPractices = async ({ ids, search }, page, limit) => {
  let qs = `page=${page}&limit=${limit}`
  if (ids !== undefined) {
    qs += `&ids=${ids.join(',')}`
  }
  if (search !== undefined) {
    qs += `&search=${search}`
  }
  return await apiGet(`/practices?${qs}`)
}

export const getTransactionLogs = async (accessionId) => {
  return await apiGet(`/transaction-logs?accessionId=${accessionId}`)
}

export const getOrderStats = async (stat, { startDate, endDate }) => {
  let qs = `startDate=${startDate}&endDate=${endDate}`
  if (stat !== undefined) {
    qs += `&stat=${stat}`
  }
  return await apiGet(`/orders/stats?${qs}`)
}
