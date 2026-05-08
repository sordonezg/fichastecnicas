import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import Organization from './organization.js'
import Event from './event.js'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import LocationAssignmentRule from './location_assignment_rule.js'

export default class EventType extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare description: string

  @column()
  declare organizationId: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Organization)
  declare organization: BelongsTo<typeof Organization>

  @hasMany(() => LocationAssignmentRule)
  declare locationAssignmentRules: HasMany<typeof LocationAssignmentRule>

  @hasMany(() => Event)
  declare events: HasMany<typeof Event>
}
