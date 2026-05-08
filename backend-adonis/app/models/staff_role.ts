import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import Organization from './organization.js'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import VersionStaffing from './version_staffing.js'

export default class StaffRole extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare organizationId: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Organization)
  declare organization: BelongsTo<typeof Organization>

  @hasMany(() => VersionStaffing)
  declare versionStaffings: HasMany<typeof VersionStaffing>
}
