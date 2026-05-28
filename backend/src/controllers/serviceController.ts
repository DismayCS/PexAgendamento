import type { Produto, Servico, ServicoProduto } from '@prisma/client';
import { Request, Response } from 'express';
import prisma from '../lib/prisma';

type ServicoWithProdutos = Servico & {
  produtos?: (ServicoProduto & { produto: Produto })[];
};

const serializeProduto = (produto: Produto) => ({
  ...produto,
  preco: Number(produto.preco),
  tamanho: Number(produto.tamanho)
});

const serializeService = (servico: ServicoWithProdutos) => ({
  ...servico,
  preco: Number(servico.preco),
  produtos:
    servico.produtos?.map((relacao) => ({
      produto_id: relacao.produto_id,
      consumo: Number(relacao.consumo),
      produto: serializeProduto(relacao.produto)
    })) ?? []
});

const parsePayload = (body: {
  nome?: string;
  duracao?: number;
  observacao?: string;
  preco?: number | string;
}) => {
  const nome = body.nome?.trim();
  const duracao = Number(body.duracao);
  const observacao = body.observacao?.trim();
  const preco = Number(body.preco);

  if (!nome || Number.isNaN(duracao) || duracao <= 0 || Number.isNaN(preco) || preco < 0) {
    return null;
  }

  return { nome, duracao, observacao: observacao || null, preco };
};

interface ProdutoServicoInput {
  produto_id: number;
  consumo: number;
}

const parseProdutosUtilizados = (raw: unknown): ProdutoServicoInput[] | null => {
  if (!Array.isArray(raw)) {
    return null;
  }

  const parsed: ProdutoServicoInput[] = [];
  const ids = new Set<number>();

  for (const item of raw) {
    const produtoId = Number(
      (item as { produto_id?: number; produtoId?: number })?.produto_id ??
        (item as { produtoId?: number })?.produtoId
    );
    const consumo = Number((item as { consumo?: number; quantidade?: number })?.consumo ?? (item as any)?.quantidade);

    if (!produtoId || ids.has(produtoId) || Number.isNaN(consumo) || consumo <= 0) {
      return null;
    }

    ids.add(produtoId);
    parsed.push({ produto_id: produtoId, consumo });
  }

  return parsed.length ? parsed : null;
};

const includeProdutos = {
  produtos: {
    include: {
      produto: true
    }
  }
};

const addService = async (req: Request, res: Response) => {
  const payload = parsePayload(req.body);
  const produtosUtilizados = parseProdutosUtilizados(req.body.produtos);

  if (!payload || !produtosUtilizados) {
    return res
      .status(400)
      .json({ message: 'Nome, duracao, preco e ao menos um produto com consumo valido sao obrigatorios.' });
  }

  try {
    const servico = await prisma.servico.create({
      data: {
        nome: payload.nome,
        duracao: payload.duracao,
        observacao: payload.observacao,
        preco: payload.preco,
        produtos: {
          create: produtosUtilizados.map((produto) => ({
            produto_id: produto.produto_id,
            consumo: produto.consumo
          }))
        }
      },
      include: includeProdutos
    });

    return res.status(201).json({
      message: 'Servico adicionado com sucesso!',
      servico: serializeService(servico)
    });
  } catch (error) {
    console.error('Erro ao adicionar servico:', error);
    return res.status(500).json({ message: 'Erro ao salvar o servico', error: (error as Error).message });
  }
};

const getAllServices = async (_req: Request, res: Response) => {
  try {
    const servicos = await prisma.servico.findMany({
      orderBy: { created_at: 'desc' },
      include: includeProdutos
    });
    return res.status(200).json({ servicos: servicos.map(serializeService) });
  } catch (error) {
    console.error('Erro ao buscar servicos:', error);
    return res.status(500).json({ message: 'Erro ao buscar servicos', error: (error as Error).message });
  }
};

const updateService = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const payload = parsePayload(req.body);
  const produtosUtilizados = parseProdutosUtilizados(req.body.produtos);

  if (!id || !payload || !produtosUtilizados) {
    return res
      .status(400)
      .json({ message: 'ID, nome, duracao, preco e os produtos utilizados sao obrigatorios.' });
  }

  try {
    const servico = await prisma.servico.update({
      where: { id },
      data: {
        nome: payload.nome,
        duracao: payload.duracao,
        observacao: payload.observacao,
        preco: payload.preco,
        produtos: {
          deleteMany: {},
          create: produtosUtilizados.map((produto) => ({
            produto_id: produto.produto_id,
            consumo: produto.consumo
          }))
        }
      },
      include: includeProdutos
    });

    return res.json({
      message: 'Servico atualizado com sucesso!',
      servico: serializeService(servico)
    });
  } catch (error) {
    console.error('Erro ao atualizar servico:', error);
    return res.status(500).json({ message: 'Erro ao atualizar servico.' });
  }
};

const deleteService = async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  if (!id) {
    return res.status(400).json({ message: 'ID invalido.' });
  }

  try {
    await prisma.servico.delete({ where: { id } });
    return res.json({ message: 'Servico excluido com sucesso!' });
  } catch (error) {
    console.error('Erro ao excluir servico:', error);
    return res.status(500).json({ message: 'Erro ao excluir servico.' });
  }
};

export default {
  updateService,
  addService,
  getAllServices,
  deleteService
};
