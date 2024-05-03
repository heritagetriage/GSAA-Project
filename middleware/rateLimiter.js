const rateLimit = require('express-rate-limit');

exports.logInLimiter = rateLimit({
    windowMs: 60 * 1000,  // 1 minute window
    max: 5,  // limit each IP to 5 login requests per windowMs
    handler: (req, res, next) => {
        let err = new Error("Too many login requests. Try again later.");
        err.status = 429;  // Set the HTTP status code to 429 Too Many Requests
        return next(err);
    }
});

