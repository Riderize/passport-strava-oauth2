const util = require('util');
const { OAuth2Strategy } = require('passport-oauth2');
const { InternalOAuthError } = require('passport-oauth2');

/**
 *
 *
 *
 *
 * Options:
 *  - `clientID`      your Strava application's client id
 *  - `clientSecret`  your Strava application's client secret
 *  - `callbackURL`   URL to which Strava will redirect the user after granting authorization
 *
 * Examples:
 *    passport.use(new StravaStrategy({
 *         clientID: '123-456-789',
 *         clientSecret: 'shhh-its-a-secret'
 *         callbackURL: 'https://www.example.net/auth/strava/callback'
 *       },
 *       function(accessToken, refreshToken, profile, done) {
 *         User.findOrCreate(..., function (err, user) {
 *           done(err, user);
 *         });
 *       }
 *     ));
 *
 * @param {Object} options
 * @param {Function} verify
 * @api public
 */
function Strategy(options, verify) {
  options = options || {};
  options.authorizationURL =
    options.authorizationURL || 'https://www.strava.com/oauth/authorize';
  options.tokenURL = options.tokenURL || 'https://www.strava.com/oauth/token';

  OAuth2Strategy.call(this, options, verify);
  this.name = 'strava';
}

/**
 * Inherit from `OAuth2Strategy`
 */
util.inherits(Strategy, OAuth2Strategy);

/**
 * Retrieve authenticated user profile
 *
 * @param {String} accessToken
 * @param {Function} done
 * @api protected
 */
Strategy.prototype.userProfile = (accessToken, done) => {
  this._oauth2.get(
    'https://www.strava.com/api/v3/athlete',
    accessToken,
    function (error, body, _) {
      if (error) {
        return done(new InternalOAuthError('Unable to get user info', error));
      }

      try {
        const json = JSON.parse(body);

        const profile = { provider: 'strava' };
        if (json.id) {
          profile.id = json.id;
          profile.fullName = `${json.firstname} ${json.lastname}`;
          profile.name = {
            familyName: json.lastname,
            givenName: json.firstname,
          };
          profile.photos = [
            { value: json.profile },
            { value: json.profile_medium },
          ];
          profile.token = accessToken;
        }

        profile._raw = body;
        profile._json = json;

        done(null, profile);
      } catch (err) {
        done(err);
      }
    }
  );
};

module.exports = Strategy;
