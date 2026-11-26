const mongoose = require("mongoose");

// filmek gyűjtemény (az Access adatbázis "film" táblája)
const filmSchema = new mongoose.Schema({
    fkod: { type: Number, required: true, unique: true },
    filmcim: { type: String, required: true, trim: true },
    szines: { type: Boolean, default: true },
    szinkron: { type: String, default: null },   // fel = feliratos, mb = magyarul beszélő
    szarmazas: { type: String, default: null },
    mufaj: { type: String, default: null },
    hossz: { type: Number, default: 0 }
}, { collection: "filmek" });

module.exports = mongoose.model("Film", filmSchema);
