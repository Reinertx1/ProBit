const mongoose = require('mongoose');

const verifiedSchema = new mongoose.Schema({

  userId: { type: String, required: true, unique: true },

  verified: { type: Boolean, default: false }

});

module.exports = mongoose.model('Verified', verifiedSchema);