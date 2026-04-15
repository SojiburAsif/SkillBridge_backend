
import jwt, { SignOptions } from 'jsonwebtoken';
import { Response } from 'express';
import { envConfig } from '../config/env';


export const getAccessToken = (payload: object) => {
  return jwt.sign(
    payload,
    envConfig.jwt_access_secret,
    {
      expiresIn: envConfig.jwt_access_expires_in as any,
    } as SignOptions
  );
};


export const getRefreshToken = (payload: object) => {
  return jwt.sign(
    payload,
    envConfig.jwt_refresh_secret,
    {
      expiresIn: envConfig.jwt_refresh_expires_in as any,
    } as SignOptions
  );
};

export const setAccessTokenCookie = (res: Response, token: string) => {
  res.cookie('accessToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000, // 15 minutes
  });
};

export const setRefreshTokenCookie = (res: Response, token: string) => {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};