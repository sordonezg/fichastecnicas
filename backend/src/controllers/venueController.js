const db = require('../utils/db-sqlite');

const getVenues = async (req, res) => {
    try {
        const venues = await db.venues.findAll();
        res.json(venues);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching venues', error: error.message });
    }
};

const createVenue = async (req, res) => {
    const { nombre, capacidad, activo } = req.body;
    try {
        const venue = await db.venues.create({
            data: { nombre, capacidad, activo }
        });
        res.status(201).json(venue);
    } catch (error) {
        res.status(500).json({ message: 'Error creating venue', error: error.message });
    }
};

const updateVenue = async (req, res) => {
    const { id } = req.params;
    const { nombre, capacidad, activo } = req.body;
    try {
        const dataToUpdate = {};
        if (nombre !== undefined) dataToUpdate.nombre = nombre;
        if (capacidad !== undefined) dataToUpdate.capacidad = capacidad;
        if (activo !== undefined) dataToUpdate.activo = activo ? 1 : 0;

        const updatedVenue = await db.venues.update({
            where: { id: parseInt(id) },
            data: dataToUpdate
        });
        res.json(updatedVenue);
    } catch (error) {
        res.status(500).json({ message: 'Error updating venue', error: error.message });
    }
};

const deleteVenue = async (req, res) => {
    const { id } = req.params;
    try {
        await db.venues.delete({ where: { id: parseInt(id) } });
        res.json({ message: 'Venue deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting venue', error: error.message });
    }
};

module.exports = { getVenues, createVenue, updateVenue, deleteVenue };
