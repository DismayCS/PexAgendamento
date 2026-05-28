import { apiFetch } from './http';
import type { User } from '@/types';

export interface RegisterPayload {
  nome_completo: string;
  usuario: string;
  email?: string;
  senha: string;
  confirmar_senha?: string;
}

export interface LoginPayload {
  identificador: string;
  senha: string;
}

export const registerUser = (payload: RegisterPayload) =>
  apiFetch<{ message: string; usuario: User }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload)
  });

export const loginUser = (payload: LoginPayload) =>
  apiFetch<{ message: string; usuario: User }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload)
  });

export const fetchCurrentUser = () =>
  apiFetch<{ usuario: User }>('/auth/me');

export const logoutUser = () =>
  apiFetch<{ message: string }>('/auth/logout', {
    method: 'POST'
  });
