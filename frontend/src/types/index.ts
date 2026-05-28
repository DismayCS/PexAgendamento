export interface Client {
  id: number;
  nome_completo: string;
  cpf?: string | null;
  data_nascimento?: string | null;
  endereco?: string | null;
  telefone_fixo?: string | null;
  celular: string;
  email?: string | null;
}

export type Unit = 'ML' | 'L' | 'G' | 'KG';

export interface ProductUsagePayload {
  produto_id: number;
  consumo: number;
}

export interface ProductUsageDetail {
  produto_id: number;
  consumo: number;
  produto: Product;
}

export type ServiceProductUsage = ProductUsageDetail;
export type AppointmentProductUsage = ProductUsageDetail;

export type PaymentMethod = 'DINHEIRO' | 'DEBITO' | 'CREDITO' | 'PIX';

export interface Service {
  id: number;
  nome: string;
  duracao: number;
  observacao: string | null;
  preco: number;
  produtos: ServiceProductUsage[];
}

export interface Product {
  id: number;
  nome: string;
  tipo: string;
  quantidade: number;
  preco: number;
  tamanho: number;
  unidade: Unit;
  classe: 'VENDA' | 'INSUMO';
  created_at: string;
  atualizado_em: string;
}

export type MovementType = 'ENTRADA' | 'SAIDA' | 'REAJUSTE';

export interface StockMovement {
  id: number;
  produto_id: number;
  tipo: MovementType;
  quantidade: number;
  observacao?: string | null;
  created_at: string;
  produto: Product;
}

export interface StockMovementPayload {
  produto_id: number;
  tipo: MovementType;
  quantidade: number;
  observacao?: string;
}

export interface ProductForecast {
  produto: Product;
  consumoAgendado: number;
  vendas30dias: number;
  mediaDiariaVendas: number;
  previsao7dias: number;
  estoqueAtual: number;
}

export interface User {
  id: number;
  nome_completo: string;
  usuario: string;
  email?: string | null;
  celular?: string | null;
}

export interface Appointment {
  id: number;
  cliente_id: number;
  servico_id: number;
  cliente_nome: string;
  servico_nome: string;
  data_hora: string;
  start: string;
  title: string;
  status: 'AGENDADO' | 'ATENDIDO' | 'CANCELADO';
  metodo_pagamento: PaymentMethod | null;
  produtos: AppointmentProductUsage[];
}

export interface AppointmentPayload {
  cliente_id: number;
  servico_id: number;
  data_hora: string;
}

export interface ApiMessage {
  message: string;
}
