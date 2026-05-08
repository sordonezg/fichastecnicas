import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Role from '#models/role'

export default class extends BaseSeeder {
  async run() {
    await Role.createMany([
      {
        name: 'admin',
        description: 'admin',
      },
      {
        name: 'auxiliar',
        description: 'auxiliar',
      },
      {
        name: 'staff_interno',
        description: 'staff_interno',
      },
      {
        name: 'staff_externo',
        description: 'staff_externo',
      },
    ])
  }
}