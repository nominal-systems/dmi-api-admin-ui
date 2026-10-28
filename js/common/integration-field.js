import { getIntegration } from '../api-client'
import { buildIntegrationField } from './utils'

// Integration field with the integration's current status and practice. A failed lookup shows UNKNOWN
export async function fetchIntegrationField(integrationId) {
  if (!integrationId) return null
  const integration = await getIntegration(integrationId).catch(() => null)
  return buildIntegrationField(integrationId, {
    practiceName: integration?.practice?.name,
    status: integration?.status || 'UNKNOWN'
  })
}
