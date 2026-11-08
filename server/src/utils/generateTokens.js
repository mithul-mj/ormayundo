import jwt from 'jsonwebtoken';
import { AUTH_COOKIES, TOKEN_EXPIRY } from './constants.js';

const generateTokens = (res, userId, tokenVersion = 0) => {
  // 1. Create Access Token (Short-lived)
  const accessToken = jwt.sign({ userId, tokenVersion }, process.env.JWT_SECRET, {
    expiresIn: TOKEN_EXPIRY.ACCESS_TOKEN_JWT
  });

  // 2. Create Refresh Token (Long-lived with rotation)
  const refreshToken = jwt.sign({ userId, tokenVersion }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: TOKEN_EXPIRY.REFRESH_TOKEN_JWT
  });

  // 3. Set Access Token as HTTP-Only Cookie
  res.cookie(AUTH_COOKIES.ACCESS_TOKEN, accessToken, {
    httpOnly: true,
    secure: true, // Cross-origin compatibility for Chrome Extension and Web
    sameSite: 'none',
    maxAge: TOKEN_EXPIRY.ACCESS_TOKEN_MS
  });

  // 4. Set Refresh Token as HTTP-Only Cookie
  res.cookie(AUTH_COOKIES.REFRESH_TOKEN, refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    path: '/api/auth/refresh',
    maxAge: TOKEN_EXPIRY.REFRESH_TOKEN_MS
  });

  return { accessToken, refreshToken };
};

export default generateTokens;
