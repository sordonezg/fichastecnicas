import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'

export default class extends BaseSeeder {
  async run() {
    await User.createMany([
      {
        name: 'Sergio',
        email: 'sergio@mail.com',
        phone: '123456789',
        password: 'password',
        isInternal: true,
        roleId: 1,
        organizationId: 1,
        departmentId: 1,
      },
      {
        name: 'Valeria',
        email: 'valeria@mail.com',
        phone: '123456790',
        password: 'password',
        isInternal: true,
        roleId: 2,
        organizationId: 1,
        departmentId: 1,
      },
      {
        name: 'Juan',
        email: 'juan@mail.com',
        phone: '123456791',
        password: 'password',
        isInternal: true,
        roleId: 3,
        organizationId: 1,
        departmentId: 1,
      },
      {
        name: 'Ana',
        email: 'ana@mail.com',
        phone: '123456792',
        password: 'password',
        isInternal: false,
        roleId: 4,
        organizationId: 1,
        departmentId: 1,
      }
    ])

  }
}