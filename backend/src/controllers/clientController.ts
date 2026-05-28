import { Request, Response } from 'express';
import prisma from '../lib/prisma';

interface ClientPayload {
  nome_completo: string;
  celular: string;
  cpf?: string;
  data_nascimento?: string;
  endereco?: string;
  telefone_fixo?: string;
  email?: string;
}

const buildPayload = (body: Partial<ClientPayload>): ClientPayload | null => {
  const nome_completo = body.nome_completo?.trim();
  const celular = body.celular?.trim();
  const cpf = body.cpf?.trim();
  const data_nascimento = body.data_nascimento?.toString().trim();
  const endereco = body.endereco?.trim();
  const telefone_fixo = body.telefone_fixo?.trim();
  const email = body.email?.trim();

  if (!nome_completo || !celular) {
    return null;
  }

  return {
    nome_completo,
    celular,
    cpf: cpf || undefined,
    data_nascimento: data_nascimento || undefined,
    endereco: endereco || undefined,
    telefone_fixo: telefone_fixo || undefined,
    email: email || undefined
  };
};

const isValidCPF = (cpf: string) => /^\d{11}$/.test(cpf);
const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const addClient = async (req: Request, res: Response) => {
  try {
    const payload = buildPayload(req.body);

    if (!payload) {
      return res.status(400).json({ message: 'Nome completo e celular sao obrigatorios.' });
    }

    if (payload.cpf && !isValidCPF(payload.cpf)) {
      return res.status(400).json({ message: 'CPF invalido.' });
    }

    if (payload.email && !isValidEmail(payload.email)) {
      return res.status(400).json({ message: 'Email invalido.' });
    }

    let existingClient = null;
    const uniqueFilters = [];
    if (payload.cpf) uniqueFilters.push({ cpf: payload.cpf });
    if (payload.email) uniqueFilters.push({ email: payload.email });

    if (uniqueFilters.length) {
      existingClient = await prisma.cliente.findFirst({
        where: {
          OR: uniqueFilters
        }
      });
    }

    if (existingClient) {
      return res.status(400).json({ message: 'Ja existe um cliente com esse CPF ou email.' });
    }

    const clienteCriado = await prisma.cliente.create({
      data: {
        nome_completo: payload.nome_completo,
        celular: payload.celular,
        cpf: payload.cpf ?? null,
        data_nascimento: payload.data_nascimento ? new Date(payload.data_nascimento) : null,
        endereco: payload.endereco ?? null,
        telefone_fixo: payload.telefone_fixo ?? null,
        email: payload.email ?? null
      }
    });

    return res.status(201).json({
      message: 'Cliente adicionado com sucesso!',
      cliente: clienteCriado
    });
  } catch (error) {
    console.error('Erro ao adicionar cliente:', error);
    return res.status(500).json({ message: 'Erro ao salvar o cliente' });
  }
};

const getAllClients = async (_req: Request, res: Response) => {
  try {
    const clientes = await prisma.cliente.findMany({
      orderBy: {
        created_at: 'desc'
      }
    });
    return res.status(200).json({ clientes });
  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
    return res.status(500).json({ message: 'Erro ao buscar clientes' });
  }
};

const searchClient = async (req: Request, res: Response) => {
  const termo = (req.query.termo as string) ?? '';
  try {
    const clientes = await prisma.cliente.findMany({
      where: {
        OR: [
          {
            nome_completo: {
              contains: termo,
              mode: 'insensitive'
            }
          },
          {
            cpf: {
              contains: termo
            }
          }
        ]
      },
      take: 50
    });
    return res.json({ clientes });
  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
    return res.status(500).json({ message: 'Erro ao pesquisar clientes' });
  }
};

const updateClient = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const payload = buildPayload(req.body);

    if (!id || !payload) {
      return res.status(400).json({ message: 'Nome completo e celular sao obrigatorios.' });
    }

    if (payload.cpf && !isValidCPF(payload.cpf)) {
      return res.status(400).json({ message: 'CPF invalido.' });
    }

    if (payload.email && !isValidEmail(payload.email)) {
      return res.status(400).json({ message: 'Email invalido.' });
    }

    const clienteAtualizado = await prisma.cliente.update({
      where: { id },
      data: {
        nome_completo: payload.nome_completo,
        celular: payload.celular,
        cpf: payload.cpf ?? null,
        data_nascimento: payload.data_nascimento ? new Date(payload.data_nascimento) : null,
        endereco: payload.endereco ?? null,
        telefone_fixo: payload.telefone_fixo ?? null,
        email: payload.email ?? null
      }
    });

    return res.json({
      message: 'Cliente atualizado com sucesso!',
      cliente: clienteAtualizado
    });
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error);
    return res.status(500).json({ message: 'Erro ao atualizar cliente.' });
  }
};

const deleteClient = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (!id) {
      return res.status(400).json({ message: 'ID invalido' });
    }

    await prisma.cliente.delete({
      where: { id }
    });
    return res.json({ message: 'Cliente excluido com sucesso!' });
  } catch (error) {
    console.error('Erro ao excluir cliente:', error);
    return res.status(500).json({ message: 'Erro ao excluir cliente' });
  }
};

export default {
  addClient,
  getAllClients,
  searchClient,
  updateClient,
  deleteClient
};
