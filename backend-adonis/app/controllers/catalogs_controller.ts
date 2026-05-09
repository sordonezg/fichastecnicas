import type { HttpContext } from '@adonisjs/core/http'
import Organization from '#models/organization'
import EventType from '#models/event_type'
import CatalogItem from '#models/catalog_item'

export default class CatalogsController {
    async index({ response }: HttpContext) {
        const items = await CatalogItem.query().where('isActive', true)
        
        // If the request expects the legacy flat list (for CatalogAdmin)
        // we can detect it or just return a combined object.
        // The frontend CatalogAdmin expects a flat array of {id, categoria, nombre}
        const mappedItems = items.map(i => ({
            id: i.id,
            categoria: i.category,
            nombre: i.name
        }))

        return response.json(mappedItems)
    }

    async getOrganizations({ response }: HttpContext) {
        const organizations = await Organization.all()
        return response.json(organizations)
    }

    async getEventTypes({ response }: HttpContext) {
        const eventTypes = await EventType.all()
        return response.json(eventTypes)
    }

    async store({ request, response }: HttpContext) {
        const data = request.all()
        const item = new CatalogItem()
        item.category = data.categoria
        item.name = data.nombre
        item.isActive = true
        await item.save()

        return response.created({
            id: item.id,
            categoria: item.category,
            nombre: item.name
        })
    }

    async destroy({ params, response }: HttpContext) {
        const item = await CatalogItem.findOrFail(params.id)
        item.isActive = false // Soft delete
        await item.save()
        return response.ok({ message: 'Item deleted' })
    }
}