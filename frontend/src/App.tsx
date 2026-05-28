import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Sidebar from '@/components/Sidebar';
import AppointmentsPage from '@/pages/Appointments';
import ClientsPage from '@/pages/Clients';
import ServicesPage from '@/pages/Services';
import ProductsPage from '@/pages/Stock';
import StockOverviewPage from '@/pages/StockOverview';
import StockMovementsPage from '@/pages/StockMovements';
import LoginPage from '@/pages/Login';
import RegisterPage from '@/pages/Register';
import ProtectedRoute from '@/components/ProtectedRoute';
import { AuthProvider } from '@/contexts/AuthContext';
import { SettingsProvider } from '@/contexts/SettingsContext';

const App = () => {
  return (
    <AuthProvider>
      <SettingsProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/cadastro" element={<RegisterPage />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <div className="app-layout">
                    <Sidebar />
                    <main className="main-area">
                      <Routes>
                        <Route path="/" element={<AppointmentsPage />} />
                        <Route path="/clientes" element={<ClientsPage />} />
                        <Route path="/servicos" element={<ServicesPage />} />
                        <Route path="/produtos" element={<ProductsPage />} />
                        <Route path="/estoque" element={<StockOverviewPage />} />
                        <Route path="/movimentacoes" element={<StockMovementsPage />} />
                        <Route path="*" element={<Navigate to="/" replace />} />
                      </Routes>
                    </main>
                  </div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </SettingsProvider>
    </AuthProvider>
  );
};

export default App;
