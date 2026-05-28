import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import PageHeader from "@/components/PageHeader";
import Alert from "@/components/Alert";
import Modal from "@/components/Modal";
import type { Product, Unit } from "@/types";
import { createProduct, deleteProduct, fetchProducts, updateProduct } from "@/api/stock";

interface ProductFormState {
  nome: string;
  tipo: string;
  quantidade: number | "";
  preco: number | "";
  tamanho: number | "";
  unidade: Unit;
  classe: "VENDA" | "INSUMO";
}

type FeedbackState = { type: "success" | "error"; message: string } | null;

const emptyForm: ProductFormState = {
  nome: "",
  tipo: "",
  quantidade: "",
  preco: "",
  tamanho: "",
  unidade: "ML",
  classe: "INSUMO"
};

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL"
});

const ProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [formState, setFormState] = useState<ProductFormState>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const response = await fetchProducts();
      setProducts(response.produtos || []);
    } catch (error) {
      setFeedback({ type: "error", message: (error as Error).message });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setFormState((prev) => ({
      ...prev,
      [name]:
        name === "quantidade" || name === "preco" || name === "tamanho"
          ? value === ""
            ? ""
            : Number(value)
          : value
    }));
  };

  const resetForm = () => {
    setFormState(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback(null);

    if (
      !formState.nome ||
      !formState.tipo ||
      formState.quantidade === "" ||
      formState.preco === "" ||
      formState.tamanho === ""
    ) {
      setFeedback({ type: "error", message: "Preencha todos os campos do produto." });
      return;
    }

    const payload = {
      nome: formState.nome.trim(),
      tipo: formState.tipo.trim(),
      quantidade: Number(formState.quantidade),
      preco: Number(formState.preco),
      tamanho: Number(formState.tamanho),
      unidade: formState.unidade,
      classe: formState.classe
    };

    try {
      if (editingId) {
        const response = await updateProduct(editingId, payload);
        setProducts((prev) => prev.map((product) => (product.id === editingId ? response.produto : product)));
        setFeedback({ type: "success", message: response.message });
      } else {
        const response = await createProduct(payload);
        setProducts((prev) => [response.produto, ...prev]);
        setFeedback({ type: "success", message: response.message });
      }
      resetForm();
      setModalOpen(false);
    } catch (error) {
      setFeedback({ type: "error", message: (error as Error).message });
    }
  };

  const startEdit = (product: Product) => {
    setEditingId(product.id);
    setFormState({
      nome: product.nome,
      tipo: product.tipo,
      quantidade: product.quantidade,
      preco: Number(product.preco),
      tamanho: Number(product.tamanho),
      unidade: product.unidade,
      classe: product.classe
    });
    setModalOpen(true);
  };

  const openCreateModal = () => {
    resetForm();
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Deseja realmente excluir este produto? Essa acao nao pode ser desfeita.")) {
      return;
    }

    try {
      await deleteProduct(id);
      setProducts((prev) => prev.filter((product) => product.id !== id));
      if (editingId === id) {
        resetForm();
      }
      setFeedback({ type: "success", message: "Produto removido com sucesso." });
    } catch (error) {
      setFeedback({ type: "error", message: (error as Error).message });
    }
  };

  return (
    <div className="page-flow">
      <PageHeader
        title="Produtos"
        description="Cadastre e atualize itens de venda e insumos do salao."
        actionLabel="Novo produto"
        onAction={openCreateModal}
      />

      {feedback && <Alert type={feedback.type} message={feedback.message} />}

      <div className="page-card">
        <div className="page-card__header">
          <h2>Produtos cadastrados</h2>
          <button type="button" className="btn btn--ghost" onClick={loadProducts}>
            Recarregar
          </button>
        </div>

        {loading ? (
          <p>Carregando produtos...</p>
        ) : products.length ? (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Tipo</th>
                  <th>Classe</th>
                  <th>Quantidade</th>
                  <th>Preco</th>
                  <th>Tamanho</th>
                  <th>Criado em</th>
                  <th>Acoes</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td data-label="Nome">{product.nome}</td>
                    <td data-label="Tipo">{product.tipo}</td>
                    <td data-label="Classe">{product.classe === "VENDA" ? "Venda" : "Insumo"}</td>
                    <td data-label="Quantidade">{product.quantidade}</td>
                    <td data-label="Preco">{currencyFormatter.format(Number(product.preco))}</td>
                    <td data-label="Tamanho">
                      {Number(product.tamanho).toLocaleString("pt-BR", {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 2
                      })}{" "}
                      {product.unidade}
                    </td>
                    <td data-label="Criado em">{new Date(product.created_at).toLocaleDateString("pt-BR")}</td>
                    <td data-label="Acoes">
                      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                        <button type="button" className="btn" onClick={() => startEdit(product)}>
                          Editar
                        </button>
                        <button type="button" className="btn btn--secondary" onClick={() => handleDelete(product.id)}>
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>Nenhum produto cadastrado ate o momento.</p>
        )}
      </div>

      <Modal
        isOpen={modalOpen}
        title={editingId ? "Editar produto" : "Cadastrar novo produto"}
        onClose={() => {
          setModalOpen(false);
          resetForm();
        }}
        footer={
          <>
            {editingId && (
              <button type="button" className="btn btn--secondary" onClick={resetForm}>
                Cancelar edicao
              </button>
            )}
            <button type="button" className="btn btn--secondary" onClick={() => setModalOpen(false)}>
              Fechar
            </button>
            <button type="submit" form="product-form" className="btn">
              {editingId ? "Salvar alteracoes" : "Cadastrar"}
            </button>
          </>
        }
      >
        <form id="product-form" className="form-grid" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="nome">Nome</label>
            <input
              id="nome"
              name="nome"
              value={formState.nome}
              onChange={handleChange}
              placeholder="Ex.: Shampoo nutritivo"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="tipo">Tipo ou categoria</label>
            <input
              id="tipo"
              name="tipo"
              value={formState.tipo}
              onChange={handleChange}
              placeholder="Ex.: Higiene"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="quantidade">Quantidade</label>
            <input
              id="quantidade"
              name="quantidade"
              type="number"
              min={0}
              value={formState.quantidade}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="preco">Preco (R$)</label>
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
            <label htmlFor="tamanho">Tamanho/Capacidade</label>
            <input
              id="tamanho"
              name="tamanho"
              type="number"
              min={0}
              step="0.01"
              value={formState.tamanho}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="unidade">Unidade</label>
            <select id="unidade" name="unidade" value={formState.unidade} onChange={handleChange}>
              <option value="ML">ML</option>
              <option value="L">L</option>
              <option value="G">G</option>
              <option value="KG">KG</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="classe">Classe</label>
            <select id="classe" name="classe" value={formState.classe} onChange={handleChange}>
              <option value="INSUMO">Insumo</option>
              <option value="VENDA">Venda</option>
            </select>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProductsPage;
