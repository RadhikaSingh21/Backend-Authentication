const mongoose = require("mongoose");

const connetDB = async (DATABASE_URL) => {
  try {
    const DB_OPTIONS = {
      dbname: "Authentication",
    };
    await mongoose.connect(DATABASE_URL, DB_OPTIONS);
    console.log("Connected Successfully..");
  } catch (error) {
    console.log(error);
  }
};

module.exports = connetDB;
