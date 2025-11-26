# Plano Passo a Passo de Implementação — Sistema de Ponto Híbrido

Data: Janeiro/2025  
Responsável: Equipe de Desenvolvimento

## Objetivo
Conduzir a implementação das funcionalidades pendentes do sistema de ponto híbrido com foco em: registro digital com antifraude (geofence), turno contínuo, upload e homologação de frequência física, offline‑first robusto, auditoria, autenticação real e integração com banco de dados.

## Premissas e Contexto
- Frontend React+Vite com design system shadcn; dashboards por perfil; hooks offline básicos.
- Backend atual com rotas mock e proxy para `http://localhost:3001`.
- Banco Oracle planejado (PDB `FOLHAPONTO_PDB`); necessidade de schema provisório e espelho de usuários da API externa.
- Documentação base:
  - `Docs/Melhorias/ponto_hibrido_analise_melhorias.md`
  - `Docs/PRD/PRD_Sistema_Controle_Ponto.md`
  - `Docs/FaltaImplementar/RELATORIO_GAPS.md`

## Linha do Tempo (Sugerida)
- Semana 1–2: Fundação (autenticação, DB provisório, endpoints de ponto, geofence mínima).
- Semana 3–4: Workflows (justificativas, aprovações, banco de horas, upload persistente).
- Semana 5–6: Auditoria, segurança avançada, relatórios, observabilidade.

## Passos Detalhados

### Passo 0 — Correções Críticas de Frontend
- Corrigir erro de hooks e restaurar provedores.
- Implementar `GestaoColaboradores.tsx` ausente.
- Critérios de aceite:
  - Build sem erros; rotas estáveis; QueryClientProvider funcional.
- Referências: `Docs/fase_3/Implementacao_Fase3.md:128`, `Docs/fase_3/Implementacao_Fase3.md:155`, `Docs/fase_3/Implementacao_Fase3.md:176`.

### Passo 1 — Banco Provisório + Espelho de Usuários + Autenticação
- Definir banco provisório operacional e preparar migração para Oracle.
- Implementar espelho local dos usuários vindos da API (campos `externalId`, `version`, `lastUpdated`).
- Autenticação JWT e integração AD/LDAP.
- Endpoints mínimos:
  - `POST /api/auth/login` (JWT + AD/LDAP)
  - `GET /api/users/:id` (espelho)
- Critérios de aceite:
  - Login funcional; perfis e permissões básicas; usuários espelhados atualizados.
- Referências: `Docs/PRD/PRD_Sistema_Controle_Ponto.md:95`, `Docs/fase_2/ANALISE_IMPLEMENTACOES_PENDENTES.md:86`.

### Passo 2 — Registro de Ponto Digital com Turno Contínuo
- Atualizar fluxo de `RegistroPonto` para suportar modalidade “turno contínuo” (sem `intervalo_*`).
- Regras de validação por jornada e tolerâncias; normalização de timezone.
- Endpoints mínimos:
  - `POST /api/point/register` (entrada/saída/intervalos/turno_continuo)
  - `POST /api/point/sync` (fila offline)
- Alterações no frontend:
  - `src/components/RegistroPonto.tsx:114` (determinação do próximo tipo)
  - `src/components/RegistroPonto.tsx:197` (validações)
  - `src/components/RegistroPonto.tsx:240` (registro e fila offline)
- Critérios de aceite:
  - Usuário com turno contínuo só registra `entrada` e `saída` e cumpre validações.
- Referências: `Docs/PRD/PRD_Sistema_Controle_Ponto.md:48`, `Docs/FaltaImplementar/RELATORIO_GAPS.md:12`.

### Passo 3 — Geofence Anti‑Fraude (Login + Batida)
- Implementar validação de geolocalização contra cerca eletrônica do setor.
- Quando fora da área: bloquear registro, alertar chefia imediata, registrar irregularidade (auditoria).
- Endpoints mínimos:
  - `POST /api/geo/validate` (retorna dentro/fora da cerca)
  - `POST /api/alerts/manager` (alerta chefia)
  - `POST /api/audit/irregularities` (log detalhado)
- Critérios de aceite:
  - Login e batida fora da cerca geram bloqueio, alerta e auditoria.
- Referências: `Docs/PRD/PRD_Sistema_Controle_Ponto.md:78`, `Docs/FaltaImplementar/RELATORIO_GAPS.md:11`.

### Passo 4 — Upload de Frequência Física com Persistência
- Persistir uploads, vincular ao período do colaborador e estados de processamento.
- Preparar pipeline de OCR (fase posterior) e homologação por RH.
- Endpoint mínimo:
  - `POST /api/frequency/upload` (metadados + arquivo)
- Alterações no frontend:
  - `src/pages/Chefia/UploadFrequencia.tsx:120`, `src/pages/Chefia/UploadFrequencia.tsx:130` (substituir progresso simulado por chamada real)
- Critérios de aceite:
  - Upload salva, vincula período e aparece no histórico com status real.
- Referências: `Docs/PRD/PRD_Sistema_Controle_Ponto.md:40`.

### Passo 5 — Banco de Horas, Justificativas e Aprovações
- Implementar cálculo de banco de horas e regras de negócio no backend.
- Fluxos de solicitação, aprovação por Chefia e homologação por RH.
- Endpoints mínimos:
  - `POST /api/timebank/calculate`, `POST /api/occurrences`, `POST /api/approvals`
- Critérios de aceite:
  - Ajustes impactam banco de horas e refletem na frequência com auditoria.
- Referências: `Docs/fase_1/ROADMAP.md:196`, `Docs/fase_2/ANALISE_IMPLEMENTACOES_PENDENTES.md:116`.

### Passo 6 — Auditoria Completa e Segurança
- Logs imutáveis (append‑only) por evento de ponto/justificativa/upload.
- Assinatura digital de eventos (HMAC) e `content_hash` para anexos.
- MFA opcional, bloqueios por IP/dispositivo, reputação de dispositivo.
- Endpoints mínimos:
  - `POST /api/audit/events`, `GET /api/audit/reports`
- Critérios de aceite:
  - Trilha de evidência completa disponível por perfil RH/Admin.
- Referências: `Docs/Melhorias/ponto_hibrido_analise_melhorias.md:31`, `Docs/PRD/PRD_Sistema_Controle_Ponto.md:95`.

### Passo 7 — Offline‑First Robusto
- Fila local em `IndexedDB` com `client_event_id`, `content_hash`, backoff exponencial e deduplicação.
- Estratégias de cache e Background Sync.
- Endpoint mínimo:
  - `POST /api/point/sync` (ACK/NACK dos eventos)
- Critérios de aceite:
  - Modo avião realiza batidas e sincroniza com confirmação e resolução de conflitos.
- Referências: `Docs/Melhorias/ponto_hibrido_analise_melhorias.md:52`, `Docs/PRD/PRD_Sistema_Controle_Ponto.md:117`.

### Passo 8 — Relatórios e Observabilidade
- Relatórios de presença, atrasos, horas extras, divergências e KPIs.
- Dashboards de métricas e alertas operacionais.
- Critérios de aceite:
  - Relatórios funcionam com dados reais; exportações em PDF/Excel/CSV.
- Referências: `src/pages/Admin/Relatorios.tsx:106`, `src/pages/Servidor/Relatorios.tsx:29`, `Docs/fase_1/ROADMAP.md:572`.

## Critérios de Aceitação Globais
- Cobertura de testes unitários backend > 80%; testes de integração dos principais fluxos.
- Desempenho: < 200ms por requisição média.
- Segurança: autenticação, autorização e auditoria habilitadas.
- Offline: operações essenciais disponíveis e sincronização confiável.

## Validação e Testes
- Frontend: acessar `http://localhost:8080`/`http://localhost:8081` e validar fluxos com `admin_protocolo@sefaz.to.gov.br` / `admin123`.
- Backend: `http://localhost:3001` com testes de API.
- Geofence: simular localização dentro/fora da cerca e verificar bloqueio/alerta/auditoria.

## Dependências Técnicas
- Definição de schema provisório e migração futura para Oracle (`FOLHAPONTO_PDB`).
- Implementação de DAOs/Repositories e camada de serviços.
- Integração AD/LDAP corporativa.

## Backlog Pós‑Go‑Live
- OCR completo para formulários físicos e conciliação com registros eletrônicos.
- Detecção de fraudes comportamentais e reputação de dispositivos.
- Agendamentos e notificações avançadas (email/push).