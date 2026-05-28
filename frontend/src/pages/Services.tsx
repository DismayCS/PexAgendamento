import { useEffect, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import PageHeader from '@/components/PageHeader';
import Modal from '@/components/Modal';
import Alert from '@/components/Alert';
import type { Product, Service } from '@/types';
import { createService, deleteService, fetchServices, updateService, type ServicePayload } from '@/api/services';
import { fetchProducts } from '@/api/stock';

interface ServiceFormState {
  nome: string;
  duracao: number;
  observacao: string;
  preco: number;
}

interface ProductUsageForm {
  produto_id: string;
  consumo: string;
}

type FeedbackState = { type: 'success' | 'error'; message: string } | null;

const emptyForm: ServiceFormState = {
  nome: '',
  duracao: 0,
  observacao: '',
  preco: 0
};

const createEmptyUsage = (): ProductUsageForm => ({
  produto_id: '',
  consumo: ''
});

const ServicesPage = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [formState, setFormState] = useState<ServiceFormState>(emptyForm);
  const [productUsages, setProductUsages] = useState<ProductUsageForm[]>([createEmptyUsage()]);
  const [feedback, setFeedback] = useState<FeedbackState>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [servicesResponse, productsResponse] = await Promise.all([fetchServices(), fetchProducts()]);
      setServices(servicesResponse.servicos || []);
      setProducts(productsResponse.produtos || []);
    } catch (error) {
      setFeedback({ type: 'error', message: (error as Error).message });
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setSelectedService(null);
    setFormState(emptyForm);
    setProductUsages([createEmptyUsage()]);
    setModalOpen(true);
  };

  const openEditModal = (service: Service) => {
    setSelectedService(service);
    setFormState({
      nome: service.nome,
      duracao: service.duracao,
      observacao: service.observacao || '',
      preco: service.preco
    });
    setProductUsages(
      service.produtos.length
        ? service.produtos.map((item) => ({ produto_id: String(item.produto_id), consumo: String(item.consumo) }))
        : [createEmptyUsage()]
    );
    setModalOpen(true);
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    if (name === 'duracao' || name === 'preco') {
      setFormState((prev) => ({ ...prev, [name]: Number(value) }));
    } else {
      setFormState((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleUsageChange = (index: number, field: keyof ProductUsageForm, value: string) => {
    setProductUsages((prev) => prev.map((usage, idx) => (idx === index ? { ...usage, [field]: value } : usage)));
  };

  const addUsageRow = () => {
    setProductUsages((prev) => [...prev, createEmptyUsage()]);
  };

  const removeUsageRow = (index: number) => {
    setProductUsages((prev) => (prev.length === 1 ? prev : prev.filter((_, idx) => idx !== index)));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback(null);

    if (!formState.nome || !formState.duracao || formState.preco < 0) {
      setFeedback({ type: 'error', message: 'Informe nome, duracao e um preco valido.' });
      return;
    }

    if (!products.length) {
      setFeedback({ type: 'error', message: 'Cadastre produtos no estoque antes de vincula-los ao servico.' });
      return;
    }

    if (productUsages.some((usage) => !usage.produto_id || !usage.consumo)) {
      setFeedback({ type: 'error', message: 'Informe o produto e o consumo em todas as linhas.' });
      return;
    }

    const produtosPayload: ServicePayload['produtos'] = [];
    const ids = new Set<number>();

    for (const usage of productUsages) {
      const produtoId = Number(usage.produto_id);
      const consumoValue = Number(usage.consumo);

      if (!produtoId || Number.isNaN(consumoValue) || consumoValue <= 0) {
        setFeedback({ type: 'error', message: 'Consumo deve ser um numero maior que zero para cada produto.' });
        return;
      }

      if (!products.some((product) => product.id === produtoId)) {
        setFeedback({ type: 'error', message: 'Selecione produtos validos.' });
        return;
      }

      if (ids.has(produtoId)) {
        setFeedback({ type: 'error', message: 'Cada produto so pode ser listado uma vez por servico.' });
        return;
      }

      ids.add(produtoId);
      produtosPayload.push({ produto_id: produtoId, consumo: consumoValue });
    }

    try {
      const payload: ServicePayload = {
        nome: formState.nome.trim(),
        duracao: formState.duracao,
        observacao: formState.observacao.trim() || undefined,
        preco: formState.preco,
        produtos: produtosPayload
      };

      if (selectedService) {
        const response = await updateService(selectedService.id, payload);
        setServices((prev) => prev.map((service) => (service.id === response.servico.id ? response.servico : service)));
        setFeedback({ type: 'success', message: response.message });
      } else {
        const response = await createService(payload);
        setServices((prev) => [response.servico, ...prev]);
        setFeedback({ type: 'success', message: response.message });
      }
      closeModal();
    } catch (error) {
      setFeedback({ type: 'error', message: (error as Error).message });
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Deseja realmente excluir este servico?')) {
      return;
    }
    try {
      await deleteService(id);
      setServices((prev) => prev.filter((service) => service.id !== id));
      setFeedback({ type: 'success', message: 'Servico removido com sucesso.' });
    } catch (error) {
      setFeedback({ type: 'error', message: (error as Error).message });
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedService(null);
    setFormState(emptyForm);
    setProductUsages([createEmptyUsage()]);
  };

  return (
    <div className="page-flow">
      <PageHeader
        title="Servicos"
        description="Defina o consumo de produtos em cada servico para controlar o estoque."
        actionLabel="Novo servico"
        onAction={openCreateModal}
      />

      {feedback && <Alert type={feedback.type} message={feedback.message} />}

      <div className="page-card">
        {loading ? (
          <p>Carregando servicos...</p>
        ) : services.length ? (
          <div className="card-grid">
            {services.map((service) => (
              <article key={service.id} className="card">
                <h3>{service.nome}</h3>
                <p className="card__meta">Duracao: {service.duracao} minutos</p>
                <p className="card__meta">
                  Preco: {service.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
                <p className="card__meta">Observacoes: {service.observacao || '---'}</p>
                <div className="card__meta">
                  <strong>Produtos utilizados:</strong>
                  {service.produtos.length ? (
                    <ul>
                      {service.produtos.map((item) => (
                        <li key={`${service.id}-${item.produto_id}`}>
                          {item.produto.nome} -
                          {' '}
                          {item.consumo.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                          {' '}
                          {item.produto.unidade}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span> Nenhum produto vinculado.</span>
                  )}
                </div>
                <div className="card__actions">
                  <button className="btn" type="button" onClick={() => openEditModal(service)}>
                    Editar
                  </button>
                  <button className="btn btn--secondary" type="button" onClick={() => handleDelete(service.id)}>
                    Excluir
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p>Nenhum servico cadastrado.</p>
        )}
      </div>

      <Modal
        isOpen={modalOpen}
        title={selectedService ? 'Editar servico' : 'Novo servico'}
        onClose={closeModal}
        footer={
          <>
            <button type="button" className="btn btn--secondary" onClick={closeModal}>
              Cancelar
            </button>
            <button type="submit" form="service-form" className="btn">
              {selectedService ? 'Atualizar' : 'Salvar'}
            </button>
          </>
        }
      >
        <form id="service-form" className="form-grid" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="nome">Nome</label>
            <input id="nome" name="nome" value={formState.nome} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label htmlFor="duracao">Duracao (minutos)</label>
            <input
              id="duracao"
              name="duracao"
              type="number"
              min={10}
              value={formState.duracao}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="preco">Preco</label>
            <input
              id="preco"
              name="preco"
              type="number"
              min={0}
              step="0.01"
              value={formState.preco}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="observacao">Observacoes</label>
            <textarea id="observacao" name="observacao" value={formState.observacao} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Produtos utilizados</label>
            <p className="card__meta">Defina quanto de cada produto e consumido em um atendimento.</p>
            {productUsages.map((usage, index) => {
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
                  {productUsages.length > 1 && (
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

export default ServicesPage;
