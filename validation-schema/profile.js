const Joi = require('@hapi/joi');

module.exports = {
  password: Joi.object({
    password: Joi.string().min(6).max(30).regex(/[a-zA-Z0-9]{6,30}/).required(),
    // eslint-disable-next-line max-len
    oldPassword: Joi.string().min(6).max(30).regex(/[a-zA-Z0-9]{6,30}/).required(),
  }),
};
