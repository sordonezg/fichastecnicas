import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import LocationType from './location_type.js'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import VersionActivity from './version_activity.js'

export default class Location extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare address: string | null

  @column()
  declare capacity: number

  @column()
  declare organizationId: number

  @column()
  declare locationTypeId: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => LocationType)
  declare locationType: BelongsTo<typeof LocationType>

  @hasMany(() => VersionActivity)
  declare versionActivities: HasMany<typeof VersionActivity>
}
