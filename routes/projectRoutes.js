const express = require('express');
const eValidator = require('express-validator');

const projectsLogic = require('../routesLogic/projectsLogic');
const authCheck = require('../middleware/authCheck');

const router = express.Router();

router.get('/all', projectsLogic.getProjects);

router.get('/:projectid', projectsLogic.getProjectById);

router.get('/user/:userid', projectsLogic.getProjectsByUserId);

router.use(authCheck);

router.post(
  '/new',
  [
    eValidator.check('title').not().isEmpty(),
    eValidator.check('description').isLength({ min: 10 }),
  ],
  projectsLogic.createProject
);

router.patch(
  '/:projectid',
  [
    eValidator.check('title').not().isEmpty(),
    eValidator.check('description').isLength({ min: 10 }),
  ],
  projectsLogic.updateProject
);

router.delete('/:projectid', projectsLogic.deleteProject);

module.exports = router;
