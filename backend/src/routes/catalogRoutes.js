const express = require('express');
const { getCatalog, createCatalogItem, deleteCatalogItem } = require('../controllers/catalogController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken);

router.get('/', getCatalog);
router.post('/', authorizeRoles(1), createCatalogItem);
router.delete('/:id', authorizeRoles(1), deleteCatalogItem);

module.exports = router;
