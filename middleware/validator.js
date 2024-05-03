
const moment = require('moment'); 
const { body, validationResult, check } = require('express-validator');
const { DateTime } = require('luxon');
const validator = require('validator');

// validate story id
exports.validateId = (req, res, next) => {
    const id = req.params.id;
    if (!id) {
        const err = new Error('No ID provided');
        err.status = 400;
        next(err);
    } else if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        const err = new Error('Invalid Event ID format');
        err.status = 400;
        next(err); 
    } 
      return next(); 
    }

exports.validateSignUp = [body('firstName','First name is required ').notEmpty().trim().escape(),
    body('lastName','Last Name is required').notEmpty().trim().escape(),
    body('email','Email is not valid').isEmail().trim().escape().normalizeEmail(), 
    body('password', 'Password must be at 8 characters and atmost 64 characters').isLength({min: 8, max: 64})];

exports.validateLogIn = [body('email','Email must be a valid email address').isEmail().trim().escape().normalizeEmail(), 
    body('password', 'Password must be at 8 characters and atmost 64 characters').isLength({min: 8, max: 64})];

exports.validateResult = (req, res, next) => {
        let errors = validationResult(req);
        if (!errors.isEmpty()) {
            errors.array().forEach(error => {
                req.flash('error', error.msg);
            });
            return res.redirect('back');
        }
        return next();
 };
    

//Middleware function to sanitize new event inputs
exports.newEventValidator = [
    body('title', 'Title is required').trim().escape().notEmpty(),
    body('category', 'Category is required').trim().escape().isIn([
        'Physical Meetup Events', 
        'Online Meetup Events', 
        'Fund Raising Event', 
        'Outdoor Events',
        'Outreach Events'
    ]),
    body('hostName', 'Invalid host ID').optional({ checkFalsy: true }).isMongoId(),
    body('startDate', 'Start is required').notEmpty().isISO8601(),
    body('endDate', 'End is required').notEmpty().isISO8601(),
    body('location', 'Location cannot be empty').trim().escape().notEmpty(),
    body('details', 'Details cannot be empty').trim().escape().notEmpty(),
   ];

   // Validate the status of an rsvp

   exports.validateRsvpStatus = (req, res, next) => {

    const status = req.body.status;
    if (!status || status.trim() === "") {
        req.flash('error', 'RSVP cannot be empty');
        return res.redirect('back');
    }
    // check for more specific status values
    const validStatuses = ['Yes', 'No', 'Maybe'];
    if (!validStatuses.includes(status)) {
        req.flash('error', 'RSVP can only be YES, NO or MAYBE');
        return res.redirect('back');
    }

    next();

};
// Validate Start and End Date
exports.validateStartEndDate = (req, res, next) => {
    const { startDate, endDate } = req.body;

    // Use moment to handle dates and times
    const now = moment(); // Current time
    const start = moment(startDate); // Assumes startDate includes both date and time
    const end = moment(endDate); // Assumes endDate includes both date and time

    // Check if the start date and time is after the current moment
    if (!start.isAfter(now)) {
        req.flash('error', 'start must be after today.');
        return res.redirect('back');  
    } 

    // Check if the end date and time is after the start date and time
    if (!end.isAfter(start)) {
        req.flash('error', 'End must be after Start.');
        return res.redirect('back');  
    }

    next(); 
};