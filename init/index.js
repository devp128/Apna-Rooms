const mongoose = require("mongoose");
const initData = require("./data.js");
const mongo = "mongodb://127.0.0.1:27017/wanderlust";
const Listing = require("../models/listing.js");

main()
  .then(() => {
    console.log("Connected to DB");
  })
  .catch(err => {
    console.error("Error connecting to DB:", err);
  });

async function main() {
  try {
    await mongoose.connect(mongo);
  } catch (error) {
    throw new Error("Failed to connect to MongoDB:", error);
  }
}

const initDB = async () => {
  try {
    await Listing.deleteMany();
    await Listing.insertMany(initData.data);
    console.log("Data was initialized");
  } catch (error) {
    console.error("Error initializing database:", error);
  }
};

initDB();
