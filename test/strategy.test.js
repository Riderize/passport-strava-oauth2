const chai = require('chai');
const { expect } = require('chai');
const StravaStrategy = require('../lib/strategy');

describe('Strategy', () => {
  describe('constructed', () => {
    const strategy = new StravaStrategy(
      {
        clientID: 'ABC123',
        clientSecret: 'secret',
      },
      () => {}
    );

    it('should be named strava', () => {
      expect(strategy.name).to.equal('strava');
    });
  });

  describe('constructed with undefined options', () => {
    it('should throw', () => {
      expect(() => {
        // eslint-disable-next-line no-new
        new StravaStrategy(undefined, () => {});
      }).to.throw(Error);
    });
  });

  describe('failure caused by user denying request', () => {
    const strategy = new StravaStrategy(
      {
        clientID: 'ABC123',
        clientSecret: 'secret',
      },
      () => {}
    );

    let info;

    before(done => {
      chai.passport
        .use(strategy)
        .fail(i => {
          info = i;
          done();
        })
        .req(req => {
          req.query = {};
          req.query.error = 'access_denied';
          req.query.error_code = '200';
          req.query.error_description = 'Permissions error';
          req.query.error_reason = 'user_denied';
        })
        .authenticate();
    });

    it('should fail with info', () => {
      // eslint-disable-next-line no-unused-expressions
      expect(info).not.to.be.undefined;
      expect(info.message).to.equal('Permissions error');
    });
  });

  describe('error caused by invalid code sent to token endpoint (note: error format does not conform to OAuth 2.0 specification)', function () {
    const strategy = new StravaStrategy(
      {
        clientID: 'ABC123',
        clientSecret: 'secret',
      },
      () => {}
    );

    strategy._oauth2.getOAuthAccessToken = (code, options, callback) => {
      return callback({
        statusCode: 400,
        data:
          '{"error":{"message":"Invalid verification code format.","type":"OAuthException","code":100,"fbtrace_id":"XXxx0XXXxx0"}}',
      });
    };

    let err;

    before(done => {
      chai.passport
        .use(strategy)
        .error(e => {
          err = e;
          done();
        })
        .req(req => {
          req.query = {};
          req.query.code = 'SplxlOBeZQQYbYS6WxSbIA+ALT1';
        })
        .authenticate();
    });

    it('should error', () => {
      expect(err.constructor.name).to.equal('TokenError');
      expect(err.code.message).to.equal('Invalid verification code format.');
      expect(err.code.type).to.equal('OAuthException');
      expect(err.code.code).to.equal(100);
      // eslint-disable-next-line no-unused-expressions
      expect(err.subcode).to.be.undefined;
      expect(err.code.fbtrace_id).to.equal('XXxx0XXXxx0');
    });
  });

  describe('error caused by invalid code sent to token endpoint (note: error format conforms to OAuth 2.0 specification, though this is not the current behavior of the Facebook implementation)', function () {
    const strategy = new StravaStrategy(
      {
        clientID: 'ABC123',
        clientSecret: 'secret',
      },
      () => {}
    );

    // inject a "mock" oauth2 instance
    strategy._oauth2.getOAuthAccessToken = (code, options, callback) => {
      return callback({
        statusCode: 400,
        data:
          '{"error":"invalid_grant","error_description":"The provided value for the input parameter \'code\' is not valid."} ',
      });
    };

    let err;

    before(done => {
      chai.passport
        .use(strategy)
        .error(e => {
          err = e;
          done();
        })
        .req(req => {
          req.query = {};
          req.query.code = 'SplxlOBeZQQYbYS6WxSbIA+ALT1';
        })
        .authenticate();
    });

    it('should error', () => {
      expect(err.constructor.name).to.equal('TokenError');
      expect(err.message).to.equal(
        "The provided value for the input parameter 'code' is not valid."
      );
      expect(err.code).to.equal('invalid_grant');
    });
  }); // error caused by invalid code sent to token endpoint

  describe('Strategy#userProfile', () => {
    describe('fetched from default endpoint', () => {
      const strategy = new StravaStrategy(
        {
          clientID: 'ABC123',
          clientSecret: 'secret',
        },
        () => {}
      );

      strategy._oauth2.get = (url, accessToken, callback) => {
        if (url !== 'https://www.strava.com/api/v3/athlete') {
          return callback(new Error('incorrect url argument'));
        }
        if (accessToken !== 'token') {
          return callback(new Error('incorrect token argument'));
        }

        const body =
          '{"id":"60121955","firstname":"Edilson","lastname":"da Silva","username":"edilsonsilva","gender":"M"}';
        callback(null, body, undefined);
      };

      let profile;

      before(done => {
        strategy.userProfile('token', (err, p) => {
          if (err) {
            return done(err);
          }
          profile = p;
          done();
        });
      });

      it('should parse profile', () => {
        expect(profile.provider).to.equal('strava');

        expect(profile.id).to.equal('60121955');
        expect(profile.fullName).to.equal('Edilson da Silva');
        expect(profile.name.familyName).to.equal('da Silva');
        expect(profile.name.givenName).to.equal('Edilson');
        expect(profile.token).to.equal('token');
        // eslint-disable-next-line no-unused-expressions
        expect(profile.photos[0].value).to.be.undefined;
        // eslint-disable-next-line no-unused-expressions
        expect(profile.photos[1].value).to.be.undefined;
      });

      it('should set raw property', () => {
        expect(profile._raw).to.be.a('string');
      });

      it('should set json property', () => {
        expect(profile._json).to.be.an('object');
      });
    }); // fetched from default endpoint
  });
});
