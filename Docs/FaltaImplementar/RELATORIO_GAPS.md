# Relatório de Gaps de Implementação

Data: Janeiro/2025  
Responsável: Equipe de Desenvolvimento

## Resumo
- Este relatório consolida as funcionalidades presentes na documentação que ainda não estão implementadas no código atual e prioriza correções/criações necessárias.

## Itens Críticos Não Implementados
- Persistência real de registros de ponto em banco Oracle; componente usa mock e fila offline apenas: `src/components/RegistroPonto.tsx:240`.
- Validação de geofence no login e na batida digital, com bloqueio fora da cerca, alerta à chefia e registro de irregularidade; não implementado no frontend/backend.
- Suporte a "turno contínuo" (sem intervalo de almoço) como configuração de jornada; fluxo atual força `intervalo_inicio`/`intervalo_fim`: `src/components/RegistroPonto.tsx:114` e `src/components/RegistroPonto.tsx:197`.
- Upload de frequência física sem persistência backend; progresso simulado: `src/pages/Chefia/UploadFrequencia.tsx:120` e `src/pages/Chefia/UploadFrequencia.tsx:130`.
- Autenticação real (JWT + AD/LDAP) e autorização granular; marcada como pendente na doc: `Docs/fase_3/Implementacao_Fase3.md:176`.
- Auditoria completa de ações e logs; pendente conforme doc: `Docs/fase_3/Implementacao_Fase3.md:176`.
- Componente `GestaoColaboradores.tsx` ausente gerando erro de build: `Docs/fase_3/Implementacao_Fase3.md:155` e `Docs/fase_3/Implementacao_Fase3.md:162`.
- APIs backend inexistentes para módulos principais (ponto, aprovações, relatórios); pendente conforme doc: `Docs/fase_3/Implementacao_Fase3.md:176`.
- Tabelas Oracle faltantes (ex.: `registros_ponto`, `banco_horas`, `logs_auditoria`, `setores_hierarquia`, etc.): `Docs/fase_3/Implementacao_Fase3.md:205`.

## Requisitos Novos a Incorporar (PRD)
- Turno contínuo (sem intervalo) como modalidade de jornada; fluxo de batidas: `entrada` → `saída`, sem `intervalo_*`.
- Banco de dados provisório com espelho local de usuários vindos da API externa; sincronização incremental e tolerância a conflitos.
- Anti-fraude por Zona Segura: validação de localização no login e na batida; fora da zona → bloqueio do registro, alerta imediato à chefia e gravação da irregularidade para auditoria.
- Previsão de ponto via reconhecimento facial: sugestão do próximo tipo de batida e horário com base em identificação facial e regras de jornada; confirmação obrigatória pelo usuário.

## Próximos Passos Priorizados
- Implementar geofence (frontend + backend) e mecanismo de alerta para chefia (notificação/inbox) com log de irregularidade.
- Adicionar suporte a turno contínuo no fluxo de `RegistroPonto` com configuração por colaborador/equipe.
- Criar APIs e persistência Oracle para registros de ponto e uploads de frequência; substituir mocks.
- Implementar autenticação JWT + integração AD/LDAP e autorização por perfil.
- Criar e versionar schema Oracle com tabelas críticas (registros_ponto, banco_horas, setores, lotacao, logs_auditoria).
- Corrigir erro de hooks no frontend e implementar `GestaoColaboradores.tsx` faltante.
- Implementar previsão de ponto por reconhecimento facial (frontend + backend) integrada à tela de registro, respeitando validações e operação offline.

## Referências
- `Docs/PRD/PRD_Sistema_Controle_Ponto.md`
- `Docs/fase_3/Implementacao_Fase3.md:128, 176, 205`
- `Docs/fase_2/ANALISE_IMPLEMENTACOES_PENDENTES.md:116, 218`
- `src/components/RegistroPonto.tsx:114, 197, 240`
- `src/pages/Chefia/UploadFrequencia.tsx:120, 130`