import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, manyToMany } from '@adonisjs/lucid/orm'
import User from './user.js'
import type { BelongsTo, ManyToMany } from '@adonisjs/lucid/types/relations'
import Location from './location.js'
import EventVersion from './event_version.js'

export default class VersionActivity extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare description: string | null

  @column()
  declare startsAt: DateTime

  @column()
  declare endsAt: DateTime

  @column()
  declare responsibleId: number

  @column()
  declare locationId: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => Location)
  declare location: BelongsTo<typeof Location>

  @manyToMany(() => EventVersion)
  declare eventVersions: ManyToMany<typeof EventVersion>
}
