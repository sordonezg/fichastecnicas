const db = require('../utils/db-sqlite');

const getCatalog = async (req, res) => {
    try {
        const catalog = await db.catalog.findAll();
        res.json(catalog);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching catalog', error: error.message });
    }
};

const createCatalogItem = async (req, res) => {
    const { categoria, nombre } = req.body;
    if (!categoria || !nombre) {
        return res.status(400).json({ message: 'categoria y nombre son requeridos' });
    }
    try {
        const item = await db.catalog.create({ data: { categoria, nombre, activo: true } });
        res.status(201).json(item);
    } catch (error) {
        res.status(500).json({ message: 'Error creating catalog item', error: error.message });
    }
};

const deleteCatalogItem = async (req, res) => {
    const id = parseInt(req.params.id);
    try {
        await db.catalog.delete({ where: { id } });
        res.json({ message: 'Item deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting catalog item', error: error.message });
    }
};

module.exports = { getCatalog, createCatalogItem, deleteCatalogItem };
