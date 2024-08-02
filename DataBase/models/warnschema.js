const mongoose = require("mongoose");

const { Schema } = mongoose;

// Define the schema for warnings

const WarnSchema = new Schema({

    guildId: { type: String, required: true },

    memberId: { type: String, required: true },

    reason: { type: String, required: true },

    timestamp: { type: Date, default: Date.now }

});

// Register the Warn model with Mongoose

const Warn = mongoose.model("Warn", WarnSchema);

module.exports = {

    Warn

};