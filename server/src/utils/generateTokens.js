import jwt from 'jsonwebtoken';

const generateTokens = (res, userId) => {
  // 1. Create Access Token (Short-lived)
  const accessToken = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '15m'
  });

  // 2. Create Refresh Token (Long-lived)
  const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
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
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });

  return { accessToken, refreshToken };
};

export default generateTokens;
