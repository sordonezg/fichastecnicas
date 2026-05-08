import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'events'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table
        .enum('current_state', [
          'draft',
          'in_review',
          'scheduled',
          'rejected',
          'cancelled',
          'historical',
        ])
        .notNullable()

      table.integer('organization_id').references('organizations.id').notNullable()
      table.integer('user_id').references('users.id').notNullable()
      table.integer('main_responsible').references('users.id').notNullable()
      table.integer('event_type_id').references('event_types.id').notNullable()

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
