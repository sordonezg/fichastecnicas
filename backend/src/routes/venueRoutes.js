const express = require('express');
const { getVenues, createVenue, updateVenue, deleteVenue } = require('../controllers/venueController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken); // Require auth for all venue interactions

// Everyone authenticated can GET venues
router.get('/', getVenues);

// Only admins can CREATE, UPDATE, DELETE venues
router.post('/', authorizeRoles(1), createVenue);
router.put('/:id', authorizeRoles(1), updateVenue);
router.delete('/:id', authorizeRoles(1), deleteVenue);

module.exports = router;
