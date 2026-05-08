import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { BaseModel, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import Organization from './organization.js'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Role from './role.js'
import Event from './event.js'
import LocationAccountRule from './location_account_rule.js'
import VersionActivity from './version_activity.js'
import VersionFeedback from './version_feedback.js'
import VersionStaffing from './version_staffing.js'

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['email'],
  passwordColumnName: 'password',
})

export default class User extends compose(BaseModel, AuthFinder) {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare email: string

  @column()
  declare phone: string | null

  @column()
  declare name: string

  @column({ serializeAs: null })
  declare password: string

  @column()
  declare isInternal: boolean

  @column()
  declare roleId: number

  @column()
  declare organizationId: number

  @column()
  declare departmentId: number | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => Role)
  declare role: BelongsTo<typeof Role>

  @belongsTo(() => Organization)
  declare organization: BelongsTo<typeof Organization>

  @hasMany(() => LocationAccountRule)
  declare locationAccountRules: HasMany<typeof LocationAccountRule>

  @hasMany(() => Event)
  declare events: HasMany<typeof Event>

  @hasMany(() => VersionActivity)
  declare versionActivities: HasMany<typeof VersionActivity>

  @hasMany(() => VersionStaffing)
  declare versionStaffings: HasMany<typeof VersionStaffing>

  @hasMany(() => VersionFeedback)
  declare versionFeedbacks: HasMany<typeof VersionFeedback>
}
