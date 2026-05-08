import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import VersionContent from './version_content.js'
import Event from './event.js'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

export default class EventVersionEmbedding extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare embedding: string

  @column()
  declare contentChunk: string

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
}
