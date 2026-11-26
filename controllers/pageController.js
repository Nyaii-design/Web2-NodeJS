const Film = require("../models/Film");
const Mozi = require("../models/Mozi");
const Vetites = require("../models/Vetites");

// Főoldal
exports.home = async (req, res) => {
    const [filmDb, moziDb, mufajok] = await Promise.all([
        Film.countDocuments(),
        Mozi.countDocuments(),
        Film.distinct("mufaj")
    ]);
    res.render("home", { filmDb, moziDb, mufajDb: mufajok.filter(Boolean).length });
};

// Adatbázis: a három gyűjtemény (filmek, mozik, vetítések) adatai egy táblázatban
exports.adatbazis = async (req, res) => {
    const mufaj = String(req.query.mufaj || "");
    const szuro = mufaj ? { mufaj } : {};
    const [filmek, vetitesek, mozik, mufajok] = await Promise.all([
        Film.find(szuro).sort({ filmcim: 1 }).lean(),
        Vetites.find().lean(),
        Mozi.find().lean(),
        Film.distinct("mufaj")
    ]);

    const moziNev = {};
    mozik.forEach((m) => { moziNev[m.moziazon] = m.nev; });
    const filmMozik = {};
    vetitesek.forEach((v) => {
        if (!filmMozik[v.fkod]) filmMozik[v.fkod] = [];
        if (moziNev[v.moziazon]) filmMozik[v.fkod].push(moziNev[v.moziazon]);
    });
    filmek.forEach((f) => { f.mozik = (filmMozik[f.fkod] || []).sort((a, b) => a.localeCompare(b, "hu")); });

    res.render("adatbazis", {
        filmek,
        mufaj,
        mufajok: mufajok.filter(Boolean).sort((a, b) => a.localeCompare(b, "hu"))
    });
};

// Diagram: három statisztika az adatbázisból
exports.diagram = async (req, res) => {
    const mufajStat = await Film.aggregate([
        { $match: { mufaj: { $ne: null } } },
        { $group: { _id: "$mufaj", db: { $sum: 1 }, atlag: { $avg: "$hossz" } } }
    ]);

    // 1. filmek száma műfajonként (a 10 leggyakoribb)
    const mufajok = [...mufajStat].sort((a, b) => b.db - a.db).slice(0, 10);

    // 2. a legtöbb filmet játszó mozik
    const moziStat = await Vetites.aggregate([
        { $group: { _id: "$moziazon", db: { $sum: 1 } } },
        { $sort: { db: -1 } },
        { $limit: 10 }
    ]);
    const mozik = await Mozi.find({ moziazon: { $in: moziStat.map((m) => m._id) } }).lean();
    const moziNev = {};
    mozik.forEach((m) => { moziNev[m.moziazon] = m.nev; });

    // 3. átlagos filmhossz műfajonként (legalább 3 filmes műfajok)
    const hosszak = mufajStat.filter((m) => m.db >= 3).sort((a, b) => b.atlag - a.atlag);

    const adatok = {
        mufajCimkek: mufajok.map((m) => m._id),
        mufajAdatok: mufajok.map((m) => m.db),
        moziCimkek: moziStat.map((m) => moziNev[m._id] || `Mozi ${m._id}`),
        moziAdatok: moziStat.map((m) => m.db),
        hosszCimkek: hosszak.map((m) => m._id),
        hosszAdatok: hosszak.map((m) => Math.round(m.atlag))
    };
    // A "<" jel kicserélése, hogy a JSON ne törhesse ki a <script> blokkból
    const json = JSON.stringify(adatok).replace(/</g, "\\u003c");
    res.render("diagram", { json });
};
