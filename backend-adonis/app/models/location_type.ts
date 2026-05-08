import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import Organization from './organization.js'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Location from './location.js'
import LocationAssignmentRule from './location_assignment_rule.js'
import LocationAccountRule from './location_account_rule.js'

export default class LocationType extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare allowsExternalStaff: boolean

  @column()
  declare organizationId: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Organization)
  declare organization: BelongsTo<typeof Organization>

  @hasMany(() => Location)
  declare locations: HasMany<typeof Location>

  @hasMany(() => LocationAssignmentRule)
  declare locationAssignmentRules: HasMany<typeof LocationAssignmentRule>

  @hasMany(() => LocationAccountRule)
  declare locationAccountRules: HasMany<typeof LocationAccountRule>
}
