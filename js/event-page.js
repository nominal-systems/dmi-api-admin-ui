import Alpine from 'alpinejs'
import { getIdFromPath } from './common/utils'
import { getEvent } from './api-client'

export const eventPage = {
  event: {},
  async init() {
    this.event = await getEvent(getIdFromPath())
    Alpine.store('title').set(`Event ${this.event._id}`)
  }
}
