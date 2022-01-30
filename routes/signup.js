const express = require('express');
const router = express.Router();

// display singup page
router.get('/', (req, res) => {
    res.render('signup')
});