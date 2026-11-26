const bcrypt = require("bcryptjs");
const User = require("../models/User");

exports.registerGet = (req, res) => {
    res.render("register", { errors: {}, old: {} });
};

exports.registerPost = async (req, res) => {
    const username = String(req.body.username || "").trim();
    const password = String(req.body.password || "");
    const password2 = String(req.body.password2 || "");
    const errors = {};

    if (username.length < 3 || username.length > 30) errors.username = "A felhasználónév 3 és 30 karakter között legyen.";
    else if (!/^[A-Za-z0-9_.-]+$/.test(username)) errors.username = "Csak betű, szám, pont, kötőjel és alsó vonal használható.";
    if (password.length < 6) errors.password = "A jelszó legalább 6 karakter legyen.";
    if (password !== password2) errors.password2 = "A két jelszó nem egyezik.";

    if (!errors.username && (await User.findOne({ username }))) {
        errors.username = "Ez a felhasználónév már foglalt.";
    }
    if (Object.keys(errors).length > 0) {
        return res.status(422).render("register", { errors, old: { username } });
    }

    const hash = await bcrypt.hash(password, 10);
    await User.create({ username, password: hash, role: "user" });   // az új felhasználó mindig sima "user"
    req.session.message = "Sikeres regisztráció! Most már bejelentkezhet.";
    res.redirect("/login");
};

exports.loginGet = (req, res) => {
    res.render("login", { error: "", old: {} });
};

exports.loginPost = async (req, res) => {
    const username = String(req.body.username || "").trim();
    const password = String(req.body.password || "");
    const user = await User.findOne({ username });
    const ok = user ? await bcrypt.compare(password, user.password) : false;
    if (!ok) {
        return res.status(401).render("login", { error: "Hibás felhasználónév vagy jelszó.", old: { username } });
    }
    req.session.user = { id: String(user._id), username: user.username, role: user.role };
    req.session.message = "Sikeres bejelentkezés.";
    res.redirect("/");
};

exports.logout = (req, res) => {
    req.session.destroy(() => res.redirect("/"));
};
