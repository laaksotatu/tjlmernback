const eValidator = require('express-validator');
const jwtoken = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const User = require('../schemas/user');

const getUsers = async (req, res, next) => {
  let users;
  try {
    users = await User.find({}, '-password');
  } catch (err) {
    const error = new Error('Fetching failed.');
    error.code = 500;
    return next(error);
  }

  res.json({ users: users.map((user) => user.toObject({ getters: true })) });
};

const signup = async (req, res, next) => {
  const errors = eValidator.validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Invalid inputs');
    error.code = 422;
    return next(error);
  }
  const { name, email, password } = req.body;

  let emailTaken;
  try {
    emailTaken = await User.findOne({ email: email });
  } catch (err) {
    const error = new Error('Fetching email failed');
    error.code = 500;
    return next(error);
  }

  if (emailTaken) {
    const error = new Error('Email not available');
    error.code = 422;
    return next(error);
  }

  let passwordHashed;
  try {
    passwordHashed = await bcrypt.hash(password, 10);
  } catch (err) {
    const error = new Error('Password hashing failed');
    error.code = 500;
    return next(error);
  }

  const createdUser = new User({
    name,
    email,
    password: passwordHashed,
    projects: [],
  });

  try {
    await createdUser.save();
  } catch (err) {
    const error = new Error('Saving user failed');
    error.code = 500;
    return next(error);
  }

  let token;

  try {
    token = jwtoken.sign({ userId: createdUser.id }, 'secretprivatekey', {
      expiresIn: '2h',
    });
  } catch (err) {
    const error = new Error('Token creation failed');
    error.code = 500;
    return next(error);
  }

  res.status(201).json({ userId: createdUser.id, token: token });
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new Error('Login failed.');
    error.code = 500;
    return next(error);
  }

  if (!existingUser) {
    const error = new Error('Invalid email.');
    error.code = 401;
    return next(error);
  }

  let validPassword = false;

  try {
    validPassword = await bcrypt.compare(password, existingUser.password);
  } catch (err) {
    const error = new Error('Login failed.');
    error.code = 500;
    return next(error);
  }

  if (!validPassword) {
    const error = new Error('Invalid password.');
    error.code = 401;
    return next(error);
  }

  try {
    token = jwtoken.sign({ userId: existingUser.id }, 'secretprivatekey', {
      expiresIn: '2h',
    });
  } catch (err) {
    const error = new Error('Login failed.');
    error.code = 500;
    return next(error);
  }

  res.json({
    userId: existingUser.id,
    token: token,
  });
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
