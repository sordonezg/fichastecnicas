import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import Organization from './organization.js'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import LocationType from './location_type.js'

export default class LocationAccountRule extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare isAllowed: number

  @column()
  declare requiresApproval: number

  @column()
  declare maxCapacityOverride: number | null

  @column()
  declare organizationId: number

  @column()
  declare userId: number

  @column()
  declare locationTypeId: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Organization)
  declare organization: BelongsTo<typeof Organization>

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => LocationType)
  declare locationType: BelongsTo<typeof LocationType>
}
