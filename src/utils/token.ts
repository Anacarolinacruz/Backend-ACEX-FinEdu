import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';
import { parseDurationToMs } from './duration';

export interface AccessTokenPayload {
  sub: string; // userId
  sid: string; // sessionId
}

export function signAccessToken(payload: AccessTokenPayload): string {
  const options: SignOptions = { expiresIn: parseDurationToMs(env.JWT_EXPIRES_IN) / 1000 };
  return jwt.sign(payload, env.JWT_SECRET, options);
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, env.JWT_SECRET) as AccessTokenPayload;
}
