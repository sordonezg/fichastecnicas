import { DateTime } from 'luxon'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import Department from './department.js'
import LocationType from './location_type.js'
import EventType from './event_type.js'
import Event from './event.js'
import LocationAssignmentRule from './location_assignment_rule.js'
import LocationAccountRule from './location_account_rule.js'
import StaffRole from './staff_role.js'


export default class Organization extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare color: string

  @column()
  declare slug: string

  @column()
  declare logo: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @hasMany(() => User)
  declare users: HasMany<typeof User>

  @hasMany(() => Department)
  declare departments: HasMany<typeof Department>

  @hasMany(() => LocationType)
  declare locationTypes: HasMany<typeof LocationType>

  @hasMany(() => EventType)
  declare eventTypes: HasMany<typeof EventType>

  @hasMany(() => LocationAssignmentRule)
  declare locationAssignmentRules: HasMany<typeof LocationAssignmentRule>

  @hasMany(() => LocationAccountRule)
  declare locationAccountRules: HasMany<typeof LocationAccountRule>

  @hasMany(() => Event)
  declare events: HasMany<typeof Event>

  @hasMany(() => StaffRole)
  declare staffRoles: HasMany<typeof StaffRole>
}
