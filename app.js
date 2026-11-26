require("dotenv").config();
const path = require("path");
const express = require("express");
const session = require("express-session");
const connectMongo = require("connect-mongo");
const MongoStore = connectMongo.MongoStore || connectMongo.default || connectMongo;
const connectDB = require("./config/db");
const seed = require("./utils/seed");
const csrf = require("./middleware/csrf");

const app = express();

app.set("trust proxy", 1);                       // a Render fordított proxy mögött fut
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.use(session({
    secret: process.env.SESSION_SECRET || "fejlesztoi-titok",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 },     // 1 nap
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI,
        dbName: process.env.DB_NAME || "mozi",
        collectionName: "sessions"
    })
}));

// A sablonok így érik el a bejelentkezett felhasználót és a rövid üzeneteket
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    res.locals.message = req.session.message || "";
    req.session.message = "";
    next();
});

app.use(csrf);
app.use("/", require("./routes/mainRouter"));

app.use((req, res) => {
    res.status(404).render("error", { message: "A keresett oldal nem található." });
});

// Hibakezelő
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).render("error", { message: "Szerverhiba történt. Kérjük, próbálja újra később." });
});

const port = process.env.PORT || 3000;

connectDB()
    .then(seed)
    .then(() => {
        app.listen(port, "0.0.0.0", () => console.log(`A szerver fut: http://localhost:${port}`));
    })
    .catch((err) => {
        console.error("Indítási hiba:", err);
        process.exit(1);
    });
