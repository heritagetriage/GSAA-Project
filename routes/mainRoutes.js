// Set up routes

const express = require('express');
const controller = require('../controllers/mainController');
const router = express.Router();

// Set up Home Route 
router.get('/', controller.mainIndex);

// Set up Contact Route 
router.get('/contact', controller.contact);

// Set up About Route 
router.get('/about', controller.about);

module.exports = router;

