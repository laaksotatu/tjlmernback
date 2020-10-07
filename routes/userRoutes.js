const express = require('express');
const eValidator = require('express-validator');

const usersLogic = require('../routesLogic/usersLogic');

const router = express.Router();

router.get('/all', usersLogic.getUsers);

router.post(
  '/signup',
  [
    eValidator.check('name').not().isEmpty(),
    eValidator.check('email').normalizeEmail().isEmail(),
    eValidator.check('password').isLength({ min: 5 }),
  ],
  usersLogic.signup
);

router.post('/login', usersLogic.login);

module.exports = router;
