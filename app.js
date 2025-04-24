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
const { validateId } = require('./middleware/validator');

const app = express();

// Configure application
app.set('view engine', 'ejs');

// Connect to database
const dbURI = 'mongodb+srv://nanasefa:kings1982@cluster0.pyciqy4.mongodb.net/project3?retryWrites=true&w=majority';
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        app.listen(process.env.PORT || 3000, () => {
            console.log('Server is running on port', process.env.PORT || 5000);
        });
    })
    .catch(err => console.error(err));

// Middleware
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('tiny'));
app.use(methodOverride('_method'));

app.use(session({
    secret: "ajfeirf90aeu9eroejfoefj",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: dbURI }),
    cookie: { maxAge: 60 * 60 * 1000 }
}));
app.use(flash());

app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    res.locals.errorMessages = req.flash('error');
    res.locals.successMessages = req.flash('success');
    next();
});

// Routes
app.use('/', mainRoutes);
app.use('/events', eventRoutes);
app.use('/users', userRoutes);
app.use('/feedbacks', feedbackRoutes);

// Error handling
app.use((req, res, next) => {
    const err = new Error('The server cannot locate ' + req.url);
    err.status = 404;
    next(err);
});

app.use((err, req, res, next) => {
    const errorStatus = err.status || 500;
    res.status(errorStatus);
    res.render('error', { err: { status: errorStatus, message: err.message } });
});
