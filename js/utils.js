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

export function mapHttpStatusText(status) {
  switch (status) {
    case 200:
      return 'OK'
    case 201:
      return 'Created'
    case 204:
      return 'No Content'
    case 400:
      return 'Bad Request'
    case 401:
      return 'Unauthorized'
    case 403:
      return 'Forbidden'
    case 404:
      return 'Not Found'
    case 405:
      return 'Method Not Allowed'
    case 500:
      return 'Internal Server Error'
    default:
      return undefined
  }
}

export function mapHttpStatusColor(status) {
  switch (status) {
    case 200:
    case 201:
    case 204:
      return 'green'
    case 400:
    case 401:
    case 403:
    case 404:
    case 405:
    case 500:
      return 'red'
    default:
      return 'gray'
  }
}

export function mapHttpMethodColor(method) {
  switch (method) {
    case 'GET':
      return 'green'
    case 'POST':
      return 'yellow'
    case 'PUT':
      return 'blue'
    case 'DELETE':
      return 'red'
    default:
      return 'gray'
  }
}
