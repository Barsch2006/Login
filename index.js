const express = require('express');
const passport = require('passport');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');

// Initialisierung der Datenbankverbindung
const db = new sqlite3.Database('./sqlite.db');
db.serialize(function () {
  db.run("CREATE TABLE users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, password TEXT)");
  bcrypt.hash('testpassword', 10, function (err, hash) {
    db.run("INSERT INTO users (username, password) VALUES (?, ?)", "testuser", hash);
  });
});

// Initialisierung des Express-Servers
const app = express();

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

// Konfiguration der Session- und Passport-Authentifizierung
app.use(session({
  store: new SQLiteStore({
    db: db,
    table: 'sessions',
    ttl: 86400 // Session-TTL von einem Tag (in Sekunden)
  }),
  secret: 'geheimnis',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

// Konfiguration der Passport-Strategie (hier wird die lokale Strategie verwendet)
const LocalStrategy = require('passport-local').Strategy;
passport.use(new LocalStrategy(
  function (username, password, done) {
    db.get("SELECT * FROM users WHERE username = ?", username, function (err, row) {
      if (err) { return done(err); }
      if (!row) { return done(null, false); }
      bcrypt.compare(password, row.password, function (err, res) {
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
passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  db.get("SELECT * FROM users WHERE id = ?", id, function (err, row) {
    if (err) { return done(err); }
    done(null, row);
  });
});

// Routen-Handler für den Login-Vorgang
app.post('/login',
  passport.authenticate('local'),
  function (req, res) {
    res.cookie('sessionID', req.sessionID);
    res.send('Login erfolgreich');
  }
);

// Routen-Handler für den Logout-Vorgang
app.get('/logout', function (req, res) {
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

// Routen-Handler für geschützte Ressourcen
app.get('/geschuetzt',
  function (req, res) {
    if (req.isAuthenticated()) {
      res.send('Zugriff auf geschützte Ressource gewährt');
    } else {
      res.redirect('/login');
    }
  }
);

app.use(express.static('C:/Users/Sabine/Desktop/Login/frontend'))

// Starten des Servers
app.listen(3000, function () {
  console.log('Server gestartet auf Port 3000');
});
