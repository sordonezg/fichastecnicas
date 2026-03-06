const db = require('../utils/db-sqlite');

const checkOverlaps = async (fechaInicio, fechaFin, venueId, currentEventId = null) => {
    // Basic overlap check: new.start < existing.end AND new.end > existing.start
    // In UTC ISO strings, string comparison works for chronologic order if length is same
    const allEvents = await db.events.findAll();
    return allEvents.filter(e => {
        if (currentEventId && String(e.id) === String(currentEventId)) return false;
        if (String(e.venue_id) !== String(venueId)) return false;
        if (e.estado === 'rechazado' || e.estado === 'cancelado') return false;

        return (fechaInicio < e.fecha_fin) && (fechaFin > e.fecha_inicio);
    });
};

const createEvent = async (req, res) => {
    const { titulo, descripcion, asistentes, fecha_inicio, fecha_fin, requisitos_tecnicos, venue_id } = req.body;
    const userId = req.user.id;
    const userEmail = req.user.email; // Extracted from auth middleware

    try {
        const isoInicio = new Date(fecha_inicio).toISOString();
        const isoFin = new Date(fecha_fin).toISOString();

        // 1. Check for overlapping events in the same venue
        const overlappingEvents = await checkOverlaps(isoInicio, isoFin, venue_id);

        // 2. Priority Logic
        if (overlappingEvents.length > 0) {
            if (userEmail === 'direccion@fichas.com') {
                // Direccion has priority: Reject all overlapping events
                for (const conflict of overlappingEvents) {
                    await db.events.update({
                        where: { id: conflict.id },
                        data: { estado: 'rechazado' }
                    });
                }
            } else {
                // Normal user: check if Direccion has booked it OR if it's already booked
                const direcctionConflict = overlappingEvents.find(e => {
                    // We need to fetch the user to know if it's Direccion.
                    // This is slightly inefficient without joining, but works for local.
                    return true; // We reject ANY overlap for normal users just like a standard booking system
                });

                // For a more robust check we could fetch users, but since any overlap is a block for normal users:
                return res.status(409).json({
                    message: 'El recinto ya se encuentra reservado en esas fechas.'
                });
            }
        }

        const event = await db.events.create({
            data: {
                id: String(Date.now()),
                titulo,
                descripcion,
                asistentes,
                fecha_inicio: isoInicio,
                fecha_fin: isoFin,
                requisitos_tecnicos,
                user_id: String(userId),
                venue_id: venue_id || 1, // Fallback if not provided
            },
        });
        res.status(201).json(event);
    } catch (error) {
        res.status(500).json({ message: 'Error creating event', error: error.message });
    }
};

const getEvents = async (req, res) => {
    const { nivel_permiso, id: userId } = req.user;

    try {
        let events;
        if (nivel_permiso === 1) {
            events = await db.events.findMany();
        } else {
            events = await db.events.findMany({
                where: {
                    OR: [
                        { user_id: String(userId) },
                        { estado: 'aceptado' }
                    ]
                }
            });
        }
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching events', error: error.message });
    }
};

const updateEventStatus = async (req, res) => {
    const { id } = req.params;
    const { estado } = req.body;

    try {
        const event = await db.events.update({
            where: { id: String(id) },
            data: { estado },
        });
        res.json(event);
    } catch (error) {
        res.status(500).json({ message: 'Error updating event status', error: error.message });
    }
};

const updateEvent = async (req, res) => {
    const { id } = req.params;
    const { titulo, descripcion, asistentes, fecha_inicio, fecha_fin, requisitos_tecnicos, venue_id } = req.body;
    const userId = req.user.id;
    const userNivel = req.user.nivel_permiso;
    const userEmail = req.user.email;

    try {
        const event = await db.events.findUnique({ where: { id: String(id) } });
        if (!event) return res.status(404).json({ message: 'Event not found' });

        if (String(event.user_id) !== String(userId) && userNivel !== 1) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const isoInicio = fecha_inicio ? new Date(fecha_inicio).toISOString() : event.fecha_inicio;
        const isoFin = fecha_fin ? new Date(fecha_fin).toISOString() : event.fecha_fin;
        const currentVenueId = venue_id || event.venue_id;

        // 1. Check for overlapping events in the same venue, excluding this event itself
        const overlappingEvents = await checkOverlaps(isoInicio, isoFin, currentVenueId, event.id);

        // 2. Priority Logic
        if (overlappingEvents.length > 0) {
            if (userEmail === 'direccion@fichas.com') {
                for (const conflict of overlappingEvents) {
                    await db.events.update({
                        where: { id: conflict.id },
                        data: { estado: 'rechazado' }
                    });
                }
            } else {
                return res.status(409).json({
                    message: 'El recinto ya se encuentra reservado en esas fechas.'
                });
            }
        }

        const updatedEvent = await db.events.update({
            where: { id: String(id) },
            data: {
                titulo: titulo || event.titulo,
                descripcion: descripcion || event.descripcion,
                asistentes: asistentes || event.asistentes,
                fecha_inicio: isoInicio,
                fecha_fin: isoFin,
                requisitos_tecnicos: requisitos_tecnicos || event.requisitos_tecnicos,
                venue_id: currentVenueId,
                estado: req.body.estado || event.estado // Allow resetting status
            },
        });
        res.json(updatedEvent);
    } catch (error) {
        res.status(500).json({ message: 'Error updating event', error: error.message });
    }
};

const deleteEvent = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    const userNivel = req.user.nivel_permiso;

    try {
        const event = await db.events.findUnique({ where: { id: String(id) } });
        if (!event) return res.status(404).json({ message: 'Event not found' });

        if (String(event.user_id) !== String(userId) && userNivel !== 1) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await db.events.delete({ where: { id: String(id) } });
        res.json({ message: 'Event deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting event', error: error.message });
    }
};

module.exports = { createEvent, getEvents, updateEventStatus, updateEvent, deleteEvent };
