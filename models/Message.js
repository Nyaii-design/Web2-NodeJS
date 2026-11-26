const mongoose = require("mongoose");

// uzenetek gyűjtemény: a Kapcsolat űrlapról érkezett üzenetek
const messageSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    subject: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true }
}, { collection: "uzenetek", timestamps: true });   // createdAt = a küldés ideje

module.exports = mongoose.model("Message", messageSchema);
