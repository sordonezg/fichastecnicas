const db = require('../utils/db-sqlite');

const createEvent = async (req, res) => {
    const { titulo, descripcion, fecha_inicio, fecha_fin, requisitos_tecnicos } = req.body;
    const userId = req.user.id;

    try {
        const event = await db.events.create({
            data: {
                id: String(Date.now()),
                titulo,
                descripcion,
                fecha_inicio: new Date(fecha_inicio).toISOString(),
                fecha_fin: new Date(fecha_fin).toISOString(),
                requisitos_tecnicos,
                user_id: String(userId),
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
    const { titulo, descripcion, fecha_inicio, fecha_fin, requisitos_tecnicos } = req.body;
    const userId = req.user.id;
    const userNivel = req.user.nivel_permiso;

    try {
        const event = await db.events.findUnique({ where: { id: String(id) } });
        if (!event) return res.status(404).json({ message: 'Event not found' });

        if (String(event.user_id) !== String(userId) && userNivel !== 1) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const updatedEvent = await db.events.update({
            where: { id: String(id) },
            data: {
                titulo: titulo || event.titulo,
                descripcion: descripcion || event.descripcion,
                fecha_inicio: fecha_inicio ? new Date(fecha_inicio).toISOString() : event.fecha_inicio,
                fecha_fin: fecha_fin ? new Date(fecha_fin).toISOString() : event.fecha_fin,
                requisitos_tecnicos: requisitos_tecnicos || event.requisitos_tecnicos,
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
