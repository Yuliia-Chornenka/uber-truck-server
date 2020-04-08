const Joi = require('@hapi/joi');

module.exports = {
  load: Joi.object({
    payload: Joi.number().integer().min(1).max(100000).required(),
    dimensions: {
      width: Joi.number().integer().min(1).max(100000).required(),
      height: Joi.number().integer().min(1).max(100000).required(),
      length: Joi.number().integer().min(1).max(100000).required(),
    },
    createdTime: Joi.date(),
    assignedTo: Joi.string().min(0).allow('').allow(null),
    truckId: Joi.string().min(0).allow('').allow(null),
    status: Joi.string(),
    state: Joi.string().min(0).allow(''),
    logs: Joi.array(),
  }),
};
