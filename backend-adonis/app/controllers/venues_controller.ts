import type { HttpContext } from '@adonisjs/core/http'
import Location from '#models/location'

export default class VenuesController {
  async index({ response }: HttpContext) {
    const locations = await Location.all()
    return response.json(locations.map(l => ({
      id: l.id,
      nombre: l.name,
      capacidad: l.capacity,
      activo: true
    })))
  }

  async store({ request, response }: HttpContext) {
    const data = request.all()
    const location = new Location()
    location.name = data.nombre
    location.capacity = data.capacidad
    location.locationTypeId = 1 // default
    location.organizationId = 1 // default
    await location.save()

    return response.created({
      id: location.id,
      nombre: location.name,
      capacidad: location.capacity,
      activo: true
    })
  }

  async update({ params, request, response }: HttpContext) {
    const location = await Location.findOrFail(params.id)
    const data = request.all()

    if (data.nombre !== undefined) location.name = data.nombre
    if (data.capacidad !== undefined) location.capacity = data.capacidad
    await location.save()

    return response.json({
      id: location.id,
      nombre: location.name,
      capacidad: location.capacity,
      activo: true
    })
  }

  async destroy({ params, response }: HttpContext) {
    const location = await Location.findOrFail(params.id)
    await location.delete()
    return response.json({ message: 'Venue deleted successfully' })
  }
}
