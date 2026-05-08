import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import Organization from './organization.js'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import EventType from './event_type.js'
import LocationType from './location_type.js'

export default class LocationAssignmentRule extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare isAllowed: boolean

  @column()
  declare requiresApproval: boolean

  @column()
  declare maxCapacityOverride: boolean | null

  @column()
  declare organizationId: number

  @column()
  declare eventTypeId: number

  @column()
  declare locationTypeId: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Organization)
  declare organization: BelongsTo<typeof Organization>

  @belongsTo(() => EventType)
  declare eventType: BelongsTo<typeof EventType>

  @belongsTo(() => LocationType)
  declare locationType: BelongsTo<typeof LocationType>
}
