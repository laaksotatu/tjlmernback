const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const projectRoutes = require('./routes/projectRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

app.use(bodyParser.json());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
  next();
});

app.use('/api/projects', projectRoutes);

app.use('/api/users', userRoutes);

app.use((req, res, next) => {
  const error = new Error('Route not found.');
  error.code = 404;
  return next(error);
});

app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || 'Error occured.' });
});

mongoose
  .connect(
    'mongodb+srv://tatu:<password_here>@tjlthesis-jsg8s.mongodb.net/thesis?retryWrites=true&w=majority'
  )
  .then(() => {
    app.listen(5000);
  })
  .catch((error) => {
    console.log(error);
  });
