const { expect } = require('chai');
const strategy = require('..');

describe('passport-strava', () => {
  it('should export Strategy constructor', () => {
    expect(strategy.Strategy).to.be.a('function');
  });

  it('should export Strategy constructor as module', () => {
    expect(strategy).to.be.a('function');
    expect(strategy).to.equal(strategy.Strategy);
  });
});
