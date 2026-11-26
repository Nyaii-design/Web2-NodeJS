const mongoose = require("mongoose");

// users gyűjtemény: regisztrált felhasználók (jelszó bcrypt hash-ben)
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" }
}, { collection: "users" });

module.exports = mongoose.model("User", userSchema);
