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
const { Logger } = require('./Logger'); // Logger
const { StatusPages } = require('./StatusPages'); // Custom StatusPages

/*
Logger
*/
const logger = new Logger(process.env.LOG);

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
    db.run("INSERT INTO users (username, password, groups) VALUES (?, ?, ?)", ["tester", hash, 'User'], (err) => {
        if (err) {
            logger.log('INFO', 'DB', 'test-user all ready exists');
        }
    });
});
bcrypt.hash('testpassword', 10, (err, hash) => {
    db.run("INSERT INTO users (username, password, groups) VALUES (?, ?, ?)", ["tester2", hash, 'User, Admin'], (err) => {
        if (err) {
            logger.log('INFO', 'DB', 'test-user all ready exists');
        }
    });
});


/*
Express Server
*/
const app = express();
app.use(express.json());
app.use(express.text());
app.use(express.urlencoded());
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
// public Startseite
app.get('/', async (req, res) => {
    if (req.isAuthenticated()) {
        res.redirect('/home');
        res.end();
    } else {
        res.redirect('index.html');
        res.end();
    }
})

// Login-Vorgang
app.post('/login',
    passport.authenticate('local', { failureRedirect: '/index.html?wrong=true' }),
    (req, res) => {
        res.cookie('sessionID', req.sessionID);
        res.redirect('/home');
    }
);

//Logout-Vorgang
app.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            logger.log('ERROR', 'SERVER LOGOUT', err)
        } else {
            req.session.destroy();
            res.clearCookie('sessionID');
            res.send('Logout erfolgreich');
        }
    });
});

/*
Protected Path's
*/
// protected Startseite
app.get('/home', async (req, res, next) => {
    if (req.isAuthenticated() == true) {
        if (req.user.groups.includes('Admin') == true) { // Is User a Admin?
            res.sendFile(`${process.env.PROTECTED}/admin.html`);
        } else if (req.user.groups.includes('Lehrer') == true) { // Is User a Teacher?
            res.sendFile(`${process.env.PROTECTED}/lehrer.html`);
        } else if (req.user.groups.includes('User') == true) { // Is User a User?
            res.sendFile(`${process.env.PROTECTED}/user.html`);
        } else { // Unauthorized, because this path is only for Users
            res.status(403).send(new StatusPages().http403());
        }
    } else {
        res.status(403).send(new StatusPages().http403());
    }
});

app.get('/wahlen/:id', async (req, res) => {
    if (req.isAuthenticated() == true) {
        if (req.params.id == 'all') {
            res.send(await adb.allAsync('SELECT * FROM users'));
        } else {
            res.send(await adb.getAsync('SELECT * FROM users WHERE id = ?', req.params.id));
        }
    } else {
        res.status(403).send(new StatusPages().http403());
    }
});

/*
Express Static
*/
app.use(express.static(process.env.STATIC));

/*
Custom Error Pages
*/
app.use((req, res, next) => {
    res.status(404).send(new StatusPages().http404());
});

/*
Express Listen
*/
app.listen(process.env.PORT, () => {
    logger.log("INFO", 'SERVER', `Server gestartet auf Port ${process.env.PORT}`);
});
