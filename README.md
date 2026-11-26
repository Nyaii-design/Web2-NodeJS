[README.md](https://github.com/user-attachments/files/35454098/README.md)
# Moziműsor – Web programozás 2 (NodeJS beadandó)

Szerver oldali webalkalmazás NodeJS-ben (Express, EJS, Mongoose ODM), MongoDB Atlas adatbázissal, a Render.com-on futtatva.

Készítők: Laczkó Imre (QJAWQ), Turcsik Attila (SZZ8AX)

## Funkciók
- Főoldal, Adatbázis (3 gyűjtemény: filmek, mozik, vetitesek; műfaj szerinti szűrés)
- Kapcsolat űrlap (szerver oldali validáció, mentés az adatbázisba)
- Autentikáció: regisztráció, bejelentkezés, kijelentkezés; szerepkörök: látogató, regisztrált látogató (user), admin
- Üzenetek (bejelentkezve, fordított időrendben, küldési idővel)
- Diagram (Chart.js)
- CRUD a filmekhez (csak admin)

## Indítás saját gépen
1. `npm install`
2. A `.env.example` fájlt másold `.env` névre, és írd be a MongoDB Atlas kapcsolati adatokat
3. `npm start`, majd böngészőben: http://localhost:3000

Az első indításkor az alkalmazás magától feltölti az adatbázist a `data` mappában lévő forrásfájlokból, és létrehozza az `admin` és a `user` felhasználót.

## Render beállítások
- Build Command: `npm install`
- Start Command: `node app.js`
- Environment változók: `MONGO_URI`, `DB_NAME`, `SESSION_SECRET`, `ADMIN_PASSWORD`, `USER_PASSWORD`

A jelszavak nem kerülnek a GitHubra (`.env` a `.gitignore`-ban van).
