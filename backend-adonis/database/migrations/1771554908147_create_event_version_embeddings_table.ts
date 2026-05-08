import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'event_version_embeddings'

  async up() {
    // Habilitar pgvector en postgres
    await this.db.rawQuery('CREATE EXTENSION IF NOT EXISTS vector')

    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      
      // OpenRouter usando un modelo de OpenAI por defecto (1536 dimensiones)
      table.specificType('embedding', 'vector(1536)').notNullable()
      table.text('content_chunk').notNullable()

      table.integer('event_id').references('events.id').notNullable()
      table.integer('version_content_id').references('version_contents.id').notNullable()

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
    // Opcional: await this.db.rawQuery('DROP EXTENSION IF EXISTS vector')
  }
}
