import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'version_activities'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('name').notNullable()
      table.text('description')
      table.dateTime('starts_at').notNullable()
      table.dateTime('ends_at').notNullable()

      table.integer('responsible_id').references('users.id').notNullable()
      table.integer('location_id').references('locations.id').notNullable()

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
