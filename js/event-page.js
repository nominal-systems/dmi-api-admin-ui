import { getIdFromPath } from './common/utils'
import { getEvent } from './api-client'

export const eventPage = {
  event: {},
  async init() {
    this.event = await getEvent(getIdFromPath())
  }
}
