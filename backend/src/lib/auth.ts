import jwt from 'jsonwebtoken';

export const AUTH_COOKIE_NAME = 'sa_web_auth';
const AUTH_TOKEN_TTL_SECONDS = 60 * 60 * 8;

export interface AuthTokenPayload {
  sub: string;
  usuarioId: number;
}

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET nao configurado.');
  }
  return secret;
};

export const signAuthToken = (payload: AuthTokenPayload) =>
  jwt.sign(payload, getJwtSecret(), { expiresIn: AUTH_TOKEN_TTL_SECONDS });

export const verifyAuthToken = (token: string) =>
  jwt.verify(token, getJwtSecret()) as AuthTokenPayload;

export const getAuthCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: AUTH_TOKEN_TTL_SECONDS * 1000,
  path: '/'
});
