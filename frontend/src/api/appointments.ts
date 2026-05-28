import { apiFetch } from './http';
import type { Appointment, AppointmentPayload, PaymentMethod, ProductUsagePayload } from '@/types';

export interface AttendAppointmentPayload {
  metodo_pagamento: PaymentMethod;
  produtos?: ProductUsagePayload[];
}

export const fetchAppointments = () =>
  apiFetch<{ agendamentos: Appointment[] }>('/agendamentos');

export const createAppointment = (payload: AppointmentPayload) =>
  apiFetch<{ message: string; agendamento: Appointment }>('/agendamentos', {
    method: 'POST',
    body: JSON.stringify(payload)
  });

export const updateAppointment = (id: number, payload: AppointmentPayload) =>
  apiFetch<{ message: string; agendamento: Appointment }>(`/agendamentos/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  });

export const deleteAppointment = (id: number) =>
  apiFetch<{ message: string }>(`/agendamentos/${id}`, { method: 'DELETE' });

export const attendAppointment = (id: number, payload: AttendAppointmentPayload) =>
  apiFetch<{ message: string; agendamento: Appointment }>(`/agendamentos/${id}/atender`, {
    method: 'POST',
    body: JSON.stringify(payload)
  });

export const cancelAppointment = (id: number) =>
  apiFetch<{ message: string; agendamento: Appointment }>(`/agendamentos/${id}/desmarcar`, {
    method: 'POST'
  });
