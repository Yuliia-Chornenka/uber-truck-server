const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = (req, res, next) => {
  const jwtToken = req.headers['authorization'].split(' ')[1];

  const user = jwt.verify(jwtToken, config.get('jwtSecret'));
  req.user = user;

  next();
};
