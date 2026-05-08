import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.string('email', 254).notNullable().unique()
      table.string('phone', 20).unique()
      table.string('name').notNullable()
      table.string('password').notNullable()
      table.boolean('is_internal').notNullable()

      table.integer('role_id').references('roles.id').notNullable()
      table.integer('organization_id').references('organizations.id').notNullable()
      table.integer('department_id').references('departments.id')

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
