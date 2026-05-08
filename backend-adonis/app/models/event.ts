import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import Organization from './organization.js'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import EventType from './event_type.js'
import EventVersion from './event_version.js'
import EventVersionEmbedding from './event_version_embedding.js'

export default class Event extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare currentState:
    | 'draft'
    | 'in_review'
    | 'scheduled'
    | 'rejected'
    | 'cancelled'
    | 'historical'

  @column()
  declare organizationId: number

  @column()
  declare userId: number

  @column()
  declare mainResponsibleId: number

  @column()
  declare eventTypeId: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Organization)
  declare organization: BelongsTo<typeof Organization>

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => User)
  declare mainResponsible: BelongsTo<typeof User>

  @belongsTo(() => EventType)
  declare eventType: BelongsTo<typeof EventType>

  @hasMany(() => EventVersion)
  declare eventVersions: HasMany<typeof EventVersion>

  @hasMany(() => EventVersionEmbedding)
  declare eventVersionEmbeddings: HasMany<typeof EventVersionEmbedding>
}
