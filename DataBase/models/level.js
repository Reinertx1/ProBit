const mongoose = require('mongoose');

const levelSchema = new mongoose.Schema({

  userId: { type: String, required: true, unique: true },

  level: { type: Number, default: 0 },

  xp: { type: Number, default: 0 },

  nextLevelXP: { type: Number, default: 600 }, // قيمة XP للمستوى الأول

});

module.exports = mongoose.model('Level', levelSchema);