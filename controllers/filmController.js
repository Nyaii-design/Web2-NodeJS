const mongoose = require("mongoose");
const Film = require("../models/Film");
const Vetites = require("../models/Vetites");

// Közös validáció a létrehozáshoz és a módosításhoz
function ellenoriz(body) {
    const adat = {
        filmcim: String(body.filmcim || "").trim(),
        mufaj: String(body.mufaj || "").trim(),
        szarmazas: String(body.szarmazas || "").trim(),
        hossz: String(body.hossz || "").trim(),
        szinkron: String(body.szinkron || ""),
        szines: body.szines === "1"
    };
    const errors = {};
    if (adat.filmcim.length < 1 || adat.filmcim.length > 150) errors.filmcim = "A cím kötelező, legfeljebb 150 karakter.";
    if (adat.mufaj.length > 50) errors.mufaj = "A műfaj legfeljebb 50 karakter lehet.";
    if (adat.szarmazas.length > 50) errors.szarmazas = "A származás legfeljebb 50 karakter lehet.";
    const hossz = Number(adat.hossz);
    if (adat.hossz === "" || !Number.isInteger(hossz) || hossz < 1 || hossz > 600) errors.hossz = "A hossz 1 és 600 perc közötti egész szám legyen.";
    if (!["", "fel", "mb"].includes(adat.szinkron)) errors.szinkron = "Érvénytelen nyelv.";
    return { adat, hossz, errors };
}

const urlap = (f) => ({
    filmcim: f.filmcim || "",
    mufaj: f.mufaj || "",
    szarmazas: f.szarmazas || "",
    hossz: f.hossz === undefined ? "" : f.hossz,
    szinkron: f.szinkron || "",
    szines: f.szines === undefined ? true : f.szines
});

// Read: lista
exports.index = async (req, res) => {
    const filmek = await Film.find().sort({ fkod: 1 }).lean();
    res.render("filmek/index", { filmek });
};

// Create: űrlap
exports.ujGet = (req, res) => {
    res.render("filmek/uj", { errors: {}, film: urlap({}) });
};

// Create: mentés
exports.ujPost = async (req, res) => {
    const { adat, hossz, errors } = ellenoriz(req.body);
    if (Object.keys(errors).length > 0) {
        return res.status(422).render("filmek/uj", { errors, film: urlap(adat) });
    }
    const utolso = await Film.findOne().sort({ fkod: -1 }).lean();
    await Film.create({
        fkod: utolso ? utolso.fkod + 1 : 1,
        filmcim: adat.filmcim,
        szines: adat.szines,
        szinkron: adat.szinkron || null,
        szarmazas: adat.szarmazas || null,
        mufaj: adat.mufaj || null,
        hossz
    });
    req.session.message = "A film felvétele sikerült.";
    res.redirect("/filmek");
};

// Update: űrlap
exports.szerkesztGet = async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).render("error", { message: "A film nem található." });
    const film = await Film.findById(req.params.id).lean();
    if (!film) return res.status(404).render("error", { message: "A film nem található." });
    res.render("filmek/szerkeszt", { errors: {}, film: urlap(film), id: film._id });
};

// Update: mentés
exports.szerkesztPost = async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).render("error", { message: "A film nem található." });
    const { adat, hossz, errors } = ellenoriz(req.body);
    if (Object.keys(errors).length > 0) {
        return res.status(422).render("filmek/szerkeszt", { errors, film: urlap(adat), id: req.params.id });
    }
    const film = await Film.findByIdAndUpdate(req.params.id, {
        filmcim: adat.filmcim,
        szines: adat.szines,
        szinkron: adat.szinkron || null,
        szarmazas: adat.szarmazas || null,
        mufaj: adat.mufaj || null,
        hossz
    });
    if (!film) return res.status(404).render("error", { message: "A film nem található." });
    req.session.message = "A film módosítása sikerült.";
    res.redirect("/filmek");
};

// Delete
exports.torles = async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).render("error", { message: "A film nem található." });
    const film = await Film.findByIdAndDelete(req.params.id);
    if (film) await Vetites.deleteMany({ fkod: film.fkod });   // a hozzá tartozó vetítések is törlődnek
    req.session.message = "A film törlése sikerült.";
    res.redirect("/filmek");
};
