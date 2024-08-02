const mongoose = require("mongoose");
const reportroom = mongoose.Schema({

  guildID: String,

  channel : String, 

  toggle : String ,

  case : {

    type : Number,

    default : 0

  }

});

module.exports = mongoose.model("logs-model", reportroom);