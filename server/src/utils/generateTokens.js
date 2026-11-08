import jwt from 'jsonwebtoken';

const generateTokens = (res, userId, tokenVersion = 0) => {
  // 1. Create Access Token (Short-lived: 15 minutes)
  const accessToken = jwt.sign({ userId, tokenVersion }, process.env.JWT_SECRET, {
    expiresIn: '15m'
  });

  // 2. Create Refresh Token (Long-lived: 7 days)
  const refreshToken = jwt.sign({ userId, tokenVersion }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: '7d'
  });

  // 3. Set Access Token as HTTP-Only Cookie
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: true, // Chrome Extensions require secure: true for cross-origin
    sameSite: 'none', // Critical for cross-origin (chrome-extension:// to http://localhost)
    maxAge: 15 * 60 * 1000 // 15 minutes
  });

  // 4. Set Refresh Token as HTTP-Only Cookie
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    path: '/api/auth/refresh',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });

  return { accessToken, refreshToken };
};

export default generateTokens;
