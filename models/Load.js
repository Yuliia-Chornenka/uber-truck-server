const {Schema, model} = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const schema = new Schema({
  createdBy: {
    type: String,
    required: true,
  },
  createdTime: {
    type: Date,
    default: Date.now,
  },
  assignedTo: {
    type: String,
    required: false,
  },
  truckId: {
    type: String,
    required: false,
  },
  status: {
    type: String,
    required: false,
  },
  state: {
    type: String,
    required: false,
  },
  payload: {
    type: Number,
    required: true,
  },
  dimensions: {
    width: {type: Number, required: true},
    length: {type: Number, required: true},
    height: {type: Number, required: true},
  },
  logs: [{
    message: {type: String, required: true},
    time: {type: Date, default: Date.now}},
  ],
});

schema.plugin(mongoosePaginate);

module.exports = model('Load', schema);
