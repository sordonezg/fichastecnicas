import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import User from './user.js'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

export default class VersionFeedback extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare fieldName: string | null

  @column()
  declare comment: string

  @column()
  declare status: 'pending' | 'resolved'

  @column()
  declare eventVersionId: number

  @column()
  declare reviewerId: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User)
  declare reviewer: BelongsTo<typeof User>
}
