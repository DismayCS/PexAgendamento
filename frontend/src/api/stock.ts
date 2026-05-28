import { apiFetch } from './http';
import type { Product, ProductForecast, StockMovement, StockMovementPayload } from '@/types';

export const fetchProducts = () => apiFetch<{ produtos: Product[] }>('/estoque/produtos');

export const createProduct = (payload: Partial<Product>) =>
  apiFetch<{ message: string; produto: Product }>('/estoque/produtos', {
    method: 'POST',
    body: JSON.stringify(payload)
  });

export const updateProduct = (id: number, payload: Partial<Product>) =>
  apiFetch<{ message: string; produto: Product }>(`/estoque/produtos/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  });

export const deleteProduct = (id: number) =>
  apiFetch<{ message: string }>(`/estoque/produtos/${id}`, { method: 'DELETE' });

export const fetchMovements = (tipo?: string) =>
  apiFetch<{ movimentos: StockMovement[] }>(
    tipo ? `/estoque/movimentos?tipo=${encodeURIComponent(tipo)}` : '/estoque/movimentos'
  );

export const registerMovement = (payload: StockMovementPayload) =>
  apiFetch<{ message: string; movimento: StockMovement }>('/estoque/movimentos', {
    method: 'POST',
    body: JSON.stringify(payload)
  });

export const fetchStockForecast = () => apiFetch<{ previsao: ProductForecast[] }>('/estoque/previsao');
