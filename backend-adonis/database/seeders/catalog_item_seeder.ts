import { BaseSeeder } from '@adonisjs/lucid/seeders'
import CatalogItem from '#models/catalog_item'

export default class extends BaseSeeder {
  async run() {
    await CatalogItem.createMany([
      { category: 'audio', name: 'Micrófono de mano' },
      { category: 'audio', name: 'Sistema de sonido lineal' },
      { category: 'iluminacion', name: 'Cabezas móviles' },
      { category: 'iluminacion', name: 'Reflectores LED' },
      { category: 'catering', name: 'Coffee break básico' },
      { category: 'mobiliario', name: 'Sillas ejecutivas' },
      { category: 'documentacion', name: 'Gafetes impresos' },
    ])
  }
}