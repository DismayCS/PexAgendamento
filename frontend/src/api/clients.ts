import { apiFetch } from './http';
import type { Client } from '@/types';

export const fetchClients = () => apiFetch<{ clientes: Client[] }>('/clientes');

export const searchClients = (term: string) =>
  apiFetch<{ clientes: Client[] }>(`/clientes/search?termo=${encodeURIComponent(term)}`);

export const createClient = (payload: Omit<Client, 'id'>) =>
  apiFetch<{ message: string; cliente: Client }>('/clientes', {
    method: 'POST',
    body: JSON.stringify(payload)
  });

export const updateClient = (id: number, payload: Omit<Client, 'id'>) =>
  apiFetch<{ message: string; cliente: Client }>(`/clientes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  });

export const deleteClient = (id: number) =>
  apiFetch<{ message: string }>(`/clientes/${id}`, { method: 'DELETE' });
