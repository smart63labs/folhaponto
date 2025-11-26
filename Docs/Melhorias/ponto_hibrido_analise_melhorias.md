# Sistema de Ponto Eletrônico Híbrido — Análise e Melhorias

## Visão Geral

- Objetivo: evoluir o sistema atual para suportar registro de ponto híbrido (formulário físico e eletrônico) com auditoria, offline‑first e integração setorial.
- Estado atual: frontend React+Vite com design system (shadcn), dashboards por perfil (Servidor, Chefia, RH, Admin), autenticação mock no `AuthContext`, componentes de calendário de frequência, painéis de auditoria, hooks PWA e offline básicos.
- Backend: mock em Node/Express com rotas de `auth`, `users`, `audit`, entre outras; proxy `vite.config.ts` para `http://localhost:3001`. Integração Oracle prevista (middleware indica funções), porém ainda não consolidada para ponto.

## Estado Atual (Resumo Técnico)

- Frontend
  - `Login` com e‑mail/senha e redirecionamento por `role` (servidor/chefia/rh/admin).
  - Dashboards:
    - Servidor: calendário de presença (`AttendanceCalendar`) com `DayDetailsModal` e sumários.
    - Chefia/RH/Admin: painéis de auditoria, templates de frequência, gestão de jornadas, backups.
  - Hooks relevantes: `usePWA` (instalação/online/offline), `useOfflineStorage` (básico), `useSectors`, `use-mobile`.
  - UI: shadcn, ícones `lucide-react`, componentes modais e listas ricas.
- Backend (mock)
  - Rotas de `auth` com geração de token e refresh (mock), `users`, `audit` com dados de exemplo.
  - `middleware/auth` possui esqueleto para buscar usuário no Oracle (`getUserById`, `getUserByEmail`), mas não há endpoint de marcação de ponto consolidado.
- PWA/Offline
  - `public/sw.js` com instalação e escuta de `push`; sem estratégia completa de cache, fila de sincronização e deduplicação de registros.

## Lacunas Identificadas

- Registro de ponto
  - Não há APIs sólidas para “bater ponto” (entrada/intervalo/retorno/saída) com validações antifraude.
  - Ausente: normalização de timezone, tolerâncias, regras de jornada e banco de horas integradas ao registro.
- Offline‑first
  - Falta fila local com confirmação (ACK/NACK), resoluções de conflito e “merge” determinístico.
- Auditoria e conformidade
  - Auditoria distribuída insuficiente (camadas front/back/db). Falta trilha de evidência (hash, device‑id, geolocalização, fotos).
- Integração física
  - Não há fluxo para conversão de formulário físico (OCR/validação) para registros oficiais.
- Integração Oracle
  - Schema e procedures para setores e usuários existem, porém faltam tabelas/PL/SQL para ponto (batidas, justificativas, anexos, logs, backups).
- Segurança
  - Falta MFA opcional, atestado de dispositivo, verificação de integridade, geofence, limites e detecção de padrões anômalos.

## Proposta de Solução Híbrida

- Ponto Eletrônico
  - Registro com tipos: `entrada`, `intervalo_inicio`, `intervalo_fim`, `saida`, `turno_continuo` (jornada sem intervalo de almoço, validada por regra de jornada e tolerâncias específicas).
  - Evidências: localização, foto opcional, device‑id, versão do app, hash do payload.
  - Regras: tolerâncias, escalas/jornadas, feriados, banco de horas, abonos.
  - Antifraude: geofence por unidade/setor, verificação de horário, reputação do dispositivo.
- Ponto em Formulário Físico
  - Upload do formulário (PDF/imagem) pela Chefia/RH.
  - OCR com validação de campos críticos (CPF, data, horários) e conferência contra jornada; suporte a marcações de `turno_continuo` sem intervalos.
  - Workflow de aprovação (Servidor → Chefia → RH) com justificativas e anexos.
- Offline‑First e Sincronização
  - Fila local (`IndexedDB`) com eventos de ponto e anexos (chunked upload).
  - Sync com backoff exponencial; deduplicação por `client_event_id` e `content_hash`.
  - Resolução de conflitos: “último válido” com regras de precedência (chefia/RH), janelas de corte, auditoria dos merges.

## Fluxos Principais

- Fluxo Registro Online
  - Usuário autentica → escolhe ação (entrada/saída/etc.) → coleta evidências → envia → backend valida → grava em Oracle → retorna recibo → auditoria.
- Fluxo Registro Offline
  - Usuário marca localmente → evento vai para fila → sincroniza quando online → backend valida → recibo → auditoria.
- Fluxo Formulário Físico
  - Upload do formulário → OCR → extração → validação contra jornada → ajustes manuais → aprovação → geração de registros oficiais.
- Fluxo Justificativas/Aprovações
  - Solicitação pelo servidor → chefia analisa → RH homologa → atualiza banco de horas/ponto → auditoria completa.

## Arquitetura Técnica (Proposta)

- Frontend
  - Módulos: `ponto-service` (API client), `offline-queue`, `geo-service`, `camera-service`, `ocr-ui`.
  - Hooks: `usePointRegistration`, `useSyncQueue`, `useGeofence`.
  - PWA: Workbox com estratégias de cache e Background Sync.
- Backend (Node/Express)
  - Endpoints: `/api/point/register`, `/api/point/justifications`, `/api/point/sync`, `/api/point/reports`.
  - Camadas: validação (schema), antifraude (geofence/horário), auditoria (logs/eventos), integração DB.
  - OCR: serviço assíncrono (fila) para processamento de formulários.
  - Banco de Dados (Provisório/Agnóstico)
  - Considerar um banco provisório e simples para desenvolvimento (ex.: SQLite/PostgreSQL) com possibilidade de migração para Oracle.
  - Persistência de usuários provenientes de API externa: espelho local com `upsert`, campos `externalId`, `version`, `lastUpdated` para sincronização incremental e detecção de mudanças.
  - Tabelas: `batidas`, `jornadas`, `justificativas`, `anexos`, `auditoria_ponto`, `dispositivos`, `setores`, `usuarios` (espelho da API, com histórico de alterações).
  - Procedures/Jobs: `registrar_batida`, `calcular_banco_horas`, `auditar_evento`, `sincronizar_batidas`, `processar_formulario`, `sincronizar_usuarios_api`.

## Segurança e Conformidade

- MFA opcional (TOTP/SMS), bloqueio por IP, política de senhas.
- Cerca eletrônica (geofence) por setor/unidade: valida a geolocalização no login e na batida; se fora da área, ponto não é validado, gera alerta automático para a chefia imediata e registra a irregularidade na auditoria.
- Tolerâncias configuráveis por perfil e jornada; exceções auditadas com justificativas.
- Assinatura digital de eventos (HMAC) e `content_hash` para anexos.
- Logs imutáveis (append‑only) e trilha de auditoria por evento.

## Offline‑First (Detalhes)

- Fila local com schema: `{ id, type, payload, evidence, createdAt, retries, hash }`.
- Background Sync, retry com backoff, deduplicação por `id/hash`.
- Conflitos: detecção de sobreposição de horários; resolução automática com regras; manual via Chefia/RH.

## Relatórios e Indicadores

- Relatórios: presença diária/mensal, atrasos, horas extras, banco de horas, justificativas, aprovações.
- KPIs: taxa de marcação online, tempo médio de aprovação, divergências por setor, falhas de OCR.

## Backlog por Fases

- Fase 1 (Fundação)
  - API `/api/point/register` + validações; modelo Oracle `batidas` e `auditoria_ponto`.
  - Fila offline no frontend + sync básico; integração geofence simples.
- Fase 2 (Workflows)
  - Justificativas e aprovações; banco de horas; relatórios essenciais.
- Fase 3 (Híbrido)
  - OCR para formulários; UI de revisão; conciliação com eletrônico.
- Fase 4 (Conformidade)
  - Trilha de evidência completa; assinatura digital; detecção de fraudes.
- Fase 5 (Observabilidade)
  - Métricas, dashboards operacionais, alertas.

## Riscos e Mitigações

- OCR impreciso → revisão humana assistida.
- Dispositivos sem GPS/câmera → regras alternativas e validação manual.
- Conectividade baixa → fila robusta com reintentos e compactação.
- Mudanças de jornada → versionamento e reprocessamento de banco de horas.

---

## Recomendações Prioritárias

- Implementar API de registro de ponto com antifraude e auditoria.
- Adotar fila offline com sync e deduplicação.
- Modelar `batidas`/`auditoria_ponto` no Oracle e procedures de cálculo.
- Criar fluxo OCR/revisão para formulários físicos.
- Consolidar relatórios de presença e banco de horas por perfil.