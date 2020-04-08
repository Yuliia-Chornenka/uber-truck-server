module.exports = (schema) => {
  return async (req, res, next) => {
    try {
      const err = await schema.validate(req.body);
      if (err.error) {
        return res.status(400).json({message: err.error.details[0].message});
      }
      next();
    } catch (error) {
      return res.status(400).json({message: error.message});
    }
  };
};
