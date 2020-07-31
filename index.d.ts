import passport = require('passport');
import express = require('express');

export interface Profile extends passport.Profile {
  id: string;
  fullName: string;
  name: {
    familyName: string;
    givenName: string;
  }
  photos?: Array<{
    value: string;
  }>
  token?: string;

  _raw: string;
  _json: any;
}

export interface StrategyOption {
  clientID: string;
  clientSecret: string;
  callbackURL: string;

  authorizationURL?: string;
  tokenURL?: string;
  profileURL?: string;
}


export type VerifyFunction = (accessToken: string, refreshToken: string, profile: Profile, done: (error: any, user?: any, info?: any) => void) => void;

export class Strategy implements passport.Strategy {
  constructor(options: StrategyOption, verify: VerifyFunction);

  name: string;
  authenticate(req: express.Request, options?: object): void;
}
