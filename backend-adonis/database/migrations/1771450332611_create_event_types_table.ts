import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'event_types'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.string('name').notNullable()
      table.string('description').notNullable()

      table.integer('organization_id').references('organizations.id').notNullable()

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
