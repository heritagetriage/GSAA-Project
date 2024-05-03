const Event = require('../models/event');

//check if user is a guest
exports.isGuest = (req, res, next)=> {
    if(!req.session.user) {
        return next();
    } else {
        req.flash('error', 'You are logged in already');
        return res.redirect('/users/profile');
    }
}

//check if user is authenticated
exports.isLoggedIn = (req, res, next)=> {
    if(req.session.user) {
        return next();
    } else {
        req.flash('error', 'You need to login first');
        return res.redirect('/users/login');
    }
}

//check if user is author of story

exports.isHost = (req, res, next) => {
    let id = req.params.id;
    Event.findById(id)
        .then(event => {
            if (event) {
                if (event.hostName.toString() === req.session.user.toString()) {
                    return next();
                } else {
                    let err = new Error('Unauthorized to access this event');
                    err.status = 401;
                    return next(err);
                }
            } else {
                let err = new Error('Cannot find an event with id ' + id);
                err.status = 404;
                next(err);
            }
        })
        .catch(err => next(err));
};

exports.isNotHost = (req, res, next) => {
    Event.findById(req.params.id).then(event => {
        // Convert both identifiers to string to ensure accurate comparison
        if (event.hostName.toString() === req.session.user.toString()) {
            let err = new Error("Unauthorized: Host cannot RSVP to their own event");
            err.status = 401;
            next(err);
        } else {
            next();
        }
    }).catch(err => {
        next(err);
    });
};
