import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import type {
  Produto,
  MovimentoEstoque,
  UnidadeMedida,
  ProdutoClasse,
  TipoMovimentacao
} from '@prisma/client';

const serializeProduto = (produto: Produto) => ({
  ...produto,
  preco: Number(produto.preco),
  tamanho: Number(produto.tamanho)
});

const serializeMovimento = (movimento: MovimentoEstoque & { produto: Produto }) => ({
  ...movimento,
  produto: serializeProduto(movimento.produto)
});

export const listarProdutos = async (_req: Request, res: Response) => {
  try {
    const produtos = await prisma.produto.findMany({ orderBy: { nome: 'asc' } });
    res.json({ produtos: produtos.map(serializeProduto) });
  } catch (error) {
    console.error('Erro ao listar produtos:', error);
    res.status(500).json({ message: 'Erro ao listar produtos.' });
  }
};

const unidadeValida = (valor?: string): valor is UnidadeMedida => {
  if (!valor) return false;
  return ['ML', 'L', 'G', 'KG'].includes(valor);
};

const classeValida = (valor?: string): valor is ProdutoClasse => {
  if (!valor) return false;
  return ['VENDA', 'INSUMO'].includes(valor);
};

export const criarProduto = async (req: Request, res: Response) => {
  const { nome, tipo, quantidade, preco, tamanho, unidade, classe } = req.body as {
    nome?: string;
    tipo?: string;
    quantidade?: number;
    preco?: number | string;
    tamanho?: number | string;
    unidade?: UnidadeMedida;
    classe?: ProdutoClasse;
  };

  if (!nome || !tipo || !unidadeValida(unidade) || !classeValida(classe)) {
    return res.status(400).json({ message: 'Nome, tipo, unidade e classe sao obrigatorios.' });
  }

  const qty = Number(quantidade ?? 0);
  const parsedPreco = Number(preco ?? 0);
  const parsedTamanho = Number(tamanho ?? 0);

  if (
    Number.isNaN(qty) ||
    qty < 0 ||
    Number.isNaN(parsedPreco) ||
    parsedPreco < 0 ||
    Number.isNaN(parsedTamanho) ||
    parsedTamanho <= 0
  ) {
    return res
      .status(400)
      .json({ message: 'Quantidade, preco e tamanho devem ser numeros validos maiores que zero.' });
  }

  try {
    const produto = await prisma.produto.create({
      data: {
        nome,
        tipo,
        quantidade: qty,
        preco: parsedPreco,
        tamanho: parsedTamanho,
        unidade,
        classe
      }
    });
    res.status(201).json({ message: 'Produto criado com sucesso!', produto: serializeProduto(produto) });
  } catch (error) {
    console.error('Erro ao criar produto:', error);
    res.status(500).json({ message: 'Erro ao salvar produto.' });
  }
};

export const atualizarProduto = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const { nome, tipo, preco, tamanho, unidade, classe } = req.body as {
    nome?: string;
    tipo?: string;
    preco?: number | string;
    tamanho?: number | string;
    unidade?: UnidadeMedida;
    classe?: ProdutoClasse;
  };

  if (!id) {
    return res.status(400).json({ message: 'ID invalido.' });
  }

  if (unidade !== undefined && !unidadeValida(unidade)) {
    return res.status(400).json({ message: 'Unidade invalida.' });
  }

  if (classe !== undefined && !classeValida(classe)) {
    return res.status(400).json({ message: 'Classe invalida.' });
  }

  const parsedPreco = preco !== undefined ? Number(preco) : undefined;
  const parsedTamanho = tamanho !== undefined ? Number(tamanho) : undefined;

  if (
    (parsedPreco !== undefined && (Number.isNaN(parsedPreco) || parsedPreco < 0)) ||
    (parsedTamanho !== undefined && (Number.isNaN(parsedTamanho) || parsedTamanho <= 0))
  ) {
    return res
      .status(400)
      .json({ message: 'Preco e tamanho devem ser numeros validos maiores que zero quando informados.' });
  }

  try {
    const produto = await prisma.produto.update({
      where: { id },
      data: {
        nome: nome ?? undefined,
        tipo: tipo ?? undefined,
        preco: parsedPreco,
        tamanho: parsedTamanho,
        unidade: unidade ?? undefined,
        classe: classe ?? undefined
      }
    });
    res.json({ message: 'Produto atualizado!', produto: serializeProduto(produto) });
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    res.status(500).json({ message: 'Erro ao atualizar produto.' });
  }
};

export const removerProduto = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (!id) {
    return res.status(400).json({ message: 'ID invalido.' });
  }

  try {
    await prisma.produto.delete({ where: { id } });
    res.json({ message: 'Produto removido com sucesso!' });
  } catch (error) {
    console.error('Erro ao remover produto:', error);
    res.status(500).json({ message: 'Erro ao remover produto.' });
  }
};

export const registrarMovimento = async (req: Request, res: Response) => {
  const { produto_id, tipo, quantidade, observacao } = req.body as {
    produto_id?: number;
    tipo?: 'ENTRADA' | 'SAIDA' | 'REAJUSTE';
    quantidade?: number;
    observacao?: string;
  };

  const idProduto = Number(produto_id);
  const qty = Number(quantidade);

  if (!idProduto || !tipo || Number.isNaN(qty)) {
    return res.status(400).json({ message: 'Produto, tipo e quantidade sao obrigatorios.' });
  }

  if (!['ENTRADA', 'SAIDA', 'REAJUSTE'].includes(tipo)) {
    return res.status(400).json({ message: 'Tipo invalido.' });
  }

  try {
    const movimento = await prisma.$transaction(async (tx) => {
      const produto = await tx.produto.findUnique({ where: { id: idProduto } });
      if (!produto) throw new Error('Produto nao encontrado');

      let novaQuantidade = produto.quantidade;
      if (tipo === 'ENTRADA') novaQuantidade += qty;
      if (tipo === 'SAIDA') novaQuantidade -= qty;
      if (tipo === 'REAJUSTE') novaQuantidade = qty;

      if (novaQuantidade < 0) {
        throw new Error('Quantidade resultante nao pode ser negativa.');
      }

      await tx.produto.update({ where: { id: idProduto }, data: { quantidade: novaQuantidade } });

      return tx.movimentoEstoque.create({
        data: {
          produto_id: idProduto,
          tipo,
          quantidade: qty,
          observacao
        },
        include: { produto: true }
      });
    });

    res.status(201).json({ message: 'Movimentacao registrada!', movimento: serializeMovimento(movimento) });
  } catch (error) {
    console.error('Erro ao registrar movimentacao:', error);
    res.status(500).json({ message: (error as Error).message });
  }
};

export const listarMovimentos = async (req: Request, res: Response) => {
  const { tipo } = req.query;
  try {
    const movimentos = await prisma.movimentoEstoque.findMany({
      where: tipo ? { tipo: tipo as any } : undefined,
      include: { produto: true },
      orderBy: { created_at: 'desc' }
    });

    res.json({ movimentos: movimentos.map(serializeMovimento) });
  } catch (error) {
    console.error('Erro ao listar movimentacoes:', error);
    res.status(500).json({ message: 'Erro ao listar movimentacoes.' });
  }
};

const DAYS_WINDOW = 30;

const addDays = (reference: Date, days: number) => {
  const result = new Date(reference);
  result.setDate(result.getDate() + days);
  return result;
};

export const preverConsumo = async (_req: Request, res: Response) => {
  const agora = new Date();
  const inicioJanela = addDays(agora, -DAYS_WINDOW);

  try {
    const [produtos, saidasAgrupadas, agendamentos] = await Promise.all([
      prisma.produto.findMany(),
      prisma.movimentoEstoque.groupBy({
        by: ['produto_id'],
        where: {
          tipo: 'SAIDA',
          created_at: { gte: inicioJanela }
        },
        _sum: { quantidade: true },
        orderBy: { produto_id: 'asc' }
      }),
      prisma.agendamento.findMany({
        where: {
          status: 'AGENDADO',
          data_hora: { gte: agora }
        },
        include: {
          servico: {
            include: {
              produtos: true
            }
          }
        }
      })
    ]);

    const consumoAgendado = new Map<number, number>();
    for (const agendamento of agendamentos) {
      for (const item of agendamento.servico.produtos) {
        const atual = consumoAgendado.get(item.produto_id) ?? 0;
        consumoAgendado.set(item.produto_id, atual + Number(item.consumo));
      }
    }

    const vendasMap = new Map<number, number>();
    for (const item of saidasAgrupadas) {
      vendasMap.set(item.produto_id, item._sum.quantidade ?? 0);
    }

    const janelaDias = Math.max(
      1,
      Math.round((agora.getTime() - inicioJanela.getTime()) / (1000 * 60 * 60 * 24))
    );

    const previsao = produtos.map((produto) => {
      const agendado = consumoAgendado.get(produto.id) ?? 0;
      const vendas30 = vendasMap.get(produto.id) ?? 0;
      const mediaDiariaVendas = vendas30 / janelaDias;
      const previsaoProximaSemana = mediaDiariaVendas * 7 + agendado;

      return {
        produto: serializeProduto(produto),
        consumoAgendado: agendado,
        vendas30dias: vendas30,
        mediaDiariaVendas,
        previsao7dias: previsaoProximaSemana,
        estoqueAtual: produto.quantidade
      };
    });

    res.json({ previsao });
  } catch (error) {
    console.error('Erro ao calcular previsao de consumo:', error);
    res.status(500).json({ message: 'Erro ao calcular previsao de consumo.' });
  }
};
