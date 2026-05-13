import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, hasMany, manyToMany } from '@adonisjs/lucid/orm'
import Event from './event.js'
import type { BelongsTo, HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'
import VersionContent from './version_content.js'
import VersionActivity from './version_activity.js'
import VersionStaffing from './version_staffing.js'

export default class EventVersion extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare isCurrentVersion: boolean

  @column()
  declare eventId: number

  @column()
  declare versionContentId: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Event)
  declare event: BelongsTo<typeof Event>

  @belongsTo(() => VersionContent)
  declare versionContent: BelongsTo<typeof VersionContent>

  @manyToMany(() => VersionActivity, {
    pivotTable: 'event_versions_to_version_activities',
  })
  declare versionActivities: ManyToMany<typeof VersionActivity>

  @hasMany(() => VersionStaffing)
  declare versionStaffings: HasMany<typeof VersionStaffing>
}
