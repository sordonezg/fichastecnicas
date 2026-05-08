import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Department from '#models/department'
import Organization from '#models/organization'

export default class extends BaseSeeder {
  async run() {
    const fime = await Organization.findBy('slug', 'fime')
    
    if (fime) {
      await Department.createMany([
        {
          name: 'Direccion',
          priority: 1,
          organization_id: fime.id,
        },
        {
          name: 'Subdireccion',
          priority: 2,
          organization_id: fime.id,
        },
        {
          name: 'Academia',
          priority: 3,
          organization_id: fime.id,
        },
        {
          name: 'SAFIME',
          priority: 4,
          organization_id: fime.id,
        },
      ])
    }
  }
}