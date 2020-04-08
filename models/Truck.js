const {Schema, model} = require('mongoose');

const schema = new Schema({
  createdBy: {
    type: String,
    required: false,
  },
  assignedTo: {
    type: String,
    required: false,
  },
  status: {
    type: String,
    required: false,
  },
  type: {
    type: String,
    required: true,
  },
  sizes: {
    width: {type: Number},
    height: {type: Number},
    length: {type: Number},
    weight: {type: Number},
  },
});

module.exports = model('Truck', schema);
