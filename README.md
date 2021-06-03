# Passport Strava Oauth2

![Build Badge](https://img.shields.io/circleci/build/github/Riderize/passport-strava-oauth2/master)
![License](https://img.shields.io/npm/l/@riderize/passport-strava-oauth2)
![NPM bundled Badge](https://img.shields.io/bundlephobia/min/@riderize/passport-strava-oauth2/1.0.10)
![NPM version Badge](https://img.shields.io/npm/v/@riderize/passport-strava-oauth2)

[Strava](https://www.strava.com/) authentication strategy for [Passport](http://www.passportjs.org/) and Node.js.

As base I used [Passport-Facebook](https://github.com/jaredhanson/passport-facebook). I just made a few changes to display the data that comes from Strava.

This lib aims to make it easier the Strava authentication with Nodejs apps. By plugging into Passport, Strava authentication can be easily and unobtrusively integrated into any application or framework that supports Connect-style middleware, including Express.

## Install

```
$ npm i @riderize/passport-strava-oauth2
```

## Usage

### Configure Strategy

Strava uses the OAuth2 strategy in order to authenticate the users. This strategy requires a callback, that receives these credentials and calls `done` returning the data of the user logged in as well as options to specify the `Client ID`, `Client Secret` and `Callback URL`.

In order to obtain a Client ID and Client Secret first you have to register an app at Strava.

**Basic config:**

```
const StravaStrategy = require('@riderize/passport-strava-oauth2').Strategy;

passport.use(new StravaStrategy({
    clientID: STRAVA_CLIENT_ID,
    clientSecret: STRAVA_CLIENT_SECRET,
    callbackURL: "http://127.0.0.1:3000/auth/strava/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    User.findOrCreate({ stravaId: profile.id }, function (err, user) {
      return done(err, user);
    });
  }
));
```

**With Typescript:**

```
import strategy from '@riderize/passport-strava-oauth2';

const StravaStrategy = strategy.Strategy;

passport.use(new StravaStrategy({
    clientID: STRAVA_CLIENT_ID,
    clientSecret: STRAVA_CLIENT_SECRET,
    callbackURL: "http://127.0.0.1:3000/auth/strava/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    User.findOrCreate({ stravaId: profile.id }, function (err, user) {
      return done(err, user);
    });
  }
));
```

## Types

- The types of this lib are now on [@types/riderize\_\_passport-strava-oauth2](https://www.npmjs.com/package/@types/riderize__passport-strava-oauth2)

## Acknowledgments

- To [Jared Hanson](https://github.com/jaredhanson) for making [Passport](http://www.passportjs.org/) possible.

## License

[The MIT License](https://opensource.org/licenses/MIT)
