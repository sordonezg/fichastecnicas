import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import Event from '#models/event'
import EventVersion from '#models/event_version'
import VersionContent from '#models/version_content'
import VersionActivity from '#models/version_activity'
import { createEventValidator, updateEventValidator } from '#validators/event'
import db from '@adonisjs/lucid/services/db'

import { RagService } from '#services/rag_service'

export default class EventsController {
  private ragService = new RagService()

  private async checkOverlaps(startsAt: DateTime, endsAt: DateTime, locationId: number, currentEventId: number | null = null) {
    if (!startsAt.isValid || !endsAt.isValid) return []

    const allEvents = await Event.query()
      .where('locationId', locationId)
      .whereIn('currentState', ['scheduled', 'in_review'])
      .if(currentEventId, (query) => query.whereNot('id', currentEventId as number))
      .preload('eventVersions', (v) => v.where('isCurrentVersion', true).preload('versionContent'))

    return allEvents.filter(e => {
      const ver = e.eventVersions[0]
      if (!ver || !ver.versionContent) return false
      
      const eventStart = ver.versionContent.startsAt
      const eventEnd = ver.versionContent.endsAt

      return (startsAt < eventEnd && endsAt > eventStart)
    })
  }

  async index({ request, response }: HttpContext) {
    const page = request.input('page', 1)
    const limit = 20

    const events = await Event.query()
      .preload('eventVersions', (query) => {
        query.where('isCurrentVersion', true)
          .preload('versionContent')
          .preload('versionActivities')
      })
      .preload('organization')
      .preload('user')
      .orderBy('createdAt', 'desc')
      .paginate(page, limit)

    const mapped = events.toJSON().data.map((e: any) => {
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
        dressCode: content?.dressCode,
        programImpacted: content?.programImpacted,
        guestSpecifications: content?.guestSpecifications,
        presidiumDetail: content?.presidiumDetail,
        directorAction: content?.directorAction,
        currentState: e.currentState,
        activities: currentVersion?.versionActivities?.map((a: any) => ({
          id: a.id,
          name: a.name,
          startsAt: a.startsAt ? DateTime.fromISO(a.startsAt).toFormat('HH:mm') : '',
          endsAt: a.endsAt ? DateTime.fromISO(a.endsAt).toFormat('HH:mm') : '',
          description: a.description
        })) || []
      }
    });

    return response.ok({
      data: mapped,
      meta: events.getMeta()
    })
  }

  async store({ request, response, auth }: HttpContext) {
    const data = await request.validateUsing(createEventValidator)
    const userEmail = auth.user?.email || ''
    
    const locationId = data.locationId
    const startsAt = DateTime.fromISO(data.startsAt)
    const endsAt = DateTime.fromISO(data.endsAt)

    if (!startsAt.isValid || !endsAt.isValid) {
        return response.badRequest({ message: 'Fechas inválidas' })
    }

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

    const transaction = await db.transaction()

    try {
        const event = new Event()
        event.currentState = 'in_review'
        event.organizationId = data.organizationId || 1 
        event.userId = auth.user!.id
        event.mainResponsibleId = auth.user!.id
        event.eventTypeId = data.eventTypeId || 1
        event.locationId = locationId
        event.useTransaction(transaction)
        await event.save()

        const content = new VersionContent()
        content.versionNumber = 1
        content.name = data.name
        content.objective = data.objective || null
        content.description = data.description || null
        content.startsAt = startsAt
        content.endsAt = endsAt
        content.dressCode = data.dressCode || null
        content.programImpacted = data.programImpacted || null
        content.guestSpecifications = data.guestSpecifications || null
        content.presidiumDetail = data.presidiumDetail || null
        content.directorAction = data.directorAction || null
        content.useTransaction(transaction)
        await content.save()

        const version = new EventVersion()
        version.isCurrentVersion = true
        version.eventId = event.id
        version.versionContentId = content.id
        version.useTransaction(transaction)
        await version.save()

        if (data.activities && Array.isArray(data.activities)) {
          for (const act of data.activities) {
            const activity = new VersionActivity()
            activity.fill({
                name: act.name,
                description: act.description || null,
                startsAt: DateTime.fromISO(act.startsAt),
                endsAt: DateTime.fromISO(act.endsAt),
                responsibleId: auth.user!.id,
                locationId: event.locationId || 1
            })
            activity.useTransaction(transaction)
            await activity.save()
            await version.related('versionActivities').attach([activity.id], transaction)
          }
        }

        await transaction.commit()

        // Vectorizar para IA
        try {
          const activitiesText = data.activities?.map((a: any) => `- ${a.name}: ${a.startsAt}`).join('\n') || ''
          const fullContent = `
            Ficha Técnica: ${content.name}
            Objetivo: ${content.objective}
            Descripción: ${content.description}
            Dress Code: ${content.dressCode}
            Agenda:\n${activitiesText}
          `.trim()
          await this.ragService.vectorizeFichaTecnica(event.id, content.id, fullContent)
        } catch (e) {
          console.error('Error vectorizando ficha:', e)
        }

        return response.created({ message: 'Ficha técnica creada', event })
    } catch (error) {
        await transaction.rollback()
        console.error(error)
        return response.internalServerError({ message: 'Error al crear el evento' })
    }
  }

  async update({ params, request, response, auth }: HttpContext) {
    const data = await request.validateUsing(updateEventValidator)
    const event = await Event.findOrFail(params.id)
    
    // Authorization Check
    if (auth.user?.role?.name !== 'admin' && event.userId !== auth.user?.id) {
        return response.forbidden({ message: 'No tienes permiso para editar este evento' })
    }

    const userEmail = auth.user?.email || ''
    
    const oldVersion = await EventVersion.query().where('eventId', event.id).where('isCurrentVersion', true).first()
    const oldContent = oldVersion ? await VersionContent.find(oldVersion.versionContentId) : null

    const startsAtStr = data.startsAt || oldContent?.startsAt?.toISO()
    const endsAtStr = data.endsAt || oldContent?.endsAt?.toISO()
    const startsAt = startsAtStr ? DateTime.fromISO(startsAtStr) : null
    const endsAt = endsAtStr ? DateTime.fromISO(endsAtStr) : null
    const locationId = (data.locationId !== undefined ? data.locationId : event.locationId) || 1

    if (startsAt?.isValid && endsAt?.isValid) {
      const overlaps = await this.checkOverlaps(startsAt, endsAt, locationId, event.id)
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
    
    const transaction = await db.transaction()

    try {
        if (oldVersion) {
          oldVersion.isCurrentVersion = false
          oldVersion.useTransaction(transaction)
          await oldVersion.save()
        }
        
        const content = new VersionContent()
        content.versionNumber = (oldContent?.versionNumber || 0) + 1
        content.name = data.name || oldContent?.name || ''
        content.objective = data.objective !== undefined ? data.objective : oldContent?.objective || null
        content.description = data.description !== undefined ? data.description : oldContent?.description || null
        content.startsAt = startsAt || oldContent!.startsAt
        content.endsAt = endsAt || oldContent!.endsAt
        content.dressCode = data.dressCode !== undefined ? data.dressCode : oldContent?.dressCode || null
        content.programImpacted = data.programImpacted !== undefined ? data.programImpacted : oldContent?.programImpacted || null
        content.guestSpecifications = data.guestSpecifications !== undefined ? data.guestSpecifications : oldContent?.guestSpecifications || null
        content.presidiumDetail = data.presidiumDetail !== undefined ? data.presidiumDetail : oldContent?.presidiumDetail || null
        content.directorAction = data.directorAction !== undefined ? data.directorAction : oldContent?.directorAction || null
        content.useTransaction(transaction)
        await content.save()

        const version = new EventVersion()
        version.isCurrentVersion = true
        version.eventId = event.id
        version.versionContentId = content.id
        version.useTransaction(transaction)
        await version.save()

        if (data.activities && Array.isArray(data.activities)) {
          for (const act of data.activities) {
            const activity = new VersionActivity()
            activity.fill({
                name: act.name,
                description: act.description || null,
                startsAt: DateTime.fromISO(act.startsAt),
                endsAt: DateTime.fromISO(act.endsAt),
                responsibleId: auth.user!.id,
                locationId: event.locationId || 1
            })
            activity.useTransaction(transaction)
            await activity.save()
            await version.related('versionActivities').attach([activity.id], transaction)
          }
        }

        if (data.locationId) event.locationId = data.locationId
        if (data.organizationId) event.organizationId = data.organizationId
        if (data.eventTypeId) event.eventTypeId = data.eventTypeId
        event.currentState = 'in_review' 
        event.useTransaction(transaction)
        await event.save()

        await transaction.commit()

        return response.ok({ message: 'Ficha técnica actualizada', event })
    } catch (error) {
        await transaction.rollback()
        console.error(error)
        return response.internalServerError({ message: 'Error al actualizar el evento' })
    }
  }

  async updateStatus({ params, request, response, auth }: HttpContext) {
    const { estado } = request.only(['estado'])
    const event = await Event.findOrFail(params.id)

    if (auth.user?.role?.name !== 'admin' && auth.user?.role?.name !== 'auxiliar') {
        return response.forbidden({ message: 'No tienes permiso para cambiar el estado de este evento' })
    }

    const statusMap: Record<string, string> = {
      'aceptado': 'scheduled',
      'rechazado': 'rejected',
      'pendiente': 'in_review'
    }

    const newStatus = statusMap[estado] || 'in_review'
    event.currentState = newStatus as any
    await event.save()

    return response.ok({ message: 'Estado actualizado', event })
  }

  async destroy({ params, response, auth }: HttpContext) {
    const event = await Event.findOrFail(params.id)

    if (auth.user?.role?.name !== 'admin' && event.userId !== auth.user?.id) {
        return response.forbidden({ message: 'No tienes permiso para cancelar este evento' })
    }

    event.currentState = 'cancelled'
    await event.save()
    return response.ok({ message: 'Evento cancelado' })
  }
}
