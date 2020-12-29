const { inherits } = require('util');
const OAuth2Strategy = require('passport-oauth2');
const InternalOAuthError = require('passport-oauth2');

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
 * @constructor
 * @param {object} options
 * @param {Function} verify
 * @access public
 */
function Strategy(options, verify) {
  options = options || {};
  options.authorizationURL =
    options.authorizationURL || 'https://www.strava.com/oauth/authorize';
  options.tokenURL = options.tokenURL || 'https://www.strava.com/oauth/token';

  OAuth2Strategy.call(this, options, verify);
  this.name = 'strava';
  this._userProfileURL =
    options.userProfileURL || 'https://www.strava.com/api/v3/athlete';
}

/**
 * Inherit from `OAuth2Strategy`
 */
inherits(Strategy, OAuth2Strategy);

/**
 * Retrieve authenticated user profile
 *
 * @param {String} accessToken
 * @param {Function} done
 * @access protected
 */
Strategy.prototype.userProfile = function (accessToken, done) {
  this._oauth2.get(this._userProfileURL, accessToken, function (
    error,
    body,
    _
  ) {
    if (error) {
      return done(new InternalOAuthError('Unable to get user info', error));
    }

    try {
      const json = JSON.parse(body);

      const profile = { provider: 'strava' };
      if (json.id) {
        profile.id = json.id;
        profile.displayName = `${json.firstname} ${json.lastname}`;
        
        // This should be deprecated in future release.
        profile.fullName = profile.displayName;
        
        profile.name = {
          familyName: json.lastname,
          givenName: json.firstname,
        };
        profile.photos = [
          { value: json.profile },
          { value: json.profile_medium },
        ];
        
        if (json.sex === 'M') {
          profile.gender = 'male';
        } else if (json.sex === 'F') {
          profile.gender = 'female';
        }
      }

      profile._raw = body;
      profile._json = json;

      done(null, profile);
    } catch (err) {
      done(err);
    }
  });
};

// Expose constructor
module.exports = Strategy;
