import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import User from './user.js'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import EventVersion from './event_version.js'
import StaffRole from './staff_role.js'

export default class VersionStaffing extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare eventVersionId: number

  @column()
  declare staffRoleId: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User)
  declare member: BelongsTo<typeof User>

  @belongsTo(() => EventVersion)
  declare eventVersion: BelongsTo<typeof EventVersion>

  @belongsTo(() => StaffRole)
  declare staffRole: BelongsTo<typeof StaffRole>
}
