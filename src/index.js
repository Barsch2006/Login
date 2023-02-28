/*
Imports
*/
require('dotenv').config();
const express = require('express');
const passport = require('passport');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const { AsyncDB } = require('./AsyncDB'); // Async Database
const { Logger } = require('./Logger') // Logger

/*
Logger
*/
const logger = new Logger(process.env.LOG)

/*
Database
*/
const db = new sqlite3.Database(process.env.DB ?? './db.sqlite');
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users(
        id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL UNIQUE,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        groups TEXT NOT NULL
    )`);

    logger.log('INFO', 'DB', 'DB serialized');
});
const adb = new AsyncDB(db); // Implement AsyncDB

bcrypt.hash('testpassword', 10, (err, hash) => {
    db.run("INSERT INTO users (username, password) VALUES (?, ?)", ["tester", hash], (err) => {
        if (err) {
            console.log('test-user all ready exists')
        }
    });
});

/*
Express Server
*/
const app = express();
app.use(express.json())
app.use(express.text())
app.use(express.urlencoded())
// Konfiguration der Session- und Passport-Authentifizierung
app.use(session({
    store: new SQLiteStore({
        db: process.env.DB ?? './db.sqlite',
        table: 'sessions',
        ttl: 86400 // Session-TTL von einem Tag (in Sekunden)
    }),
    secret: process.env.SESSION_SECRET ?? undefined,
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

/*
Passport.js Konfiguration
*/
// Konfiguration der Passport-Strategie (hier wird die lokale Strategie verwendet)
const LocalStrategy = require('passport-local').Strategy;
passport.use(new LocalStrategy(
    (username, password, done) => {
        db.get("SELECT * FROM users WHERE username = ?", username, (err, row) => {
            if (err) { return done(err); }
            if (!row) { return done(null, false); }
            bcrypt.compare(password, row.password, (err, res) => {
                if (res === true) {
                    return done(null, row);
                } else {
                    return done(null, false);
                }
            });
        });
    }
));
// Konfiguration der Passport-Serialisierung (hier wird die Benutzer-ID serialisiert)
passport.serializeUser((user, done) => {
    done(null, user.id);
});
passport.deserializeUser((id, done) => {
    db.get("SELECT * FROM users WHERE id = ?", id, (err, row) => {
        if (err) { return done(err); }
        done(null, row);
    });
});

/*
Express Router Listener
*/
//Login-Vorgang
app.get('/', async (req, res) => {
    if (req.isAuthenticated()) {
        res.statusCode = 302;
        res.setHeader('Location', '/geschuetzt')
        res.end()
    } else {
        res.statusCode = 302;
        res.setHeader('Location', 'index.html')
        res.end()
    }
})

app.post('/login',
    passport.authenticate('local', { failureRedirect: '/index.html?wrong=true' }),
    (req, res) => {
        res.cookie('sessionID', req.sessionID);
        res.send('Login erfolgreich');
    }
);

//Logout-Vorgang
app.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            console.error(err)
        } else {
            req.session.destroy();
            res.clearCookie('sessionID');
            res.send('Logout erfolgreich');
        }
    });
});

//geschützte Ressourcen
app.get('/geschuetzt',
    async (req, res) => {
        if (req.isAuthenticated()) {
            res.send('Zugriff auf geschützte Ressource gewährt');
        } else {
            res.redirect('/');
        }
    }
);

/*
Express Static
*/
app.use(express.static(process.env.STATIC));

/*
Custom Error Pages
*/
// 404
app.use((req, res, next) => {
    res.status(404).send(`
  <!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>404 Not Found</title>
    <link rel="icon" href="logo.ico" type="image/x-icon">

    <link rel="stylesheet" href="style.css">

    <script src="index.js" defer></script>
</head>

<body>
    <section class="fixed-header">
        <div>
            <p>
                Gymnasium Riedberg
            </p>
        </div>
    </section>
    <header>
        <div onclick="window.location='/'">
            <img src="logo.ico" alt="Logo">
            <h1 class="onHideMobile">Gymnasium Riedberg - </h1>
            <h1>Wahltool</h1>
        </div>
    </header>

    <main>
        <section class="error_screen">
            <h1>404 Not Found</h1>
            <p>Der angegebene Pfad konnte nicht gefunden werden</p>
        </section>
    </main>

    <footer>
        <a href="impressum.html">Impressum</a>
        <a href="policy.html">Datenschutz</a>
    </footer>
</body>

</html>
`);
});
// 403
app.use((req, res, next) => {
    res.status(403).send(`
  <!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>403 Kein Zugriff</title>
    <link rel="icon" href="logo.ico" type="image/x-icon">

    <link rel="stylesheet" href="style.css">

    <script src="index.js" defer></script>
</head>

<body>
    <section class="fixed-header">
        <div>
            <p>
                Gymnasium Riedberg
            </p>
        </div>
    </section>
    <header>
        <div onclick="window.location='/'">
            <img src="logo.ico" alt="Logo">
            <h1 class="onHideMobile">Gymnasium Riedberg - </h1>
            <h1>Wahltool</h1>
        </div>
    </header>

    <main>
        <section class="error_screen">
            <h1>403 Kein Zugriff</h1>
            <p>Sie haben auf diesen Inhalt keinen Zugriff</p>
        </section>
    </main>

    <footer>
        <a href="impressum.html">Impressum</a>
        <a href="policy.html">Datenschutz</a>
    </footer>
</body>

</html>
`);
});

/*
Express Listen
*/
app.listen(process.env.PORT, () => {
    logger.log("INFO", 'SERVER', `Server gestartet auf Port ${process.env.PORT}`);
});