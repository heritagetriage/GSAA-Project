// Directly define the index function on exports
const usermodel = require('../models/user');


// Displaying user data on the index page if logged in
exports.mainIndex = (req, res,next ) => {
  if (req.session.user) {
    let userid = req.session.user;
      usermodel.findById(userid)
          .then(user => {
              res.render('index', { user });
          })
          .catch(err => {
              console.error('Error retrieving user data:', err);
              res.render('index'); // Render without user data if there's an error
          });
  } else {
      res.render('index');
  }
};

// Displaying user data on the contact page if logged in
exports.contact = (req, res, next) => {
  if (req.session.user) {
    let userid = req.session.user;
      usermodel.findById(userid)
          .then(user => {
              res.render('contact', { user });
          })
          .catch(err => {
              console.error('Error retrieving user data:', err);
              res.render('contact'); // Render without user data if there's an error
          });
  } else {
      res.render('contact');
  }
};

// Displaying user data on the about page if logged in
exports.about = (req, res, next) => {
  if (req.session.user) {
    let userid = req.session.user;
      usermodel.findById(userid)
          .then(user => {
              res.render('about', { user });
          })
          .catch(err => {
              console.error('Error retrieving user data:', err);
              res.render('about'); // Render without user data if there's an error
          });
  } else {
      res.render('about');
  }
};

