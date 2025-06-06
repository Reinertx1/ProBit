// models/User.js

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({

  userId: { type: String, required: true, unique: true },

  coins: { type: Number, default: 0 },

  password: { type: String, required: true },

});

module.exports = mongoose.model('User', userSchema);