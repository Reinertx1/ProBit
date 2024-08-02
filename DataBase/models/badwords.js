const mongoose = require("mongoose");

const bads = mongoose.Schema({

  guildID: String,

  word : String, 

  modreatorId : String, 

  at : String, 

  id : String, 

  badsok : String,

});

module.exports = mongoose.model("badwords", bads);