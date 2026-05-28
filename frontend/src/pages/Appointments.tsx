import { useEffect, useMemo, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import FullCalendar from '@fullcalendar/react';
import type { EventClickArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import ptLocale from '@fullcalendar/core/locales/pt-br';

import PageHeader from '@/components/PageHeader';
import Modal from '@/components/Modal';
import Alert from '@/components/Alert';
import type { Appointment, Client, Product, Service, PaymentMethod } from '@/types';
import { fetchClients } from '@/api/clients';
import { fetchServices } from '@/api/services';
import { fetchProducts } from '@/api/stock';
import {
  attendAppointment,
  cancelAppointment,
  createAppointment,
  deleteAppointment,
  fetchAppointments,
  updateAppointment
} from '@/api/appointments';

interface AppointmentFormState {
  cliente_id: string;
  servico_id: string;
  data_hora: string;
}

interface ProductUsageForm {
  produto_id: string;
  consumo: string;
}

type FeedbackState = { type: 'success' | 'error'; message: string } | null;

const initialState: AppointmentFormState = {
  cliente_id: '',
  servico_id: '',
  data_hora: ''
};

const paymentOptions: { value: PaymentMethod; label: string }[] = [
  { value: 'DINHEIRO', label: 'Dinheiro' },
  { value: 'DEBITO', label: 'Cartao de debito' },
  { value: 'CREDITO', label: 'Cartao de credito' },
  { value: 'PIX', label: 'PIX' }
];

const createEmptyUsage = (): ProductUsageForm => ({
  produto_id: '',
  consumo: ''
});

const formatForInput = (value: string) => {
  if (!value) return '';
  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
};

const AppointmentsPage = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [formState, setFormState] = useState<AppointmentFormState>(initialState);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [attendModalOpen, setAttendModalOpen] = useState(false);
  const [attendPayment, setAttendPayment] = useState<PaymentMethod>('DINHEIRO');
  const [attendUsages, setAttendUsages] = useState<ProductUsageForm[]>([createEmptyUsage()]);
  const [feedback, setFeedback] = useState<FeedbackState>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [clientRes, serviceRes, appointmentRes, productRes] = await Promise.all([
          fetchClients(),
          fetchServices(),
          fetchAppointments(),
          fetchProducts()
        ]);
        setClients(clientRes.clientes || []);
        setServices(serviceRes.servicos || []);
        setAppointments((appointmentRes.agendamentos || []).filter(Boolean) as Appointment[]);
        setProducts(productRes.produtos || []);
      } catch (error) {
        setFeedback({ type: 'error', message: (error as Error).message });
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const eventData = useMemo(
    () =>
      appointments
        .filter((item) => item.status === 'AGENDADO')
        .map((item) => ({
          id: String(item.id),
          title: item.title,
          start: item.start,
          extendedProps: item
        })),
    [appointments]
  );

  const openCreateModal = () => {
    setFormState({
      cliente_id: clients[0]?.id.toString() || '',
      servico_id: services[0]?.id.toString() || '',
      data_hora: ''
    });
    setModalMode('create');
    setSelectedId(null);
  };

  const openEditModal = (appointment: Appointment | null) => {
    if (!appointment) {
      return;
    }
    setSelectedId(appointment.id);
    setFormState({
      cliente_id: String(appointment.cliente_id),
      servico_id: String(appointment.servico_id),
      data_hora: formatForInput(appointment.data_hora)
    });
    setModalMode('edit');
    setActionModalOpen(false);
  };

  const openAttendModal = (appointment: Appointment | null) => {
    if (!appointment) {
      return;
    }
    const service = services.find((item) => item.id === appointment.servico_id);
    if (service && service.produtos.length) {
      setAttendUsages(
        service.produtos.map((item) => ({
          produto_id: String(item.produto_id),
          consumo: String(item.consumo)
        }))
      );
    } else {
      setAttendUsages([createEmptyUsage()]);
    }
    setAttendPayment('DINHEIRO');
    setAttendModalOpen(true);
    setActionModalOpen(false);
  };

  const closeFormModal = () => {
    setModalMode(null);
    setFormState(initialState);
    setSelectedId(null);
  };

  const closeAttendModal = () => {
    setAttendModalOpen(false);
    setAttendUsages([createEmptyUsage()]);
    setAttendPayment('DINHEIRO');
  };

  const handleEventClick = (arg: EventClickArg) => {
    const payload = arg.event.extendedProps as Appointment;
    setSelectedAppointment(payload);
    setSelectedId(payload.id);
    setActionModalOpen(true);
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleUsageChange = (index: number, field: keyof ProductUsageForm, value: string) => {
    setAttendUsages((prev) => prev.map((usage, idx) => (idx === index ? { ...usage, [field]: value } : usage)));
  };

  const addUsageRow = () => {
    setAttendUsages((prev) => [...prev, createEmptyUsage()]);
  };

  const removeUsageRow = (index: number) => {
    setAttendUsages((prev) => (prev.length === 1 ? prev : prev.filter((_, idx) => idx !== index)));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback(null);

    if (!formState.cliente_id || !formState.servico_id || !formState.data_hora) {
      setFeedback({ type: 'error', message: 'Preencha todos os campos para salvar o agendamento.' });
      return;
    }

    const payload = {
      cliente_id: Number(formState.cliente_id),
      servico_id: Number(formState.servico_id),
      data_hora: formState.data_hora
    };

    try {
      if (modalMode === 'create') {
        const response = await createAppointment(payload);
        setAppointments((prev) => [...prev, response.agendamento]);
        setFeedback({ type: 'success', message: response.message });
      } else if (modalMode === 'edit' && selectedId) {
        const response = await updateAppointment(selectedId, payload);
        setAppointments((prev) =>
          prev.map((item) => (item.id === response.agendamento.id ? response.agendamento : item))
        );
        setFeedback({ type: 'success', message: response.message });
      }
      closeFormModal();
    } catch (error) {
      setFeedback({ type: 'error', message: (error as Error).message });
    }
  };

  const handleDelete = async () => {
    if (!selectedId) return;
    if (!window.confirm('Deseja realmente remover este agendamento?')) {
      return;
    }

    try {
      await deleteAppointment(selectedId);
      setAppointments((prev) => prev.filter((item) => item.id !== selectedId));
      setFeedback({ type: 'success', message: 'Agendamento removido com sucesso.' });
      closeFormModal();
    } catch (error) {
      setFeedback({ type: 'error', message: (error as Error).message });
    }
  };

  const handleCancelAppointment = async (appointment: Appointment | null) => {
    if (!appointment) return;
    if (!window.confirm('Deseja realmente desmarcar este agendamento?')) {
      return;
    }

    try {
      const response = await cancelAppointment(appointment.id);
      setAppointments((prev) => prev.filter((item) => item.id !== response.agendamento.id));
      setFeedback({ type: 'success', message: response.message });
      setActionModalOpen(false);
      setSelectedAppointment(null);
    } catch (error) {
      setFeedback({ type: 'error', message: (error as Error).message });
    }
  };

  const handleAttendSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedAppointment) return;
    setFeedback(null);

    if (attendUsages.some((usage) => !usage.produto_id || !usage.consumo)) {
      setFeedback({ type: 'error', message: 'Informe produto e consumo em todas as linhas.' });
      return;
    }

    const payload = attendUsages.map((usage) => ({
      produto_id: Number(usage.produto_id),
      consumo: Number(usage.consumo)
    }));

    if (payload.some((item) => !item.produto_id || Number.isNaN(item.consumo) || item.consumo <= 0)) {
      setFeedback({ type: 'error', message: 'Consumo deve ser um numero maior que zero.' });
      return;
    }

    try {
      const response = await attendAppointment(selectedAppointment.id, {
        metodo_pagamento: attendPayment,
        produtos: payload
      });
      setAppointments((prev) => prev.filter((item) => item.id !== response.agendamento.id));
      setFeedback({ type: 'success', message: response.message });
      closeAttendModal();
      setSelectedAppointment(null);
    } catch (error) {
      setFeedback({ type: 'error', message: (error as Error).message });
    }
  };

  return (
    <div className="page-flow">
      <PageHeader
        title="Agenda central"
        description="Controle de horarios, clientes e servicos em um unico painel."
        actionLabel="Novo agendamento"
        onAction={clients.length && services.length ? openCreateModal : undefined}
      />

      {feedback && <Alert type={feedback.type} message={feedback.message} />}

      {(!clients.length || !services.length) && (
        <Alert
          type="error"
          message="Cadastre pelo menos um cliente e um servico para liberar novos agendamentos."
        />
      )}

      <section className="calendar-card">
        {loading ? (
          <p>Carregando agenda...</p>
        ) : (
          <div className="calendar-wrapper">
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              events={eventData}
              eventClick={handleEventClick}
              locales={[ptLocale]}
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay'
              }}
              locale="pt-br"
              height="auto"
            />
          </div>
        )}
      </section>

      <Modal
        isOpen={modalMode !== null}
        title={modalMode === 'edit' ? 'Editar agendamento' : 'Novo agendamento'}
        onClose={closeFormModal}
        footer={
          <>
            {modalMode === 'edit' && (
              <button type="button" className="btn btn--danger" onClick={handleDelete}>
                Excluir
              </button>
            )}
            <button type="button" className="btn btn--secondary" onClick={closeFormModal}>
              Cancelar
            </button>
            <button type="submit" form="appointment-form" className="btn">
              {modalMode === 'edit' ? 'Atualizar' : 'Salvar'}
            </button>
          </>
        }
      >
        <form id="appointment-form" className="form-grid" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="cliente_id">Cliente</label>
            <select
              id="cliente_id"
              name="cliente_id"
              value={formState.cliente_id}
              onChange={handleChange}
              required
            >
              {clients.length === 0 && <option value="">Cadastre um cliente primeiro</option>}
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.nome_completo}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="servico_id">Servico</label>
            <select
              id="servico_id"
              name="servico_id"
              value={formState.servico_id}
              onChange={handleChange}
              required
            >
              {services.length === 0 && <option value="">Cadastre um servico primeiro</option>}
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.nome}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="data_hora">Data e hora</label>
            <input
              id="data_hora"
              name="data_hora"
              type="datetime-local"
              value={formState.data_hora}
              onChange={handleChange}
              required
            />
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={actionModalOpen && !!selectedAppointment}
        title="Detalhes do agendamento"
        onClose={() => {
          setActionModalOpen(false);
          setSelectedAppointment(null);
        }}
        footer={
          <>
            <button
              type="button"
              className="btn"
              onClick={() => openAttendModal(selectedAppointment)}
              disabled={!selectedAppointment}
            >
              Atender
            </button>
            <button
              type="button"
              className="btn btn--secondary"
              onClick={() => handleCancelAppointment(selectedAppointment)}
              disabled={!selectedAppointment}
            >
              Desmarcar
            </button>
            <button
              type="button"
              className="btn btn--secondary"
              onClick={() => openEditModal(selectedAppointment)}
              disabled={!selectedAppointment}
            >
              Editar
            </button>
          </>
        }
      >
        {selectedAppointment ? (
          <div className="list-wrapper">
            <p>
              <strong>Cliente:</strong> {selectedAppointment.cliente_nome}
            </p>
            <p>
              <strong>Servico:</strong> {selectedAppointment.servico_nome}
            </p>
            <p>
              <strong>Data/Hora:</strong> {new Date(selectedAppointment.data_hora).toLocaleString('pt-BR')}
            </p>
            <div>
              <strong>Produtos cadastrados:</strong>
              {selectedAppointment.produtos.length ? (
                <ul>
                  {selectedAppointment.produtos.map((item) => (
                    <li key={`${selectedAppointment.id}-${item.produto_id}`}>
                      {item.produto.nome} -
                      {' '}
                      {item.consumo.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                      {' '}
                      {item.produto.unidade}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>Nenhum produto vinculado ainda.</p>
              )}
            </div>
          </div>
        ) : (
          <p>Selecione um agendamento.</p>
        )}
      </Modal>

      <Modal
        isOpen={attendModalOpen}
        title="Registrar atendimento"
        onClose={closeAttendModal}
        footer={
          <>
            <button type="button" className="btn btn--secondary" onClick={closeAttendModal}>
              Cancelar
            </button>
            <button type="submit" form="attend-form" className="btn">
              Finalizar
            </button>
          </>
        }
      >
        <form id="attend-form" className="form-grid" onSubmit={handleAttendSubmit}>
          <div className="form-group">
            <label htmlFor="metodo_pagamento">Metodo de pagamento</label>
            <select
              id="metodo_pagamento"
              value={attendPayment}
              onChange={(event) => setAttendPayment(event.target.value as PaymentMethod)}
            >
              {paymentOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Produtos utilizados</label>
            <p className="card__meta">Informe o consumo real durante o atendimento.</p>
            {attendUsages.map((usage, index) => {
              const selectedProduct = products.find((product) => String(product.id) === usage.produto_id);
              return (
                <div key={index} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <select
                    value={usage.produto_id}
                    onChange={(event) => handleUsageChange(index, 'produto_id', event.target.value)}
                    required
                  >
                    <option value="">Selecione um produto</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.nome} ({product.unidade})
                      </option>
                    ))}
                  </select>

                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    placeholder="Consumo"
                    value={usage.consumo}
                    onChange={(event) => handleUsageChange(index, 'consumo', event.target.value)}
                    required
                  />
                  {selectedProduct && <span>{selectedProduct.unidade}</span>}
                  {attendUsages.length > 1 && (
                    <button type="button" className="btn btn--secondary" onClick={() => removeUsageRow(index)}>
                      Remover
                    </button>
                  )}
                </div>
              );
            })}
            <button type="button" className="btn btn--secondary" onClick={addUsageRow}>
              Adicionar produto
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AppointmentsPage;
