import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'version_contents'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('version_number').notNullable()
      table.string('name').notNullable()
      table.text('objective')
      table.text('description')
      table.dateTime('starts_at').notNullable()
      table.dateTime('ends_at').notNullable()
      table.string('dress_code')
      table.string('program_impacted')
      table.text('guest_specifications')
      table.text('presidium_details')
      table.text('director_action')

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
