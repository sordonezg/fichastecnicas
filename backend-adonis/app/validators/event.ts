import vine from '@vinejs/vine'

export const createEventValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(3),
    objective: vine.string().trim().optional(),
    description: vine.string().trim().optional(),
    startsAt: vine.string(), // We'll parse it as DateTime in controller
    endsAt: vine.string(),
    locationId: vine.number(),
    organizationId: vine.number().optional(),
    eventTypeId: vine.number().optional(),
    dressCode: vine.string().optional(),
    programImpacted: vine.string().optional(),
    guestSpecifications: vine.string().optional(),
    presidiumDetail: vine.string().optional(),
    directorAction: vine.string().optional(),
    activities: vine.array(
      vine.object({
        name: vine.string().trim(),
        startsAt: vine.string(),
        endsAt: vine.string(),
        description: vine.string().optional()
      })
    ).optional()
  })
)

export const updateEventValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(3).optional(),
    objective: vine.string().trim().optional(),
    description: vine.string().trim().optional(),
    startsAt: vine.string().optional(),
    endsAt: vine.string().optional(),
    locationId: vine.number().optional(),
    organizationId: vine.number().optional(),
    eventTypeId: vine.number().optional(),
    dressCode: vine.string().optional(),
    programImpacted: vine.string().optional(),
    guestSpecifications: vine.string().optional(),
    presidiumDetail: vine.string().optional(),
    directorAction: vine.string().optional(),
    activities: vine.array(
      vine.object({
        name: vine.string().trim(),
        startsAt: vine.string(),
        endsAt: vine.string(),
        description: vine.string().optional()
      })
    ).optional()
  })
)