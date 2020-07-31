const express = require('express');
const passport = require('passport');
const StravaStrategy = require('@riderize/passport-strava-oauth2').Strategy;

// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.  However, since this example does not
//   have a database of user records, the complete Strava profile is
//   serialized and deserialized.
passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (obj, done) {
  done(null, obj);
});

// Use the StravaStrategy within Passport.
//   Strategies in Passport require a `verify` function, which accept
//   credentials (in this case, an accessToken, refreshToken, and Strava
//   profile), and invoke a callback with a user object.
passport.use(
  new StravaStrategy(
    {
      clientID: process.env.STRAVA_CLIENT_ID,
      clientSecret: process.env.STRAVA_CLIENT_SECRET,
      callbackURL: process.env.STRAVA_CALLBACK,
    },
    async function (accessToken, refreshToken, profile, done) {
      console.log(profile);
      return done(null, profile);
    }
  )
);

const app = express();

app.use(passport.initialize());
app.use(passport.session());

// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}

app.get('/', function (req, res) {
  res.render('index', { user: req.user });
});

app.get('/account', ensureAuthenticated, function (req, res) {
  res.render('account', { user: req.user });
});

app.get('/login', function (req, res) {
  res.render('login', { user: req.user });
});

// GET /auth/strava
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in Strava authentication will involve
//   redirecting the user to strava.com.  After authorization, Strava
//   will redirect the user back to this application at /auth/strava/callback
app.get(
  '/auth/strava',
  passport.authenticate('strava', {
    scope: ['profile:read_all,activity:read_all'],
  })
);

// GET /auth/strava/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
app.get(
  '/auth/strava/callback',
  passport.authenticate('strava', {
    failureRedirect: '/login',
    successRedirect: '/',
  })
);

app.get('/logout', function (req, res) {
  req.logout();
  res.redirect('/');
});

app.listen(4000);
