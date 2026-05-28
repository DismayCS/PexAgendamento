import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import PageHeader from "@/components/PageHeader";
import Alert from "@/components/Alert";
import Modal from "@/components/Modal";
import type { MovementType, Product, StockMovement } from "@/types";
import { fetchProducts, fetchMovements, registerMovement } from "@/api/stock";

const movementOptions: { value: MovementType; label: string }[] = [
  { value: "ENTRADA", label: "Entrada" },
  { value: "SAIDA", label: "Saida" },
  { value: "REAJUSTE", label: "Reajuste" }
];

type FeedbackState = { type: "success" | "error"; message: string } | null;

const initialForm = {
  produto_id: "",
  tipo: "ENTRADA" as MovementType,
  quantidade: 0,
  observacao: ""
};

const StockMovementsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [filter, setFilter] = useState<MovementType | "">("");
  const [formState, setFormState] = useState(initialForm);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadMovements(filter ? filter : undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [productsRes, movementsRes] = await Promise.all([fetchProducts(), fetchMovements()]);
      setProducts(productsRes.produtos || []);
      setMovements(movementsRes.movimentos || []);
    } catch (error) {
      setFeedback({ type: "error", message: (error as Error).message });
    } finally {
      setLoading(false);
    }
  };

  const loadMovements = async (tipo?: MovementType) => {
    try {
      const response = await fetchMovements(tipo);
      setMovements(response.movimentos || []);
    } catch (error) {
      setFeedback({ type: "error", message: (error as Error).message });
    }
  };

  const handleFilterChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value as MovementType | "";
    setFilter(value);
  };

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: name === "quantidade" ? Number(value) : value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback(null);

    if (!formState.produto_id || !formState.quantidade) {
      setFeedback({ type: "error", message: "Selecione o produto e informe a quantidade." });
      return;
    }

    try {
      const response = await registerMovement({
        produto_id: Number(formState.produto_id),
        tipo: formState.tipo,
        quantidade: formState.quantidade,
        observacao: formState.observacao || undefined
      });
      setMovements((prev) => [response.movimento, ...prev]);
      setFeedback({ type: "success", message: response.message });
      setFormState(initialForm);
      setModalOpen(false);
    } catch (error) {
      setFeedback({ type: "error", message: (error as Error).message });
    }
  };

  const openModal = () => {
    setFormState(initialForm);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setFormState(initialForm);
  };

  return (
    <div className="page-flow">
      <PageHeader
        title="Movimentacoes de Estoque"
        description="Registre e acompanhe entradas, saidas e reajustes."
        actionLabel="Registrar movimentacao"
        onAction={products.length ? openModal : undefined}
      />

      {feedback && <Alert type={feedback.type} message={feedback.message} />}

      <div className="page-card">
        <div className="form-group" style={{ maxWidth: "240px" }}>
          <label htmlFor="filter">Filtrar por tipo</label>
          <select id="filter" value={filter} onChange={handleFilterChange}>
            <option value="">Todos</option>
            {movementOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <p>Carregando movimentacoes...</p>
        ) : movements.length ? (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Produto</th>
                  <th>Tipo</th>
                  <th>Quantidade</th>
                  <th>Observacao</th>
                </tr>
              </thead>
              <tbody>
                {movements.map((movement) => (
                  <tr key={movement.id}>
                    <td data-label="Data">{new Date(movement.created_at).toLocaleString("pt-BR")}</td>
                    <td data-label="Produto">{movement.produto?.nome}</td>
                    <td data-label="Tipo">{movement.tipo}</td>
                    <td data-label="Quantidade">{movement.quantidade}</td>
                    <td data-label="Observacao">{movement.observacao || "---"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>Nenhuma movimentacao registrada.</p>
        )}
      </div>

      <Modal
        isOpen={modalOpen}
        title="Registrar movimentacao"
        onClose={closeModal}
        footer={
          <>
            <button type="button" className="btn btn--secondary" onClick={closeModal}>
              Cancelar
            </button>
            <button type="submit" form="movement-form" className="btn">
              Registrar
            </button>
          </>
        }
      >
        <form id="movement-form" className="form-grid" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="produto_id">Produto</label>
            <select
              id="produto_id"
              name="produto_id"
              value={formState.produto_id}
              onChange={handleChange}
              required
            >
              <option value="">Selecione um produto</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.nome} (Qtd: {product.quantidade})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="tipo">Tipo</label>
            <select id="tipo" name="tipo" value={formState.tipo} onChange={handleChange}>
              {movementOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="quantidade">Quantidade</label>
            <input
              id="quantidade"
              name="quantidade"
              type="number"
              value={formState.quantidade}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="observacao">Observacao</label>
            <textarea
              id="observacao"
              name="observacao"
              value={formState.observacao}
              onChange={handleChange}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default StockMovementsPage;
