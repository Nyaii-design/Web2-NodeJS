const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const Film = require("../models/Film");
const Mozi = require("../models/Mozi");
const Vetites = require("../models/Vetites");
const User = require("../models/User");

// Tabulátorral tagolt forrásfájl beolvasása (az első sor a fejléc)
function beolvas(fajl) {
    const szoveg = fs.readFileSync(path.join(__dirname, "..", "data", fajl), "utf8").replace(/^﻿/, "");
    const sorok = szoveg.split(/\r?\n/).filter((s) => s.trim() !== "");
    const fejlec = sorok.shift().split("\t").map((s) => s.trim());
    return sorok.map((sor) => {
        const mezok = sor.split("\t");
        const obj = {};
        fejlec.forEach((nev, i) => { obj[nev] = (mezok[i] || "").trim(); });
        return obj;
    });
}

const nullHaUres = (s) => (s === "" ? null : s);

// Első indításkor feltölti az üres gyűjteményeket, és létrehozza az admin és a teszt felhasználót.
async function seed() {
    if ((await Film.countDocuments()) === 0) {
        const filmek = beolvas("film.txt").map((r) => ({
            fkod: Number(r.fkod),
            filmcim: r.filmcim,
            // a forrásban az igaz érték -1 (Access logikai mező)
            szines: r.szines === "-1" || r.szines === "1",
            szinkron: nullHaUres(r.szinkron),
            szarmazas: nullHaUres(r.szarmazas),
            mufaj: nullHaUres(r.mufaj),
            hossz: Number(r.hossz) || 0
        }));
        await Film.insertMany(filmek);
        console.log(`Feltöltve: ${filmek.length} film.`);
    }

    if ((await Mozi.countDocuments()) === 0) {
        const mozik = beolvas("mozi.txt").map((r) => ({
            moziazon: Number(r.moziazon),
            nev: r.mozinev,
            irszam: r.irszam,
            cim: r.cim,
            telefon: nullHaUres(r.telefon)
        }));
        await Mozi.insertMany(mozik);
        console.log(`Feltöltve: ${mozik.length} mozi.`);
    }

    if ((await Vetites.countDocuments()) === 0) {
        const vetitesek = beolvas("hely.txt").map((r) => ({
            fkod: Number(r.fkod),
            moziazon: Number(r.moziazon)
        }));
        await Vetites.insertMany(vetitesek);
        console.log(`Feltöltve: ${vetitesek.length} vetítés.`);
    }

    const felhasznalok = [
        { username: "admin", password: process.env.ADMIN_PASSWORD || "admin12345", role: "admin" },
        { username: "user", password: process.env.USER_PASSWORD || "user12345", role: "user" }
    ];
    for (const f of felhasznalok) {
        if (!(await User.findOne({ username: f.username }))) {
            await User.create({ username: f.username, password: await bcrypt.hash(f.password, 10), role: f.role });
            console.log(`Létrehozva: ${f.username} felhasználó.`);
        }
    }
}

module.exports = seed;
