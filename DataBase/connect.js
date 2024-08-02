const mongoose = require("mongoose");

mongoose.connect("mongodb+srv://reinerking:reinerking@cluster0.uk7zukn.mongodb.net/?retryWrites=true&w=majority")

  .then(() => {

    console.log('connected mongoDB');

  })

  .catch(console.error);

mongoose.connection.on('disconnected', () => console.log('-> lost connection'));

mongoose.connection.on('reconnect', () => console.log('-> reconnected'));

mongoose.connection.on('connected', () => console.log('-> connected'));