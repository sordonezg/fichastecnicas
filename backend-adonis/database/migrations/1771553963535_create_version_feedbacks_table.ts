import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'version_feedbacks'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('field_name')
      table.text('comment').notNullable()
      table.enum('status', ['pending', 'resolved']).notNullable()

      table.integer('event_version_id').references('event_versions.id').notNullable()
      table.integer('reviewer_id').references('users.id').notNullable()

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
