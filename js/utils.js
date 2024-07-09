export function isProviderPage() {
  const hashParts = window.location.hash.split('#/')
  return window.location.pathname.includes('/providers') && hashParts.length === 2;
}

export function getProviderFromUrl() {
  const hashParts = window.location.hash.split('#/')
  return isProviderPage() ? hashParts[1] : null;
}

export function getReferenceDataTypeFromUrl() {
  const hashParts = window.location.hash.split('#/')
  return isProviderPage() ? hashParts[1].split('/')[1] : null;
}

export function navigateToProviderPage(url) {
  window.history.pushState({}, '', url)
  // window.location.assign(`/providers#/${provider.id}`)
  setTimeout(() => {
    window.location.reload(true)
  }, 0);
}

export function getIdFromPath() {
  return window.location.pathname.split('/').slice(-1)[0]
}

export function setQueryParam(param, value) {
  let url = new URL(window.location)
  url.searchParams.set(param, value)
  window.history.pushState({}, '', url)
}

export function getQueryParams() {
  let searchParams = new URLSearchParams(window.location.search)

  let params = {}
  for (let [key, value] of searchParams.entries()) {
    params[key] = value
  }

  return params;
}
