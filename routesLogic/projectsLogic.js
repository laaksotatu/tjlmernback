const eValidator = require('express-validator');
const mongoose = require('mongoose');

const Project = require('../schemas/project');
const User = require('../schemas/user');

const getProjects = async (req, res, next) => {
  let projects;
  try {
    projects = await Project.find({});
  } catch (err) {
    const error = new Error('Fetching failed.');
    error.code = 500;
    return next(error);
  }

  res.json({
    projects: projects.map((project) => project.toObject({ getters: true })),
  });
};

const getProjectById = async (req, res, next) => {
  const projectId = req.params.projectid;

  let project;
  try {
    project = await Project.findById(projectId);
  } catch (err) {
    const error = new Error('Fetching failed');
    error.code = 500;
    return next(error);
  }

  if (!project) {
    const error = new Error('Project not found.');
    error.code = 404;
    return next(error);
  }

  res.json({ project: project.toObject({ getters: true }) });
};

const getProjectsByUserId = async (req, res, next) => {
  const userId = req.params.userid;

  let projects;
  try {
    projects = await Project.find({ author: userId });
  } catch (err) {
    const error = new Error('Fetching failed');
    error.code = 500;
    return next(error);
  }

  if (!projects) {
    const error = new Error('User not found.');
    error.code = 404;
    return next(error);
  }

  res.json({
    projects: projects.map((project) => project.toObject({ getters: true })),
  });
};

const createProject = async (req, res, next) => {
  const errors = eValidator.validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Invalid inputs');
    error.code = 422;
    return next(error);
  }

  const { title, description, author } = req.body;

  const createdProject = new Project({
    title: title,
    description: description,
    author: author,
  });

  let user;

  try {
    user = await User.findById(author);
  } catch (err) {
    const error = new Error('Creation failed');
    error.code = 500;
    return next(error);
  }

  if (!user) {
    const error = new Error('User not found');
    error.code = 404;
    return next(error);
  }

  try {
    const sessio = await mongoose.startSession();
    sessio.startTransaction();
    await createdProject.save({ session: sessio });

    user.projects.push(createdProject);
    await user.save({ session: sessio });
    await sessio.commitTransaction();
  } catch (err) {
    const error = new Error('Saving failed');
    error.code = 500;
    return next(error);
  }

  res.status(201).json({ project: createdProject });
};

const updateProject = async (req, res, next) => {
  const errors = eValidator.validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Invalid inputs');
    error.code = 422;
    return next(error);
  }

  const { title, description } = req.body;
  const projectId = req.params.projectid;

  let project;
  try {
    project = await Project.findById(projectId);
  } catch (err) {
    const error = new Error('Fetching failed');
    error.code = 500;
    return next(error);
  }

  if (project.author.toString() !== req.userData.userId) {
    const error = new Error('Not allowed.');
    error.code = 401;
    return next(error);
  }

  project.title = title;
  project.description = description;

  try {
    await project.save();
  } catch (err) {
    const error = new Error('Saving failed');
    error.code = 500;
    return next(error);
  }

  res.status(200).json({ project: project.toObject({ getters: true }) });
};

const deleteProject = async (req, res, next) => {
  const projectId = req.params.projectid;

  let project;
  try {
    project = await Project.findById(projectId).populate('author');
  } catch (err) {
    const error = new Error('Fetching failed');
    error.code = 500;
    return next(error);
  }

  if (!project) {
    const error = new Error('Project not found');
    error.code = 500;
    return next(error);
  }

  if (project.author.id !== req.userData.userId) {
    const error = new Error('Not allowed.');
    error.code = 401;
    return next(error);
  }

  try {
    const sessio = await mongoose.startSession();
    sessio.startTransaction();
    await project.remove({ session: sessio });
    project.author.projects.pull(project);
    await project.author.save({ session: sessio });
    await sessio.commitTransaction();
  } catch (err) {
    const error = new Error('Deleting failed');
    error.code = 500;
    return next(error);
  }

  res.status(200).json({ message: 'Project deleted.' });
};

exports.getProjects = getProjects;
exports.getProjectById = getProjectById;
exports.getProjectsByUserId = getProjectsByUserId;
exports.createProject = createProject;
exports.updateProject = updateProject;
exports.deleteProject = deleteProject;
