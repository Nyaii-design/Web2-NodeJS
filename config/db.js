const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            dbName: process.env.DB_NAME || "mozi"
        });
        console.log("MongoDB kapcsolat rendben.");
    } catch (err) {
        console.error("MongoDB hiba:", err.message);
        process.exit(1);
    }
};

module.exports = connectDB;
