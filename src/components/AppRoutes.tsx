import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import Login from '@/pages/Login';
import ServidorDashboard from '@/pages/Dashboards/ServidorDashboard';
import ChefiaDashboard from '@/pages/Dashboards/ChefiaDashboard';
import AdminDashboard from '@/pages/Dashboards/AdminDashboard';
import RhDashboard from '@/pages/Dashboards/RhDashboard';
import RegistrarPonto from '@/pages/Servidor/RegistrarPonto';
import MinhaJustificativa from '@/pages/Servidor/MinhaJustificativa';
import MinhaFrequencia from '@/pages/Servidor/MinhaFrequencia';
import BancoHoras from '@/pages/Servidor/BancoHoras';
import RelatoriosRh from '@/pages/Rh/Relatorios';
import RelatoriosServidor from '@/pages/Servidor/Relatorios';
import GestaoServidores from '@/pages/Rh/GestaoServidores';
import GestaoSetores from '@/pages/Rh/GestaoSetores';
import Atestos from '@/pages/Rh/Atestos';
import AprovacoesGerais from '@/pages/Rh/AprovacoesGerais';
import TemplatesFrequencia from '@/pages/Rh/TemplatesFrequencia';
import ConfigurarJornadas from '@/pages/Rh/ConfigurarJornadas';
import LogsAuditoria from '@/pages/Rh/LogsAuditoria';
import ExportarDados from '@/pages/Rh/ExportarDados';
import CadastroFacial from '@/pages/Rh/CadastroFacial';
import Aprovacoes from '@/pages/Chefia/Aprovacoes';
import MinhaEquipe from '@/pages/Chefia/MinhaEquipe';
import UploadFrequencia from '@/pages/Chefia/UploadFrequencia';
import Escalas from '@/pages/Chefia/Escalas';
import RelatoriosChefia from '@/pages/Chefia/Relatorios';
// Imports das páginas Admin
import GestaoCompleta from '@/pages/Admin/GestaoCompleta';
import AprovacoesGeraisAdmin from '@/pages/Admin/AprovacoesGerais';
import RelatoriosAdmin from '@/pages/Admin/Relatorios';
import TemplatesFormularios from '@/pages/Admin/TemplatesFormularios';
import CriadorFormulariosAdmin from '@/pages/Admin/CriadorFormularios';
import ConfiguracoesSistema from '@/pages/Admin/ConfiguracoesSistema';
import AuditoriaLogs from '@/pages/Admin/AuditoriaLogs';
import BackupArquivos from '@/pages/Admin/BackupArquivos';
import BancoDados from '@/pages/Admin/BancoDados';
import GerenciamentoFeriados from '@/pages/Admin/GerenciamentoFeriados';
import CriadorFormulariosRh from '@/pages/Rh/CriadorFormularios';
import CriadorFormularios from '@/pages/Chefia/CriadorFormularios';
import NotFound from '@/pages/NotFound';

export function AppRoutes() {
  const { user } = useAuth();
  
  return (
    <Routes>
      {/* Rota pública de login */}
      <Route path="/login" element={<Login />} />
      
      {/* Rotas protegidas para Servidor */}
      <Route path="/" element={
        <ProtectedRoute allowedRoles={['servidor']}>
          <ServidorDashboard />
        </ProtectedRoute>
      } />
      
      <Route path="/registrar-ponto" element={
        <ProtectedRoute allowedRoles={['servidor']}>
          <RegistrarPonto />
        </ProtectedRoute>
      } />
      
      <Route path="/gestao-ocorrencias" element={
        <ProtectedRoute allowedRoles={['servidor']}>
          <MinhaJustificativa />
        </ProtectedRoute>
      } />
      
      <Route path="/minha-frequencia" element={
        <ProtectedRoute allowedRoles={['servidor']}>
          <MinhaFrequencia />
        </ProtectedRoute>
      } />
      
      <Route path="/banco-horas" element={
        <ProtectedRoute allowedRoles={['servidor']}>
          <BancoHoras />
        </ProtectedRoute>
      } />
      
      <Route path="/servidor/relatorios" element={
        <ProtectedRoute allowedRoles={['servidor']}>
          <RelatoriosServidor />
        </ProtectedRoute>
      } />
      
      {/* Rotas protegidas para Chefia */}
      <Route path="/chefia" element={
        <ProtectedRoute allowedRoles={['chefia']}>
          <ChefiaDashboard />
        </ProtectedRoute>
      } />
      
      <Route path="/chefia/equipe" element={
        <ProtectedRoute allowedRoles={['chefia', 'admin', 'rh']}>
          <MinhaEquipe />
        </ProtectedRoute>
      } />

      <Route path="/chefia/escalas" element={
        <ProtectedRoute allowedRoles={['chefia', 'admin', 'rh']}>
          <Escalas />
        </ProtectedRoute>
      } />

      <Route path="/chefia/upload-frequencia" element={
        <ProtectedRoute allowedRoles={['chefia', 'admin', 'rh']}>
          <UploadFrequencia />
        </ProtectedRoute>
      } />

      <Route path="/chefia/relatorios" element={
        <ProtectedRoute allowedRoles={['chefia', 'admin', 'rh']}>
          <RelatoriosChefia />
        </ProtectedRoute>
      } />
      
      <Route path="/chefia/criador-formularios" element={
        <ProtectedRoute allowedRoles={['chefia', 'admin', 'rh']}>
          <CriadorFormularios />
        </ProtectedRoute>
      } />
      
      <Route path="/minha-equipe" element={
        <ProtectedRoute allowedRoles={['chefia', 'admin', 'rh']}>
          <MinhaEquipe />
        </ProtectedRoute>
      } />
      
      <Route path="/upload-frequencia" element={
        <ProtectedRoute allowedRoles={['chefia', 'admin', 'rh']}>
          <UploadFrequencia />
        </ProtectedRoute>
      } />
      
      <Route path="/chefia/aprovacoes" element={
        <ProtectedRoute allowedRoles={['chefia', 'admin', 'rh']}>
          <Aprovacoes />
        </ProtectedRoute>
      } />
      
      {/* Rotas protegidas para Admin */}
      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminDashboard />
        </ProtectedRoute>
      } />
      
      <Route path="/admin/gestao-completa" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <GestaoCompleta />
        </ProtectedRoute>
      } />
      
      <Route path="/admin/aprovacoes-gerais" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AprovacoesGeraisAdmin />
        </ProtectedRoute>
      } />
      
      <Route path="/admin/relatorios" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <RelatoriosAdmin />
        </ProtectedRoute>
      } />
      
      <Route path="/admin/templates-formularios" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <TemplatesFormularios />
        </ProtectedRoute>
      } />
      
      <Route path="/admin/criador-formularios" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <CriadorFormulariosAdmin />
        </ProtectedRoute>
      } />
      
      <Route path="/admin/configuracoes-sistema" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <ConfiguracoesSistema />
        </ProtectedRoute>
      } />
      
      <Route path="/admin/auditoria-logs" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AuditoriaLogs />
        </ProtectedRoute>
      } />
      
      <Route path="/admin/backup-arquivos" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <BackupArquivos />
        </ProtectedRoute>
      } />
      
      <Route path="/admin/banco-dados" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <BancoDados />
        </ProtectedRoute>
      } />
      
      <Route path="/admin/gerenciar-feriados" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <GerenciamentoFeriados />
        </ProtectedRoute>
      } />
      
      {/* Rotas removidas: gestao-colaboradores, configuracoes, auditoria (arquivos ausentes) */}
      
      <Route path="/rh/relatorios" element={
        <ProtectedRoute allowedRoles={['rh', 'admin']}>
          <RelatoriosRh />
        </ProtectedRoute>
      } />
      
      <Route path="/rh/gestao-servidores" element={
        <ProtectedRoute allowedRoles={['rh', 'admin']}>
          <GestaoServidores />
        </ProtectedRoute>
      } />

      <Route path="/rh/gestao-setores" element={
        <ProtectedRoute allowedRoles={['rh', 'admin']}>
          <GestaoSetores />
        </ProtectedRoute>
      } />

      <Route path="/rh/atestos" element={
        <ProtectedRoute allowedRoles={['rh', 'admin']}>
          <Atestos />
        </ProtectedRoute>
      } />

      <Route path="/rh/aprovacoes-gerais" element={
        <ProtectedRoute allowedRoles={['rh', 'admin']}>
          <AprovacoesGerais />
        </ProtectedRoute>
      } />
      
      <Route path="/rh/templates-frequencia" element={
        <ProtectedRoute allowedRoles={['rh', 'admin']}>
          <TemplatesFrequencia />
        </ProtectedRoute>
      } />
      
      <Route path="/rh/criador-formularios" element={
        <ProtectedRoute allowedRoles={['rh', 'admin']}>
          <CriadorFormulariosRh />
        </ProtectedRoute>
      } />
      
      <Route path="/rh/configurar-jornadas" element={
        <ProtectedRoute allowedRoles={['rh', 'admin']}>
          <ConfigurarJornadas />
        </ProtectedRoute>
      } />
      
      <Route path="/rh/logs-auditoria" element={
        <ProtectedRoute allowedRoles={['rh', 'admin']}>
          <LogsAuditoria />
        </ProtectedRoute>
      } />
      
      <Route path="/rh/exportar-dados" element={
        <ProtectedRoute allowedRoles={['rh', 'admin']}>
          <ExportarDados />
        </ProtectedRoute>
      } />

      <Route path="/rh/cadastro-facial" element={
        <ProtectedRoute allowedRoles={['rh', 'admin']}>
          <CadastroFacial />
        </ProtectedRoute>
      } />
      
      {/* Rotas protegidas para RH */}
      <Route path="/rh" element={
        <ProtectedRoute allowedRoles={['rh']}>
          <RhDashboard />
        </ProtectedRoute>
      } />
      
      {/* Rota 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}