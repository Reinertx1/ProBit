const mongoose = require('mongoose');

const giveawaySchema = new mongoose.Schema({

  messageId: { type: String, required: true },

  prize: { type: String, required: true },

  endTime: { type: Number, required: true },

  winnerCount: { type: Number, required: true },

  guildId: { type: String, required: true },

  channelId: { type: String, required: true },

  authorId: { type: String, required: true }

});

module.exports = mongoose.model('Giveaway', giveawaySchema);