import type { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import prisma from '../lib/prisma';
import { AUTH_COOKIE_NAME, getAuthCookieOptions, signAuthToken, verifyAuthToken } from '../lib/auth';

const toPublicUser = (usuario: { id: number; nome_completo: string; usuario: string; email: string | null }) => ({
  id: usuario.id,
  nome_completo: usuario.nome_completo,
  usuario: usuario.usuario,
  email: usuario.email
});

const SALT_ROUNDS = 10;

export const register = async (req: Request, res: Response) => {
  const { nome_completo, usuario, email, senha, confirmar_senha } = req.body as {
    nome_completo?: string;
    usuario?: string;
    email?: string;
    senha?: string;
    confirmar_senha?: string;
  };

  if (!nome_completo || !usuario || !senha) {
    return res.status(400).json({ message: 'Nome completo, usuário e senha são obrigatórios.' });
  }

  if (senha.length < 6) {
    return res.status(400).json({ message: 'A senha deve conter ao menos 6 caracteres.' });
  }

  if (confirmar_senha !== undefined && senha !== confirmar_senha) {
    return res.status(400).json({ message: 'As senhas não coincidem.' });
  }

  try {
    const hash = await bcrypt.hash(senha, SALT_ROUNDS);
    const usuarioCriado = await prisma.usuario.create({
      data: {
        nome_completo,
        usuario,
        email: email || null,
        senha_hash: hash
      }
    });

    return res.status(201).json({ message: 'Usuário cadastrado com sucesso!', usuario: toPublicUser(usuarioCriado) });
  } catch (error) {
    console.error('Erro ao cadastrar usuário:', error);
    if ((error as { code?: string }).code === 'P2002') {
      return res.status(409).json({ message: 'Usuário ou e-mail já estão em uso.' });
    }
    return res.status(500).json({ message: 'Erro ao cadastrar usuário.' });
  }
};

export const login = async (req: Request, res: Response) => {
  const { identificador, senha } = req.body as { identificador?: string; senha?: string };

  if (!identificador || !senha) {
    return res.status(400).json({ message: 'Informe usuário ou e-mail e a senha.' });
  }

  try {
    const usuarioEncontrado = await prisma.usuario.findFirst({
      where: {
        OR: [{ usuario: identificador }, { email: identificador }]
      }
    });

    if (!usuarioEncontrado) {
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }

    const senhaConfere = await bcrypt.compare(senha, usuarioEncontrado.senha_hash);
    if (!senhaConfere) {
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }

    const token = signAuthToken({ sub: String(usuarioEncontrado.id), usuarioId: usuarioEncontrado.id });
    res.cookie(AUTH_COOKIE_NAME, token, getAuthCookieOptions());

    return res.json({ message: 'Autenticação realizada com sucesso!', usuario: toPublicUser(usuarioEncontrado) });
  } catch (error) {
    console.error('Erro ao autenticar usuário:', error);
    return res.status(500).json({ message: 'Erro ao autenticar usuário.' });
  }
};

export const logout = (_req: Request, res: Response) => {
  res.clearCookie(AUTH_COOKIE_NAME, {
    ...getAuthCookieOptions(),
    maxAge: 0
  });
  return res.json({ message: 'Sessao encerrada com sucesso.' });
};

export const me = async (req: Request, res: Response) => {
  const token = req.cookies?.[AUTH_COOKIE_NAME];
  if (!token) {
    return res.status(401).json({ message: 'Nao autenticado.' });
  }

  try {
    const payload = verifyAuthToken(token);
    const usuario = await prisma.usuario.findUnique({
      where: { id: payload.usuarioId },
      select: {
        id: true,
        nome_completo: true,
        usuario: true,
        email: true
      }
    });

    if (!usuario) {
      return res.status(401).json({ message: 'Sessao invalida.' });
    }

    return res.json({ usuario: toPublicUser(usuario) });
  } catch {
    return res.status(401).json({ message: 'Sessao expirada ou invalida.' });
  }
};
