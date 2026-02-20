const express = require('express');
const { createEvent, getEvents, updateEventStatus, updateEvent, deleteEvent } = require('../controllers/eventController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// All event routes require authentication
router.use(authenticateToken);

router.get('/', getEvents);
router.post('/', authorizeRoles(1, 2, 3), createEvent);
router.put('/:id', authorizeRoles(1, 2), updateEvent);
router.delete('/:id', authorizeRoles(1, 2), deleteEvent);

// Admin only: Approve/Reject
router.patch('/:id/status', authorizeRoles(1), updateEventStatus);

module.exports = router;
