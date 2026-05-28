import { apiFetch } from './http';
import type { Service, ProductUsagePayload } from '@/types';

export interface ServicePayload {
  nome: string;
  duracao: number;
  observacao?: string;
  preco: number;
  produtos: ProductUsagePayload[];
}

export const fetchServices = () => apiFetch<{ servicos: Service[] }>('/servicos');

export const createService = (payload: ServicePayload) =>
  apiFetch<{ message: string; servico: Service }>('/servicos', {
    method: 'POST',
    body: JSON.stringify(payload)
  });

export const updateService = (id: number, payload: ServicePayload) =>
  apiFetch<{ message: string; servico: Service }>(`/servicos/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  });

export const deleteService = (id: number) =>
  apiFetch<{ message: string }>(`/servicos/${id}`, { method: 'DELETE' });
