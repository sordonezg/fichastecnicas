import type { HttpContext } from '@adonisjs/core/http'
import Event from '#models/event'
import EventVersion from '#models/event_version'
import VersionContent from '#models/version_content'

import { RagService } from '#services/rag_service'

export default class EventsController {
  private ragService = new RagService()
  private async checkOverlaps(startsAt: string, endsAt: string, locationId: number, currentEventId: number | null = null) {
    const allEvents = await Event.query()
      .where('locationId', locationId)
      .preload('eventVersions', (query) => query.where('isCurrentVersion', true).preload('versionContent'))
      .preload('user')

    return allEvents.filter(e => {
      if (currentEventId && e.id === currentEventId) return false
      if (e.currentState === 'rejected' || e.currentState === 'cancelled') return false
      
      const content = e.eventVersions[0]?.versionContent
      if (!content || !content.startsAt || !content.endsAt) return false
      
      const eStart = new Date(content.startsAt.toString()).getTime()
      const eEnd = new Date(content.endsAt.toString()).getTime()
      const nStart = new Date(startsAt).getTime()
      const nEnd = new Date(endsAt).getTime()

      return (nStart < eEnd) && (nEnd > eStart)
    })
  }

  async index({ response }: HttpContext) {
    const events = await Event.query()
      .preload('eventVersions', (query) => {
        query.where('isCurrentVersion', true).preload('versionContent')
      })
      .preload('organization')
      .preload('user')
      
    const mapped = events.map(e => {
      const currentVersion = e.eventVersions[0];
      const content = currentVersion?.versionContent;
      return {
        id: e.id,
        titulo: content?.name || 'Sin título',
        descripcion: content?.description || '',
        asistentes: content?.guestSpecifications || '',
        fecha_inicio: content?.startsAt || e.createdAt,
        fecha_fin: content?.endsAt || e.createdAt,
        venue_id: e.locationId || 1, 
        locationId: e.locationId,
        organizationId: e.organizationId,
        eventTypeId: e.eventTypeId,
        user_id: e.userId,
        user: { nombre: e.user?.name },
        estado: e.currentState === 'in_review' ? 'pendiente' : (e.currentState === 'scheduled' ? 'aceptado' : (e.currentState === 'rejected' ? 'rechazado' : 'pendiente')),
        name: content?.name,
        objective: content?.objective,
        description: content?.description,
        startsAt: content?.startsAt,
        endsAt: content?.endsAt,
        dressCode: content?.dressCode,
        programImpacted: content?.programImpacted,
        guestSpecifications: content?.guestSpecifications,
        presidiumDetail: content?.presidiumDetail,
        directorAction: content?.directorAction,
        currentState: e.currentState
      }
    });

    return response.json(mapped)
  }

  async store({ request, response, auth }: HttpContext) {
    const data = request.all()
    const userEmail = auth.user?.email || ''
    
    const locationId = data.locationId || 1
    const startsAt = data.startsAt
    const endsAt = data.endsAt

    if (startsAt && endsAt) {
      const overlaps = await this.checkOverlaps(startsAt, endsAt, locationId)
      if (overlaps.length > 0) {
        if (userEmail === 'direccion@fichas.com') {
          for (const conflict of overlaps) {
            conflict.currentState = 'rejected'
            await conflict.save()
          }
        } else {
          return response.status(409).json({ message: 'El recinto ya se encuentra reservado en esas fechas.' })
        }
      }
    }

    const event = new Event()
    event.currentState = 'in_review'
    event.organizationId = data.organizationId || 1 
    event.userId = auth.user?.id || 1 
    event.mainResponsibleId = data.mainResponsibleId || auth.user?.id || 1
    event.eventTypeId = data.eventTypeId || 1
    event.locationId = locationId
    await event.save()

    const content = new VersionContent()
    content.versionNumber = 1
    content.name = data.name
    content.objective = data.objective
    content.description = data.description
    content.startsAt = startsAt
    content.endsAt = endsAt
    content.dressCode = data.dressCode
    content.programImpacted = data.programImpacted
    content.guestSpecifications = data.guestSpecifications
    content.presidiumDetail = data.presidiumDetail
    content.directorAction = data.directorAction
    await content.save()

    const version = new EventVersion()
    version.isCurrentVersion = true
    version.eventId = event.id
    version.versionContentId = content.id
    await version.save()

    // 4. Vectorizar para IA
    try {
      const fullContent = `
        Ficha Técnica: ${content.name}
        Objetivo: ${content.objective}
        Descripción: ${content.description}
        Dress Code: ${content.dressCode}
        Programa: ${content.programImpacted}
        Invitados: ${content.guestSpecifications}
        Presidium: ${content.presidiumDetail}
        Director: ${content.directorAction}
      `.trim()
      await this.ragService.vectorizeFichaTecnica(event.id, content.id, fullContent)
    } catch (e) {
      console.error('Error vectorizando ficha:', e)
    }

    return response.created({ message: 'Ficha técnica creada', event })
  }

  async update({ params, request, response, auth }: HttpContext) {
    const data = request.all()
    const event = await Event.findOrFail(params.id)
    const userEmail = auth.user?.email || ''
    
    const oldVersion = await EventVersion.query().where('eventId', event.id).where('isCurrentVersion', true).first()
    const oldContent = oldVersion ? await VersionContent.find(oldVersion.versionContentId) : null

    const startsAt = data.startsAt || oldContent?.startsAt
    const endsAt = data.endsAt || oldContent?.endsAt
    const locationId = data.locationId || event.locationId || 1

    if (startsAt && endsAt) {
      const overlaps = await this.checkOverlaps(startsAt.toString(), endsAt.toString(), locationId, event.id)
      if (overlaps.length > 0) {
        if (userEmail === 'direccion@fichas.com') {
          for (const conflict of overlaps) {
            conflict.currentState = 'rejected'
            await conflict.save()
          }
        } else {
          return response.status(409).json({ message: 'El recinto ya se encuentra reservado en esas fechas.' })
        }
      }
    }
    
    if (oldVersion) {
      oldVersion.isCurrentVersion = false
      await oldVersion.save()
    }
    
    const content = new VersionContent()
    content.versionNumber = (oldContent?.versionNumber || 0) + 1
    content.name = data.name || oldContent?.name
    content.objective = data.objective || oldContent?.objective
    content.description = data.description || oldContent?.description
    content.startsAt = startsAt
    content.endsAt = endsAt
    content.dressCode = data.dressCode || oldContent?.dressCode
    content.programImpacted = data.programImpacted || oldContent?.programImpacted
    content.guestSpecifications = data.guestSpecifications || oldContent?.guestSpecifications
    content.presidiumDetail = data.presidiumDetail || oldContent?.presidiumDetail
    content.directorAction = data.directorAction || oldContent?.directorAction
    await content.save()

    const version = new EventVersion()
    version.isCurrentVersion = true
    version.eventId = event.id
    version.versionContentId = content.id
    await version.save()

    if (data.locationId) event.locationId = data.locationId
    if (data.organizationId) event.organizationId = data.organizationId
    if (data.eventTypeId) event.eventTypeId = data.eventTypeId
    event.currentState = 'in_review' 
    await event.save()

    // 4. Vectorizar para IA
    try {
      const fullContent = `
        Ficha Técnica: ${content.name}
        Objetivo: ${content.objective}
        Descripción: ${content.description}
        Dress Code: ${content.dressCode}
        Programa: ${content.programImpacted}
        Invitados: ${content.guestSpecifications}
        Presidium: ${content.presidiumDetail}
        Director: ${content.directorAction}
      `.trim()
      await this.ragService.vectorizeFichaTecnica(event.id, content.id, fullContent)
    } catch (e) {
      console.error('Error vectorizando ficha:', e)
    }

    return response.ok({ message: 'Ficha técnica actualizada', event })
  }

  async destroy({ params, response }: HttpContext) {
    const event = await Event.findOrFail(params.id)
    event.currentState = 'cancelled'
    await event.save()
    return response.ok({ message: 'Evento cancelado' })
  }

  async updateStatus({ params, request, response }: HttpContext) {
    const event = await Event.findOrFail(params.id)
    const { estado } = request.all()
    
    const statusMap: Record<string, string> = {
      'aceptado': 'scheduled',
      'rechazado': 'rejected',
      'pendiente': 'in_review'
    }

    event.currentState = (statusMap[estado] || 'in_review') as 'draft' | 'in_review' | 'scheduled' | 'rejected' | 'cancelled' | 'historical'
    await event.save()

    return response.ok({ message: 'Estado actualizado', event })
  }
}

