import { Request, Response } from 'express';
import moment from 'moment-timezone';
import type {
  Agendamento,
  Cliente,
  Servico,
  ServicoProduto,
  Produto,
  AgendamentoProduto,
  MetodoPagamento
} from '@prisma/client';
import prisma from '../lib/prisma';

interface AppointmentPayload {
  cliente_id: number;
  servico_id: number;
  data_hora: string;
}

interface ProdutoConsumoPayload {
  produto_id: number;
  consumo: number;
}

type AgendamentoComRelacionamentos = Agendamento & {
  cliente: Cliente;
  servico: Servico & {
    produtos: (ServicoProduto & { produto: Produto })[];
  };
  produtos: (AgendamentoProduto & { produto: Produto })[];
};

const includeAgendamentoCompleto = {
  cliente: true,
  servico: {
    include: {
      produtos: {
        include: {
          produto: true
        }
      }
    }
  },
  produtos: {
    include: {
      produto: true
    }
  }
};

const formatarAgendamento = (registro?: AgendamentoComRelacionamentos | null) => {
  if (!registro) {
    return null;
  }

  return {
    id: registro.id,
    cliente_id: registro.cliente_id,
    servico_id: registro.servico_id,
    cliente_nome: registro.cliente.nome_completo,
    servico_nome: registro.servico.nome,
    data_hora: registro.data_hora,
    start: moment(registro.data_hora).tz('America/Sao_Paulo').format(),
    title: `${registro.cliente.nome_completo} - ${registro.servico.nome}`,
    status: registro.status,
    metodo_pagamento: registro.metodo_pagamento ?? null,
    produtos: registro.produtos.map((item) => ({
      produto_id: item.produto_id,
      consumo: Number(item.consumo),
      produto: {
        ...item.produto,
        preco: Number(item.produto.preco),
        tamanho: Number(item.produto.tamanho)
      }
    }))
  };
};

const parsePayload = (body: Partial<AppointmentPayload>): AppointmentPayload | null => {
  const clienteId = Number(body.cliente_id);
  const servicoId = Number(body.servico_id);
  const dataHora = body.data_hora?.toString();

  if (!clienteId || !servicoId || !dataHora) {
    return null;
  }

  return {
    cliente_id: clienteId,
    servico_id: servicoId,
    data_hora: dataHora
  };
};

const parseProdutosUtilizados = (raw: unknown): ProdutoConsumoPayload[] | null => {
  if (!Array.isArray(raw)) {
    return null;
  }

  const parsed: ProdutoConsumoPayload[] = [];
  const ids = new Set<number>();

  for (const item of raw) {
    const produtoId = Number((item as { produto_id?: number; produtoId?: number })?.produto_id ?? (item as any)?.produtoId);
    const consumo = Number((item as { consumo?: number })?.consumo);

    if (!produtoId || ids.has(produtoId) || Number.isNaN(consumo) || consumo <= 0) {
      return null;
    }

    ids.add(produtoId);
    parsed.push({ produto_id: produtoId, consumo });
  }

  return parsed;
};

const metodoPagamentoValido = (valor?: string): valor is MetodoPagamento => {
  if (!valor) {
    return false;
  }
  return ['DINHEIRO', 'DEBITO', 'CREDITO', 'PIX'].includes(valor);
};

const criarAgendamento = async (req: Request, res: Response) => {
  try {
    const payload = parsePayload(req.body);

    if (!payload) {
      return res.status(400).json({ error: 'Todos os campos sao obrigatorios.' });
    }

    const criado = await prisma.agendamento.create({
      data: {
        cliente_id: payload.cliente_id,
        servico_id: payload.servico_id,
        data_hora: new Date(payload.data_hora)
      },
      include: includeAgendamentoCompleto
    });
    return res.status(201).json({
      message: 'Agendamento criado com sucesso!',
      agendamento: formatarAgendamento(criado)
    });
  } catch (error) {
    console.error('Erro ao criar agendamento:', error);
    return res.status(500).json({ error: 'Erro ao criar o agendamento.' });
  }
};

const listarAgendamentos = async (_req: Request, res: Response) => {
  try {
    const agendamentos = await prisma.agendamento.findMany({
      where: { status: 'AGENDADO' },
      include: includeAgendamentoCompleto,
      orderBy: { data_hora: 'asc' }
    });
    return res.json({ agendamentos: agendamentos.map(formatarAgendamento) });
  } catch (error) {
    console.error('Erro ao buscar agendamentos:', error);
    return res.status(500).json({ error: 'Erro ao buscar agendamentos.' });
  }
};

const excluirAgendamento = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!id) {
      return res.status(400).json({ error: 'ID invalido' });
    }
    await prisma.agendamento.delete({ where: { id } });
    return res.json({ message: 'Agendamento excluido com sucesso!' });
  } catch (error) {
    console.error('Erro ao excluir agendamento:', error);
    return res.status(500).json({ error: 'Erro ao excluir agendamento.' });
  }
};

const editarAgendamento = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const payload = parsePayload(req.body);

    if (!id || !payload) {
      return res.status(400).json({ error: 'Todos os campos sao obrigatorios.' });
    }

    const atualizado = await prisma.agendamento.update({
      where: { id },
      data: {
        cliente_id: payload.cliente_id,
        servico_id: payload.servico_id,
        data_hora: new Date(payload.data_hora)
      },
      include: includeAgendamentoCompleto
    });
    return res.json({
      message: 'Agendamento atualizado com sucesso!',
      agendamento: formatarAgendamento(atualizado)
    });
  } catch (error) {
    console.error('Erro ao editar agendamento:', error);
    return res.status(500).json({ error: 'Erro ao editar o agendamento.' });
  }
};

const atenderAgendamento = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const { metodo_pagamento, produtos } = req.body as { metodo_pagamento?: string; produtos?: unknown };

  if (!id || !metodoPagamentoValido(metodo_pagamento)) {
    return res.status(400).json({ error: 'ID e metodo de pagamento sao obrigatorios.' });
  }

  const produtosInformados = parseProdutosUtilizados(produtos ?? null);

  try {
    const atualizado = await prisma.$transaction(async (tx) => {
      const agendamento = await tx.agendamento.findUnique({
        where: { id },
        include: {
          servico: {
            include: {
              produtos: true
            }
          }
        }
      });

      if (!agendamento) {
        throw new Error('Agendamento nao encontrado.');
      }

      if (agendamento.status !== 'AGENDADO') {
        throw new Error('Este agendamento ja foi finalizado.');
      }

      let consumoFinal: ProdutoConsumoPayload[] = [];

      if (produtosInformados && produtosInformados.length) {
        consumoFinal = produtosInformados;
      } else {
        consumoFinal = agendamento.servico.produtos.map((item) => ({
          produto_id: item.produto_id,
          consumo: Number(item.consumo)
        }));
      }

      if (!consumoFinal.length) {
        throw new Error('Informe os produtos consumidos para concluir o atendimento.');
      }

      await tx.agendamentoProduto.deleteMany({ where: { agendamento_id: id } });
      await tx.agendamentoProduto.createMany({
        data: consumoFinal.map((item) => ({
          agendamento_id: id,
          produto_id: item.produto_id,
          consumo: item.consumo
        }))
      });

      return tx.agendamento.update({
        where: { id },
        data: {
          status: 'ATENDIDO',
          metodo_pagamento,
          finalizado_em: new Date()
        },
        include: includeAgendamentoCompleto
      });
    });

    return res.json({
      message: 'Atendimento finalizado com sucesso!',
      agendamento: formatarAgendamento(atualizado)
    });
  } catch (error) {
    const message = (error as Error).message || 'Erro ao finalizar atendimento.';
    console.error('Erro ao atender agendamento:', error);
    return res.status(400).json({ error: message });
  }
};

const cancelarAgendamento = async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  if (!id) {
    return res.status(400).json({ error: 'ID invalido.' });
  }

  try {
    const atualizado = await prisma.agendamento.update({
      where: { id },
      data: {
        status: 'CANCELADO',
        finalizado_em: new Date()
      },
      include: includeAgendamentoCompleto
    });

    return res.json({
      message: 'Agendamento desmarcado com sucesso!',
      agendamento: formatarAgendamento(atualizado)
    });
  } catch (error) {
    console.error('Erro ao cancelar agendamento:', error);
    return res.status(500).json({ error: 'Erro ao cancelar o agendamento.' });
  }
};

export default {
  excluirAgendamento,
  listarAgendamentos,
  criarAgendamento,
  editarAgendamento,
  atenderAgendamento,
  cancelarAgendamento
};
