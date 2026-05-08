import { DateTime } from 'luxon'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import EventVersion from './event_version.js'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import EventVersionEmbedding from './event_version_embedding.js'

export default class VersionContent extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare versionNumber: number

  @column()
  declare name: string

  @column()
  declare objective: string | null

  @column()
  declare description: string | null

  @column()
  declare startsAt: DateTime

  @column()
  declare endsAt: DateTime

  @column()
  declare dressCode: string | null

  @column()
  declare programImpacted: string | null

  @column()
  declare guestSpecifications: string | null

  @column()
  declare presidiumDetail: string | null

  @column()
  declare directorAction: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @hasMany(() => EventVersion)
  declare eventVersions: HasMany<typeof EventVersion>

  @hasMany(() => EventVersionEmbedding)
  declare eventVersionEmbeddings: HasMany<typeof EventVersionEmbedding>
}
