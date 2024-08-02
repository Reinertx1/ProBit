const mongoose = require('mongoose');

const repSchema = new mongoose.Schema({

  userId: { type: String, required: true, unique: true },

  rep: { type: Number, default: 0 },

  lastGiven: { type: Date, default: null },

});

module.exports = mongoose.model('Rep', repSchema);