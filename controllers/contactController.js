const Message = require("../models/Message");

exports.kapcsolatGet = (req, res) => {
    res.render("kapcsolat", { errors: {}, old: {} });
};

// Szerver oldali validáció, majd mentés az adatbázisba
exports.kapcsolatPost = async (req, res) => {
    const old = {
        name: String(req.body.name || "").trim(),
        email: String(req.body.email || "").trim(),
        subject: String(req.body.subject || "").trim(),
        message: String(req.body.message || "").trim()
    };
    const errors = {};

    if (old.name.length < 3 || old.name.length > 100) errors.name = "A név 3 és 100 karakter között legyen.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(old.email) || old.email.length > 150) errors.email = "Adjon meg érvényes e-mail címet (legfeljebb 150 karakter).";
    if (old.subject.length < 3 || old.subject.length > 150) errors.subject = "A tárgy 3 és 150 karakter között legyen.";
    if (old.message.length < 10 || old.message.length > 2000) errors.message = "Az üzenet 10 és 2000 karakter között legyen.";

    if (Object.keys(errors).length > 0) {
        return res.status(422).render("kapcsolat", { errors, old });
    }

    await Message.create(old);
    req.session.message = "Köszönjük, az üzenetét megkaptuk!";
    res.redirect("/kapcsolat");
};

// Üzenetek: a legfrissebb legyen elől
exports.uzenetek = async (req, res) => {
    const uzenetek = await Message.find().sort({ createdAt: -1 }).lean();
    uzenetek.forEach((u) => {
        u.ido = new Date(u.createdAt).toLocaleString("sv-SE", { timeZone: "Europe/Budapest" });
    });
    res.render("uzenetek", { uzenetek });
};
