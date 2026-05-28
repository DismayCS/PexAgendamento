import { useEffect, useMemo, useRef, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import PageHeader from '@/components/PageHeader';
import Modal from '@/components/Modal';
import Alert from '@/components/Alert';
import type { Client } from '@/types';
import { createClient, deleteClient, fetchClients, searchClients, updateClient } from '@/api/clients';

interface ClientFormState {
  nome_completo: string;
  cpf: string;
  data_nascimento: string;
  endereco: string;
  telefone_fixo: string;
  celular: string;
  email: string;
}

type FeedbackState = { type: 'success' | 'error'; message: string } | null;

const emptyForm: ClientFormState = {
  nome_completo: '',
  cpf: '',
  data_nascimento: '',
  endereco: '',
  telefone_fixo: '',
  celular: '',
  email: ''
};

const toDateInput = (value?: string | null) => (value ? value.split('T')[0] : '');

const formatDate = (value?: string | null) => {
  if (!value) return '---';
  const [datePart] = value.split('T');
  const [year, month, day] = datePart.split('-');
  if (!year || !month || !day) return value;
  return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
};

const ClientsPage = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [formState, setFormState] = useState<ClientFormState>(emptyForm);
  const [searchTerm, setSearchTerm] = useState('');
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const searchInitialized = useRef(false);

  useEffect(() => {
    loadClients();
  }, []);

  useEffect(() => {
    if (!searchInitialized.current) {
      searchInitialized.current = true;
      return;
    }

    if (searchTerm.trim() === '') {
      loadClients();
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        const response = await searchClients(searchTerm);
        setClients(response.clientes || []);
      } catch (error) {
        setFeedback({ type: 'error', message: (error as Error).message });
      }
    }, 400);

    return () => clearTimeout(timeout);
  }, [searchTerm]);

  const loadClients = async () => {
    setLoading(true);
    try {
      const response = await fetchClients();
      setClients(response.clientes || []);
    } catch (error) {
      setFeedback({ type: 'error', message: (error as Error).message });
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setSelectedClient(null);
    setFormState(emptyForm);
    setModalOpen(true);
  };

  const openEditModal = (client: Client) => {
    setSelectedClient(client);
    setFormState({
      nome_completo: client.nome_completo,
      cpf: client.cpf ?? '',
      data_nascimento: toDateInput(client.data_nascimento),
      endereco: client.endereco ?? '',
      telefone_fixo: client.telefone_fixo ?? '',
      celular: client.celular ?? '',
      email: client.email ?? ''
    });
    setModalOpen(true);
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback(null);

    if (!formState.nome_completo.trim() || !formState.celular.trim()) {
      setFeedback({ type: 'error', message: 'Informe nome completo e celular.' });
      return;
    }

    try {
      if (selectedClient) {
        const response = await updateClient(selectedClient.id, formState);
        setClients((prev) => prev.map((client) => (client.id === response.cliente.id ? response.cliente : client)));
        setFeedback({ type: 'success', message: response.message });
      } else {
        const response = await createClient(formState);
        setClients((prev) => [response.cliente, ...prev]);
        setFeedback({ type: 'success', message: response.message });
      }
      closeModal();
    } catch (error) {
      setFeedback({ type: 'error', message: (error as Error).message });
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Deseja realmente remover este cliente?')) {
      return;
    }
    try {
      await deleteClient(id);
      setClients((prev) => prev.filter((client) => client.id !== id));
      setFeedback({ type: 'success', message: 'Cliente removido com sucesso.' });
    } catch (error) {
      setFeedback({ type: 'error', message: (error as Error).message });
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedClient(null);
    setFormState(emptyForm);
  };

  const hasResults = useMemo(() => clients.length > 0, [clients]);

  return (
    <div className="page-flow">
      <PageHeader
        title="Clientes"
        description="Cadastre e mantenha os dados dos seus clientes sempre atualizados."
        actionLabel="Novo cliente"
        onAction={openCreateModal}
      />

      {feedback && <Alert type={feedback.type} message={feedback.message} />}

      <div className="page-card list-wrapper">
        <input
          type="search"
          placeholder="Buscar por nome ou CPF"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />

        {loading ? (
          <p>Carregando clientes...</p>
        ) : hasResults ? (
          <div className="card-grid">
            {clients.map((client) => (
              <article key={client.id} className="card">
                <h3>{client.nome_completo}</h3>
                <p className="card__meta">CPF: {client.cpf || '---'}</p>
                <p className="card__meta">Nascimento: {formatDate(client.data_nascimento)}</p>
                <p className="card__meta">Endereco: {client.endereco || '---'}</p>
                <p className="card__meta">Telefone: {client.telefone_fixo || '---'}</p>
                <p className="card__meta">Celular: {client.celular}</p>
                <p className="card__meta">E-mail: {client.email || '---'}</p>
                <div className="card__actions">
                  <button className="btn" type="button" onClick={() => openEditModal(client)}>
                    Editar
                  </button>
                  <button className="btn btn--secondary" type="button" onClick={() => handleDelete(client.id)}>
                    Excluir
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p>Nenhum cliente foi encontrado.</p>
        )}
      </div>

      <Modal
        isOpen={modalOpen}
        title={selectedClient ? 'Editar cliente' : 'Novo cliente'}
        onClose={closeModal}
        footer={
          <>
            <button type="button" className="btn btn--secondary" onClick={closeModal}>
              Cancelar
            </button>
            <button type="submit" form="client-form" className="btn">
              {selectedClient ? 'Atualizar' : 'Salvar'}
            </button>
          </>
        }
      >
        <form id="client-form" className="form-grid" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="nome_completo">Nome completo</label>
            <input
              id="nome_completo"
              name="nome_completo"
              value={formState.nome_completo}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="cpf">CPF</label>
            <input id="cpf" name="cpf" value={formState.cpf} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label htmlFor="data_nascimento">Data de nascimento</label>
            <input
              id="data_nascimento"
              name="data_nascimento"
              type="date"
              value={formState.data_nascimento}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="endereco">Endereco</label>
            <input id="endereco" name="endereco" value={formState.endereco} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label htmlFor="telefone_fixo">Telefone fixo</label>
            <input
              id="telefone_fixo"
              name="telefone_fixo"
              value={formState.telefone_fixo}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="celular">Celular</label>
            <input id="celular" name="celular" value={formState.celular} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label htmlFor="email">E-mail</label>
            <input id="email" name="email" type="email" value={formState.email} onChange={handleChange} />
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ClientsPage;
