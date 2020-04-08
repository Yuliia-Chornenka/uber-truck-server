const {Schema, model} = require('mongoose');

const schema = new Schema({
  email: {
    type: String,
    required: false,
  },
  username: {
    type: String,
    required: false,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: false,
  },
  photo: {
    type: String,
    required: false,
  },
});

module.exports = model('User', schema);
