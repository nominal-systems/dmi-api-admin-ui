export function isProviderPage() {
  return window.location.pathname.includes('/providers/');
}

export function navigateToProviderPage(url) {
  window.history.pushState({}, '', url)
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

export function removeQueryParam(param) {
  const url = new URL(window.location.href);
  url.searchParams.delete(param);
  window.history.replaceState({}, document.title, url.toString());
}

export function setHash(hash) {
  window.location.hash = hash
}

export function getQueryParams() {
  let searchParams = new URLSearchParams(window.location.search)

  let params = {}
  for (let [key, value] of searchParams.entries()) {
    params[key] = value
  }

  return params;
}

export function isNullOrUndefinedOrEmpty(value) {
  return value === null || value === undefined || value === ''
}
