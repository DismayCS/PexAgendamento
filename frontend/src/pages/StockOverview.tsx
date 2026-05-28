import { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";
import Alert from "@/components/Alert";
import type { ProductForecast } from "@/types";
import { fetchStockForecast } from "@/api/stock";

type FeedbackState = { type: "success" | "error"; message: string } | null;

const StockOverviewPage = () => {
  const [forecast, setForecast] = useState<ProductForecast[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<FeedbackState>(null);

  useEffect(() => {
    loadForecast();
  }, []);

  const loadForecast = async () => {
    setLoading(true);
    try {
      const response = await fetchStockForecast();
      setForecast(response.previsao || []);
    } catch (error) {
      setFeedback({ type: "error", message: (error as Error).message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-flow">
      <PageHeader
        title="Estoque"
        description="Monitore a previsão de consumo e antecipe compras de produtos."
        actionLabel="Atualizar previsão"
        onAction={loadForecast}
      />

      {feedback && <Alert type={feedback.type} message={feedback.message} />}

      <div className="page-card">
        {loading ? (
          <p>Calculando previsão...</p>
        ) : forecast.length ? (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Produto</th>
                  <th>Classe</th>
                  <th>Consumo agendado</th>
                  <th>Vendas (30 dias)</th>
                  <th>Previsão 7 dias</th>
                  <th>Estoque atual</th>
                  <th>Saldo estimado</th>
                </tr>
              </thead>
              <tbody>
                {forecast.map((item) => {
                  const saldo = item.estoqueAtual - item.previsao7dias;
                  return (
                    <tr key={item.produto.id}>
                      <td data-label="Produto">{item.produto.nome}</td>
                      <td data-label="Classe">{item.produto.classe === "VENDA" ? "Venda" : "Insumo"}</td>
                      <td data-label="Consumo agendado">{item.consumoAgendado.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}</td>
                      <td data-label="Vendas (30 dias)">{item.vendas30dias.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}</td>
                      <td data-label="Previsao 7 dias">{item.previsao7dias.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}</td>
                      <td data-label="Estoque atual">{item.estoqueAtual}</td>
                      <td data-label="Saldo estimado" style={{ color: saldo < 0 ? 'var(--danger)' : 'inherit' }}>
                        {saldo.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p>Cadastre produtos e serviços para gerar a previsão de consumo.</p>
        )}
      </div>
    </div>
  );
};

export default StockOverviewPage;
