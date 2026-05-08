import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'event_versions'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.boolean('is_current_version').notNullable()

      table.integer('event_id').references('events.id').notNullable()
      table.integer('version_content_id').references('version_contents.id').notNullable()

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
