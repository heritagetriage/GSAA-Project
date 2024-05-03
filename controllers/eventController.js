const model = require('../models/event');
const usermodel = require('../models/user');
const RSVP = require('../models/rsvp');
const { DateTime } = require('luxon');
const { hostname } = require('os');

//show the events page

exports.index = (req, res, next) => {
    let userId = req.session.user;
    if (userId) {
            Promise.all([
            model.find(),
            usermodel.findById(userId) 
        ])
        .then(([events, user]) => {
            if (user) {
                res.render('./event/index', { events, user }); 
            } else {
             
                res.render('./event/index', { events, user: null });
            }
        })
        .catch(err => next(err));
    } else {
             model.find()
        .then(events => {
            res.render('./event/index', { events, user: null });
        })
        .catch(err => next(err));
    }
};



// Render the events creation form 
exports.new = (req, res, next) => {

    const userid = req.session.user; 
    usermodel.findById(userid)
        .then(user => {
            if (user) {
                const errors = req.flash('error');
                res.render('./event/new', { errors, user }); 
            } else {
                req.flash('error', 'User not found');
                res.redirect('/login');
            }
        })
        .catch(err => {
            req.flash('error', 'Failed to fetch user details');
            return next(err);
        });
};


// Create a new event
exports.create = (req, res, next) => {
    let event = req.body;
    event.hostName = req.session.user; 

    if (req.file) {
        event.image = "/img/" + req.file.filename; 
    } else {
        event.image = '/img/event_flyer.jpg';
    }

    const newEvent = new model(event);
    newEvent.save()
        .then(() => {
            res.redirect('/events');
        })
        .catch(err => {
            if (err.name === 'ValidationError') {
                req.flash('error', err.message);
                res.redirect('/event/new');
            } else {
                next(err);
            }
        });
};


// Show a particular event
exports.show = (req, res, next) => {
    const eventId = req.params.id;
    let userid = req.session.user;
    Promise.all([
        model.findById(eventId).populate('hostName', 'firstName lastName'),
        RSVP.countDocuments({ event: eventId, status: 'Yes' }),
        usermodel.findById(userid) 
    ])
    .then(([event, yesRSVPCount, user]) => {
        if (!event) {
            req.flash('error', 'Event not found');
            return res.redirect('/events');
        }
        event.formattedStartDate = event.startDate
        ? DateTime.fromJSDate(event.startDate).toLocaleString(DateTime.DATETIME_SHORT)
        : 'No start date provided';
        event.formattedEndDate = event.endDate
        ? DateTime.fromJSDate(event.endDate).toLocaleString(DateTime.DATETIME_SHORT)
        : 'No end date provided';

        res.render('./event/show', {
            event,
            user: user,
            yesRSVPCount,
            formattedStartDate: event.formattedStartDate,
            formattedEndDate: event.formattedEndDate
        });
    })
    .catch(err => {
        console.error('Error displaying event:', err);
        next(err);
    });
};



// Edit Controller Function
exports.edit = (req, res, next) => {
    let id = req.params.id;
    let userid = req.session.user;
       Promise.all([model.findById(id).lean(), usermodel.findById(userid)])
        .then(results => {
            const [event, user] = results;
            if (event) {
                if (event.startDate) {
                    event.startDate = DateTime.fromJSDate(event.startDate).toFormat('yyyy-LL-dd\'T\'HH:mm');
                }
                if (event.endDate) {
                    event.endDate = DateTime.fromJSDate(event.endDate).toFormat('yyyy-LL-dd\'T\'HH:mm');
                }
                res.render('./event/edit', { event, user }); 
            } else {
                req.flash('error', 'Unauthorized access or event not found'); 
                res.status(401).redirect('/error?status=401');
            }
        })
        .catch(err => next(err));
};


// Update an event
exports.update = (req, res, next) => {
    let event = req.body;
    let id = req.params.id;
    let userid = req.session.user;
    if (event.startDate) {
        event.startDate = DateTime.fromFormat(event.startDate, 'yyyy-LL-dd\'T\'HH:mm', { zone: 'local' }).toUTC().toJSDate();
    }
    if (event.endDate) {
        event.endDate = DateTime.fromFormat(event.endDate, 'yyyy-LL-dd\'T\'HH:mm', { zone: 'local' }).toUTC().toJSDate();
    }
    model.findByIdAndUpdate(id, event, { useFindAndModify: false, new: true, runValidators: true })
        .then(event => {
            
                // console.log('Updated event:', event);
                res.redirect('/events/' + id);
            } )
            .catch(err => {
            console.error('Error during event update:', err);
            if (err.name === 'ValidationError') {
                err.status = 400;
            }
            next(err);
        });
};


// Function to delete an event and corresponding RSVPs
exports.delete = (req, res, next) => {
    let id = req.params.id;

    // Delete the event and all associated RSVPs in parallel
    Promise.all([
        model.findByIdAndDelete(id), // Delete the event
        RSVP.deleteMany({ event: id }) // Delete all RSVPs for the event
    ])
    .then(([event, rsvpResult]) => {
        if (event) {
            req.flash('success', 'Event and corresponding RSVPs deleted successfully.');
            res.redirect('/users/profile');
        } else {
            req.flash('error', 'No event found with the given ID.');
            res.redirect('/events');
        }
    })
    .catch(err => {
        console.error('Error during event and RSVP deletion:', err);
        req.flash('error', 'Failed to delete event and RSVPs.');
        res.redirect('/events');
    });
};

exports.rsvp = async (req, res, next) => {
    const id = req.params.id;
    const userid = req.session.user;
    const status = req.body.status;

    try {
        const [event, user] = await Promise.all([
            model.findById(id),
            usermodel.findById(userid)
        ]);

        if (!event || !user) {
            throw new Error('Event or User not found');
        }

        // Process the RSVP, updating if one exists or creating a new one
        const rsvp = await RSVP.findOneAndUpdate(
            { user: userid, event: id },
            { status: status },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        if (!rsvp) {
            throw new Error('Failed to create or update RSVP');
        }

        // Optionally update user session or other state here
        req.session.user = user;
        res.redirect('/users/profile');
    } catch (err) {
               next(err);
    }
};
