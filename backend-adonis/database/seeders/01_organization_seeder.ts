import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Organization from '#models/organization'

export default class extends BaseSeeder {
  async run() {
    await Organization.createMany([
      {
        name: 'FIME',
        slug: 'fime',
        color: '#009933',
        logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT2Wx1ryU8GX6Gs7ZnyC-o38SDH9xGyqxK7Dg&s',
      },
      {
        name: 'FCFM',
        slug: 'fcfm',
        color: '#003366',
        logo: 'https://www.fcfm.uanl.mx/assets/img/logo-fcfm.png',
      },
    ])
  }
}