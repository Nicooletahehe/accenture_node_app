const mongoose = require('mongoose');

const connect = async () => {
    try {
      await mongoose.connect('mongodb://localhost:27017/playground', {
        // properties
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
      console.log("Movies DB connected");
    } catch (error) {
      console.log("Movies DB not connected", error);
    }
};

module.exports = connect;