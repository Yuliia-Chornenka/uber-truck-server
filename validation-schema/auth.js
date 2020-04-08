const Joi = require('@hapi/joi');

module.exports = {
  register: Joi.object({
    password: Joi.string().min(6).max(30).regex(/[a-zA-Z0-9]{6,30}/).required(),
    username: Joi.string().min(3).max(20).required(),
    // eslint-disable-next-line max-len
    role: Joi.string().valid('shipper', 'driver').insensitive().lowercase().required(),
  }),
  login: Joi.object({
    username: Joi.string().min(3).max(20).required(),
    password: Joi.string().min(6).max(30).regex(/[a-zA-Z0-9]{6,30}/).required(),
  }),
};
