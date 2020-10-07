const jwtoken = require('jsonwebtoken');

module.exports = (req, res, next) => {
  if (req.method === 'OPTIONS') {
    return next();
  }

  try {
    const token = req.headers.authorization;

    const verifiedToken = jwtoken.verify(token, 'secretprivatekey');
    req.userData = { userId: verifiedToken.userId };
    next();
  } catch (err) {
    const error = new Error('Invalid token.');
    error.code = 401;
    return next(error);
  }
};
