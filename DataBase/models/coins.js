const { Schema, model } = require('mongoose');

const coinSchema = new Schema({

  userId: String,

  coins: { type: Number, default: 0 },

  lastDaily: Date,

});

module.exports = model('Coin', coinSchema);