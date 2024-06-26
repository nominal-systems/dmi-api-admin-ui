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
