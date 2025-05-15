const mongoose = require("mongoose");

mongoose.connect("mongodb+srv://rimogob298:DTEwdrZOwoitPEmB@cluster0.7dqcq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")

  .then(() => {

    console.log('connected mongoDB');

  })

  .catch(console.error);

mongoose.connection.on('disconnected', () => console.log('-> lost connection'));

mongoose.connection.on('reconnect', () => console.log('-> reconnected'));

mongoose.connection.on('connected', () => console.log('-> connected'));
