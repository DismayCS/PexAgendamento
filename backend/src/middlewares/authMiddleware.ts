import type { NextFunction, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { AUTH_COOKIE_NAME, verifyAuthToken } from '../lib/auth';

export interface AuthenticatedRequest extends Request {
  authUserId?: number;
}

export const requireAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const token = req.cookies?.[AUTH_COOKIE_NAME];
  if (!token) {
    return res.status(401).json({ message: 'Nao autenticado.' });
  }

  try {
    const payload = verifyAuthToken(token);
    const user = await prisma.usuario.findUnique({
      where: { id: payload.usuarioId },
      select: { id: true }
    });

    if (!user) {
      return res.status(401).json({ message: 'Sessao invalida.' });
    }

    req.authUserId = user.id;
    return next();
  } catch {
    return res.status(401).json({ message: 'Sessao expirada ou invalida.' });
  }
};
