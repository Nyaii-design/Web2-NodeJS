const mongoose = require("mongoose");

// mozik gyűjtemény (az Access adatbázis "mozi" táblája)
const moziSchema = new mongoose.Schema({
    moziazon: { type: Number, required: true, unique: true },
    nev: { type: String, required: true, trim: true },
    irszam: { type: String, default: "" },
    cim: { type: String, default: "" },
    telefon: { type: String, default: null }
}, { collection: "mozik" });

module.exports = mongoose.model("Mozi", moziSchema);
