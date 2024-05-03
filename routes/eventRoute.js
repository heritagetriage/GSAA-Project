const express = require('express');
const controller = require('../controllers/eventController');
const { fileUpload } = require('../middleware/fileUpload');
const { isLoggedIn, isHost, isNotHost } = require('../middleware/auth');
const { validateId,  newEventValidator, validateStartEndDate, validateResult, validateRsvpStatus } = require('../middleware/validator');

const router = express.Router();

// GET /event: send all events to the user
router.get('/', controller.index);

// GET /event/new: Send HTML form for creating a new event
router.get('/new', isLoggedIn, controller.new);

// POST /event: create a new event

router.post('/', isLoggedIn, fileUpload, newEventValidator, validateStartEndDate,  validateResult, controller.create);

// GET /event/:id: send details of event identified by id
router.get('/:id', validateId, controller.show);

// GET /event/:id/edit: send HTML form for editing an existing event

router.get('/:id/edit', isLoggedIn, validateId, isHost , validateResult, controller.edit);

// PUT /event/:id: update the event identified by id

router.put('/:id', isLoggedIn,validateId, isHost,  newEventValidator,validateStartEndDate, validateResult, controller.update);

// DELETE /event/:id: delete the event identified by id
router.delete('/:id', isLoggedIn, isHost, validateId, controller.delete);

// POST /event/:id/rsvp: submit RSVP for an event
router.post('/:id/rsvp', isLoggedIn, validateId, isNotHost, validateRsvpStatus, controller.rsvp);

module.exports = router;


