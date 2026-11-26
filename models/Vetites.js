const mongoose = require("mongoose");

// vetitesek gyűjtemény: melyik filmet melyik moziban játsszák (az Access "hely" táblája)
const vetitesSchema = new mongoose.Schema({
    fkod: { type: Number, required: true },
    moziazon: { type: Number, required: true }
}, { collection: "vetitesek" });

vetitesSchema.index({ fkod: 1, moziazon: 1 }, { unique: true });

module.exports = mongoose.model("Vetites", vetitesSchema);
