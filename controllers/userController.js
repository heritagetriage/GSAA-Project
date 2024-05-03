const model = require('../models/user');
const Event = require('../models/event');
const rsvp = require('../models/rsvp');
const { hostname } = require('os');

//render the new user registration form
exports.new = (req, res)=>{
     return res.render('./user/signup');
    };

exports.create = (req, res, next)=>{
        let user = new model(req.body);
        user.save()
        .then(() => res.redirect('/users/login'))
        .catch(err=>{
            if(err.name === 'ValidationError' ) {
                req.flash('error', err.message);  
                return res.redirect('/users/signup');
            }
    
            if(err.code === 11000) {
                req.flash('error', 'Email has been used');  
                return res.redirect('/users/signup');
    }
        next(err);
        });

};

exports.getUserLogin = (req, res, next) => {
           return res.render('./user/login');
  }

exports.login = (req, res, next)=>{
        let email = req.body.email;
        let password = req.body.password;
        model.findOne({ email: email })
        .then(user => {
            if (!user) {
                req.flash('error', 'wrong email address');  
                res.redirect('/users/login');
                } else {
                user.comparePassword(password)
                .then(result=>{
                    if(result) {
                        req.session.user = user._id;
                        req.flash('success', 'You have successfully logged in');
                        res.redirect('/users/profile');
                } else {
                    req.flash('error', 'wrong password');      
                    res.redirect('/users/login');
                }
                });     
            }     
        })
        .catch(err => next(err));
    
};



exports.profile = (req, res, next) => {
    let id = req.session.user;

    // Use Promise.all to run multiple queries concurrently
    Promise.all([
        model.findById(id),
        Event.find({ hostName: id }), // Events hosted by the user
        rsvp.find({ user: id }).populate('event') // RSVPs for the user, with event data populated
    ])
    .then(results => {
        const [user, events, rsvps] = results;
        console.log('user', req.session.user);

        // Extract events from the populated RSVPs
        const eventsFromRsvps = rsvps.map(rsvp => rsvp.event);

        res.render('./user/profile', { user, events, rsvps, eventsFromRsvps });
    })
    .catch(err => next(err));
};



exports.logout = (req, res, next)=>{
    req.session.destroy(err=>{
        if(err) 
           return next(err);
       else
            res.redirect('/');  
    });
   
 };



