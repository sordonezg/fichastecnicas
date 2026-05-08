import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'location_assignment_rules'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.boolean('is_allowed').notNullable()
      table.boolean('requires_approval').notNullable()
      table.integer('max_capacity_override')

      table.integer('organization_id').references('organizations.id').notNullable()
      table.integer('event_type_id').references('event_types.id').notNullable()
      table.integer('location_type_id').references('location_types.id').notNullable()

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
