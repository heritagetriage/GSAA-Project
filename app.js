//Require modules
const express = require('express');
const morgan = require('morgan');
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const mainRoutes = require('./routes/mainRoutes');
const eventRoutes = require('./routes/eventRoute');
const userRoutes = require('./routes/userRoute');
const feedbackRoutes = require('./routes/feedbackRoute');
const { error } = require('console');
const {validateId} = require('./middleware/validator')

//create app
const app = express();


//Configure application
let port = 3000;
let host = 'localhost';
app.set('view engine', 'ejs');


//Connect to database
mongoose.connect('mongodb+srv://nanasefa:kings1982@cluster0.pyciqy4.mongodb.net/project3?retryWrites=true&w=majority',
                   )
.then(()=>{
    //start the server
    app.listen(port, host, ()=> {
    console.log('Server is running on port', port);
});
})
.catch(err=>console.log(err.message));

//mount middlware
app.use(
    session({
        secret: "ajfeirf90aeu9eroejfoefj",
        resave: false,
        saveUninitialized: false,
        store: new MongoStore({mongoUrl: 'mongodb+srv://nanasefa:kings1982@cluster0.pyciqy4.mongodb.net/project3?retryWrites=true&w=majority'}),
        cookie: {maxAge: 60*60*1000}
        })
);
app.use(flash());



app.use((req, res, next) => {
    // console.log(req.session);
    res.locals.user = req.session.user||null;
    res.locals.errorMessages = req.flash('error');
    res.locals.successMessages = req.flash('success');
    next();
});

// Mount Middleware
app.use(express.static('public'));
app.use(express.urlencoded({extended :true}));
app.use(morgan('tiny'));
app.use(methodOverride('_method'));

app.use('/', mainRoutes);

app.use('/events', eventRoutes);
app.use('/users', userRoutes);
app.use('/feedbacks', feedbackRoutes); // Corrected path


// Cannot find a resource Error Page
app.use((req, res, next)=>{
    let err = new Error('The server cannot locate ' + req.url);
    err.status = 404;
    next(err);
});

app.use((err, req, res, next) => {
    const errorStatus = err.status || 500;
    res.status(errorStatus);
    res.render('error', { err: { status: errorStatus, message: err.message } });
});