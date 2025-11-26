# Arquitetura do Sistema - Controle de Ponto SEFAZ-TO

## Visão Geral

Sistema web moderno construído com React, TypeScript e Tailwind CSS, projetado para ser escalável, responsivo e com suporte a funcionalidades offline.

---

## Stack Tecnológica Atual

### Frontend
- **React 18.3.1** - Biblioteca principal
- **TypeScript** - Tipagem estática
- **Vite** - Build tool e dev server
- **React Router DOM 6.30.1** - Roteamento

### UI/UX
- **Tailwind CSS** - Framework CSS utility-first
- **shadcn/ui** - Componentes base reutilizáveis
- **Radix UI** - Primitivos acessíveis
- **Lucide React** - Biblioteca de ícones

### Estado e Dados
- **TanStack Query (React Query)** - Gerenciamento de estado assíncrono
- **React Hook Form** - Gerenciamento de formulários
- **Zod** - Validação de schemas

### Backend (Planejado)
- **Lovable Cloud (Supabase)** - Backend as a Service
  - PostgreSQL - Banco de dados
  - Auth - Autenticação
  - Storage - Armazenamento de arquivos
  - Edge Functions - Lógica serverless

---

## Estrutura de Pastas

```
src/
├── components/           # Componentes reutilizáveis
│   ├── ui/              # Componentes base (shadcn)
│   ├── AppSidebar.tsx   # Navegação lateral
│   ├── DashboardLayout.tsx   # Layout dos dashboards
│   ├── StatsCard.tsx    # Card de estatísticas
│   └── AttendanceCalendar.tsx   # Calendário de frequência
├── pages/               # Páginas da aplicação
│   ├── Login.tsx        # Página de autenticação
│   ├── ServidorDashboard.tsx   # Dashboard do servidor
│   ├── AdminDashboard.tsx      # Dashboard administrativo
│   └── NotFound.tsx     # Página 404
├── types/               # Definições de tipos TypeScript
│   └── index.ts         # Tipos globais
├── lib/                 # Utilitários
│   └── utils.ts         # Funções auxiliares
├── hooks/               # Custom hooks
│   └── use-mobile.tsx   # Hook para detecção mobile
├── App.tsx              # Componente raiz
├── main.tsx             # Entry point
└── index.css            # Estilos globais e design system

docs/                    # Documentação
├── ROADMAP.md          # Roadmap do projeto
└── ARQUITETURA.md      # Este arquivo

public/                  # Assets estáticos
├── robots.txt
└── favicon.ico
```

---

## Design System

### Paleta de Cores

#### Light Mode
- **Primary:** HSL(217, 91%, 40%) - Azul institucional
- **Success:** HSL(142, 76%, 36%) - Verde para aprovações
- **Warning:** HSL(38, 92%, 50%) - Amarelo para pendências
- **Destructive:** HSL(0, 84%, 60%) - Vermelho para alertas

#### Dark Mode
Implementação pendente com ajustes de luminosidade mantendo a identidade visual.

### Componentes Customizados

Todos os componentes seguem o design system definido em `src/index.css`:
- Tokens de cor semânticos (não usar cores diretas)
- Gradientes institucionais
- Sombras padronizadas
- Animações suaves

---

## Arquitetura de Componentes

### Hierarquia de Layouts

```
App
└── BrowserRouter
    └── Routes
        ├── /login → Login (standalone)
        ├── / → DashboardLayout (servidor)
        │   └── ServidorDashboard
        └── /admin → DashboardLayout (admin)
            └── AdminDashboard
```

### Componentes Principais

#### DashboardLayout
- Provider do Sidebar
- Header com trigger
- Área de conteúdo responsiva
- Recebe `userRole` para configurar navegação

#### AppSidebar
- Navegação contextual por perfil
- Collapse responsivo
- Indicadores de rota ativa
- Footer com ações do usuário

#### StatsCard
- Exibição de métricas
- Suporte a ícones
- Trends opcionais
- Reutilizável em todos os dashboards

#### AttendanceCalendar
- Visualização mensal
- Status diários com cores semânticas
- Interativo (preparado para drill-down)
- Legendas dinâmicas

---

## Fluxo de Dados

### Atual (Mock Data)
```
Component State → Render
```

### Planejado (Com Backend)
```
User Action → React Query → API Call → Lovable Cloud
                ↓
            Local Cache
                ↓
            Component State → Render
```

### Offline Strategy (Planejado)
```
User Action → Local Storage/IndexedDB
                ↓
            Service Worker (PWA)
                ↓
        Sync Queue → Lovable Cloud (when online)
```

---

## Tipos de Usuário e Permissões

### Roles Definidos
```typescript
type UserRole = 'servidor' | 'chefia' | 'rh' | 'admin';
```

### Matriz de Permissões (Planejada)

| Funcionalidade | Servidor | Chefia | RH | Admin |
|----------------|----------|--------|-----|-------|
| Registrar ponto | ✅ | ✅ | ✅ | ✅ |
| Ver própria frequência | ✅ | ✅ | ✅ | ✅ |
| Aprovar frequência | ❌ | ✅ (equipe) | ✅ (todos) | ✅ |
| Gerar relatórios | ❌ | ✅ (equipe) | ✅ (todos) | ✅ |
| Configurar jornadas | ❌ | ❌ | ✅ | ✅ |
| Acessar logs auditoria | ❌ | ❌ | ✅ | ✅ |
| Gerenciar templates | ❌ | ❌ | ✅ | ✅ |
| Configurar sistema | ❌ | ❌ | ❌ | ✅ |

---

## Schema do Banco de Dados (Planejado)

### Tabelas Principais

#### users
```sql
- id (UUID, PK)
- email (TEXT, UNIQUE)
- name (TEXT)
- role (ENUM: servidor, chefia, rh, admin)
- department (TEXT)
- supervisor_id (UUID, FK → users)
- active (BOOLEAN)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### attendance_records
```sql
- id (UUID, PK)
- user_id (UUID, FK → users)
- date (DATE)
- check_in (TIMESTAMPTZ)
- check_out (TIMESTAMPTZ)
- status (ENUM: presente, falta, atraso, justificado, pendente)
- total_hours (DECIMAL)
- justification (TEXT)
- approved_by (UUID, FK → users)
- approved_at (TIMESTAMPTZ)
- created_at (TIMESTAMP)
- synced_at (TIMESTAMP) -- Para controle offline
```

#### work_schedules
```sql
- id (UUID, PK)
- user_id (UUID, FK → users)
- start_time (TIME)
- end_time (TIME)
- days_of_week (JSONB) -- [1,2,3,4,5]
- effective_from (DATE)
- effective_to (DATE)
```

#### time_bank
```sql
- id (UUID, PK)
- user_id (UUID, FK → users)
- date (DATE)
- hours (DECIMAL) -- positivo ou negativo
- type (ENUM: accrual, usage, adjustment)
- approved_by (UUID, FK → users)
- description (TEXT)
```

#### audit_logs
```sql
- id (UUID, PK)
- user_id (UUID, FK → users)
- action (TEXT)
- table_name (TEXT)
- record_id (UUID)
- old_value (JSONB)
- new_value (JSONB)
- ip_address (INET)
- created_at (TIMESTAMP)
```

#### documents
```sql
- id (UUID, PK)
- user_id (UUID, FK → users)
- type (ENUM: physical_form, justification, other)
- file_path (TEXT)
- period_start (DATE)
- period_end (DATE)
- uploaded_by (UUID, FK → users)
- approved (BOOLEAN)
- created_at (TIMESTAMP)
```

---

## APIs e Integrações

### Endpoints Planejados

#### Autenticação
- `POST /auth/login` - Login com credenciais
- `POST /auth/logout` - Encerrar sessão
- `POST /auth/refresh` - Renovar token
- `GET /auth/me` - Dados do usuário atual

#### Registro de Ponto
- `POST /attendance/clock-in` - Registrar entrada
- `POST /attendance/clock-out` - Registrar saída
- `GET /attendance/today` - Registros de hoje
- `GET /attendance/history` - Histórico de registros

#### Gestão de Frequência
- `GET /attendance/calendar/:userId/:month/:year` - Calendário mensal
- `POST /attendance/adjustment` - Solicitar ajuste
- `POST /attendance/justification` - Enviar justificativa
- `GET /attendance/mirror/:userId/:period` - Espelho de ponto

#### Aprovações
- `GET /approvals/pending` - Listar pendências
- `POST /approvals/:id/approve` - Aprovar
- `POST /approvals/:id/reject` - Rejeitar
- `POST /approvals/batch` - Aprovação em lote

#### Relatórios
- `GET /reports/employee/:userId` - Relatório individual
- `GET /reports/team/:supervisorId` - Relatório de equipe
- `POST /reports/generate` - Gerar relatório customizado
- `GET /reports/export/:format` - Exportar (PDF, Excel, CSV)

#### Banco de Horas
- `GET /timebank/:userId/balance` - Saldo atual
- `GET /timebank/:userId/history` - Histórico
- `POST /timebank/request` - Solicitar uso

---

## Segurança

### Implementações Planejadas

#### Autenticação
- JWT com refresh tokens
- SSO via OAuth2 (Google, Azure AD)
- Multi-factor authentication (MFA)
- Sessões com timeout

#### Autorização
- Row Level Security (RLS) no Supabase
- Políticas granulares por tabela
- Validação de permissões em Edge Functions

#### Proteção de Dados
- Criptografia em repouso (AES-256)
- Criptografia em trânsito (TLS 1.3)
- Sanitização de inputs
- Proteção contra SQL Injection
- Rate limiting
- CORS configurado

#### Auditoria
- Logs imutáveis de todas as ações
- Rastreamento de IPs
- Versionamento de registros
- Backup automático

---

## Performance

### Métricas Alvo
- **Time to First Byte (TTFB):** < 100ms
- **First Contentful Paint (FCP):** < 1.5s
- **Largest Contentful Paint (LCP):** < 2.5s
- **Time to Interactive (TTI):** < 3.5s
- **API Response Time:** < 200ms (P95)

### Otimizações Implementadas
- ✅ Code splitting por rota
- ✅ Tree shaking automático (Vite)
- ✅ CSS modular (Tailwind)

### Otimizações Planejadas
- ⏳ Lazy loading de componentes pesados
- ⏳ Virtualização de listas grandes
- ⏳ Cache de queries (React Query)
- ⏳ Service Worker para cache offline
- ⏳ CDN para assets estáticos
- ⏳ Compressão Brotli/Gzip

---

## Testes (Planejado)

### Estratégia de Testes
- **Unit Tests:** Vitest + React Testing Library
- **Integration Tests:** Cypress
- **E2E Tests:** Playwright
- **Load Tests:** k6 ou Artillery

### Cobertura Alvo
- Funções críticas: 90%+
- Componentes UI: 80%+
- Fluxos principais: 100%

---

## DevOps e Deploy

### CI/CD (Planejado)
- GitHub Actions para build e testes
- Deploy automático via Lovable
- Preview deployments para PRs
- Rollback automático em caso de erro

### Monitoramento (Planejado)
- Sentry para error tracking
- Analytics de uso
- Logs centralizados
- Alertas automáticos

---

## Acessibilidade (WCAG 2.1)

### Implementado
- ✅ Componentes Radix UI (acessíveis por padrão)
- ✅ Cores com contraste adequado
- ✅ Estrutura semântica HTML

### A Implementar
- ⏳ Suporte completo a navegação por teclado
- ⏳ ARIA labels em todos os interativos
- ⏳ Testes com screen readers
- ⏳ Modo de alto contraste
- ⏳ Suporte a zoom até 200%

---

## Internacionalização (i18n)

### Idiomas Planejados
- Português (Brasil) - Padrão
- Inglês - Futuro

### Biblioteca Sugerida
- react-i18next

---

## Próximos Passos Técnicos

1. **Habilitar Lovable Cloud**
   - Provisionar Supabase
   - Configurar autenticação
   - Criar schema do banco

2. **Implementar Autenticação Real**
   - JWT + Refresh tokens
   - Proteção de rotas
   - Context de usuário

3. **Desenvolver API de Registro de Ponto**
   - Edge Functions
   - Validações de negócio
   - Suporte a geolocalização

4. **Configurar PWA**
   - Service Workers
   - Manifest.json
   - Estratégia de cache

5. **Implementar Sincronização Offline**
   - IndexedDB para dados locais
   - Fila de sincronização
   - Resolução de conflitos

---

**Documento Mantido por:** Equipe de Desenvolvimento  
**Última Atualização:** Janeiro 2025  
**Versão:** 1.0
