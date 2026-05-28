import { Router } from 'express';
import agendamentoController from './controllers/agendamentoController';
import serviceController from './controllers/serviceController';
import clientController from './controllers/clientController';
import { register as registerUser, login as loginUser, logout as logoutUser, me as meUser } from './controllers/authController';
import { requireAuth } from './middlewares/authMiddleware';
import {
  listarProdutos,
  criarProduto,
  atualizarProduto,
  removerProduto,
  registrarMovimento,
  listarMovimentos,
  preverConsumo
} from './controllers/estoqueController';

const router = Router();

router.post('/auth/register', registerUser);
router.post('/auth/login', loginUser);
router.post('/auth/logout', logoutUser);
router.get('/auth/me', meUser);

router.get('/', (_req, res) => {
  res.json({ status: 'ok' });
});

router.use(requireAuth);

router.get('/agendamentos', agendamentoController.listarAgendamentos);
router.get('/agendamentos/todos', agendamentoController.listarAgendamentos);
router.post('/agendamentos', agendamentoController.criarAgendamento);
router.post('/agendamentos/criar', agendamentoController.criarAgendamento);
router.put('/agendamentos/:id', agendamentoController.editarAgendamento);
router.put('/agendamentos/editar/:id', agendamentoController.editarAgendamento);
router.delete('/agendamentos/:id', agendamentoController.excluirAgendamento);
router.delete('/agendamentos/excluir/:id', agendamentoController.excluirAgendamento);
router.post('/agendamentos/:id/atender', agendamentoController.atenderAgendamento);
router.post('/agendamentos/:id/desmarcar', agendamentoController.cancelarAgendamento);

router.get('/servicos', serviceController.getAllServices);
router.get('/servicos/todos', serviceController.getAllServices);
router.post('/servicos', serviceController.addService);
router.post('/servicos/criar', serviceController.addService);
router.put('/servicos/:id', serviceController.updateService);
router.put('/servicos/atualizar/:id', serviceController.updateService);
router.delete('/servicos/:id', serviceController.deleteService);
router.delete('/servicos/excluir/:id', serviceController.deleteService);

router.get('/clientes', clientController.getAllClients);
router.get('/clientes/todos', clientController.getAllClients);
router.get('/clientes/search', clientController.searchClient);
router.get('/clientes/pesquisar', clientController.searchClient);
router.post('/clientes', clientController.addClient);
router.post('/clientes/criar', clientController.addClient);
router.put('/clientes/:id', clientController.updateClient);
router.put('/clientes/atualizar/:id', clientController.updateClient);
router.delete('/clientes/:id', clientController.deleteClient);
router.delete('/clientes/excluir/:id', clientController.deleteClient);

router.get('/estoque/produtos', listarProdutos);
router.post('/estoque/produtos', criarProduto);
router.put('/estoque/produtos/:id', atualizarProduto);
router.delete('/estoque/produtos/:id', removerProduto);
router.get('/estoque/movimentos', listarMovimentos);
router.post('/estoque/movimentos', registrarMovimento);
router.get('/estoque/previsao', preverConsumo);

export default router;
