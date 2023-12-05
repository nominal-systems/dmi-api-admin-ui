export function isProviderPage() {
  const hashParts = window.location.hash.split('#/')
  return window.location.pathname === '/providers' && hashParts.length === 2;
}

export function getProviderFromUrl() {
  const hashParts = window.location.hash.split('#/')
  return isProviderPage() ? hashParts[1].split('/')[0] : null;
}

export function getReferenceDataTypeFromUrl() {
  const hashParts = window.location.hash.split('#/')
  return isProviderPage() ? hashParts[1].split('/')[1] : null;
}

export function navigateToProviderPage(providerId) {
  window.history.pushState({}, '', `/providers#/${providerId}`)
  // window.location.assign(`/providers#/${provider.id}`)
  setTimeout(() => {
    window.location.reload(true)
  }, 0);
}
