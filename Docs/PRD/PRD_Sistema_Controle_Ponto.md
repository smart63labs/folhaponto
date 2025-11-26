PRD — Sistema de Controle de Ponto Flexível e Moderno (Versão 2.1)
Revisão Incluindo Registro Híbrido e Funcionalidade Offline Completa

1. Resumo Executivo

O sistema de controle de ponto tem como objetivo automatizar, modernizar e digitalizar o registro de frequência de diferentes tipos de colaboradores. A plataforma foi desenhada para um modelo de trabalho híbrido, permitindo o registro de ponto tanto de forma digital (online/offline) quanto através do anexo de formulários físicos preenchidos, garantindo flexibilidade total para qualquer cenário operacional.

Com um acesso offline robusto a todas as suas funcionalidades essenciais, o sistema garante a continuidade do uso mesmo sem internet. Ele oferece configuração de jornadas personalizadas, aprovação hierárquica, gestão de templates de relatórios e integração com sistemas de RH, consolidando-se como uma solução completa e resiliente.

2. Público-Alvo

Servidores: Registro formal de carga horária.

Estagiários: Cumprimento de jornada reduzida e vínculo com instituição de ensino.

Terceirizados/Prestadores: Registro de horas contratadas.

Recursos Humanos (RH): Consolidação, gestão de templates, relatórios, exportações, gestão de ocorrências e acesso aos logs de auditoria para conformidade.

Chefias Imediatas: Aprovação, correções e acompanhamento da equipe, incluindo o upload de frequências físicas.

3. Requisitos Especiais e Estratégicos

(Esta seção permanece a mesma da versão 2.0, pois os requisitos de flexibilidade e templates se aplicam a ambos os modos de registro).

3.1. Módulo de Gerenciamento de Templates de Frequência (Future-Proofing)
3.2. Flexibilidade Total de Configuração

4. Funcionalidades Principais

4.1. Modos de Registro de Ponto
O sistema deve suportar dois métodos distintos para o registro da frequência, que podem ser habilitados por colaborador ou equipe.

4.1.1. Registro Digital (Online & Offline)

Registro via web e mobile (com geolocalização opcional).

Operação Offline Completa: O sistema deve operar em um modo offline completo. O usuário poderá não apenas registrar o ponto, mas também visualizar sua frequência, solicitar ajustes, anexar justificativas e realizar assinaturas eletrônicas sem conexão com a internet. Os dados são armazenados localmente e sincronizados de forma transparente e automática ao restabelecer a conexão.

4.1.2. Registro via Formulário Físico (Anexado)

Para equipes ou situações sem acesso digital, o sistema permitirá que a frequência seja preenchida em um formulário impresso (preferencialmente gerado pelo próprio sistema a partir dos templates).

Após coletar as assinaturas manuais, o documento digitalizado (PDF/Imagem) deve ser anexado ao período de frequência do colaborador por um usuário autorizado (Chefia ou RH).

O sistema não fará a leitura dos dados do arquivo, mas o armazenará como comprovação do registro, vinculando-o ao período correspondente.

4.1.3. Turno Contínuo (Sem Intervalo)

Nesta modalidade de jornada, o colaborador realiza um turno ininterrupto sem intervalo para almoço. O fluxo de batidas é reduzido para duas marcações: `entrada` e `saída`, com validações específicas de jornada (mínimo/máximo de horas) e tolerâncias configuráveis. A configuração de turno contínuo é definida por colaborador ou por equipe e deve ser considerada nas regras de cálculo e nos bloqueios de sequências de batidas.

4.2. Gestão de Frequência

Visualização em calendário com status diário (presença, falta, atraso, ocorrência, e um novo status para "Frequência Física Anexada").

(Demais funcionalidades mantidas).

(As seções 4.3, 4.4, 4.5, 4.6 e 4.7 permanecem as mesmas da versão 2.0)

5. Módulos Avançados e Visão de Futuro

5.1. Banco de Horas Inteligente (Mantido)

5.2. Assinatura Digital da Ficha: Suporte para assinatura eletrônica simples e digital qualificada. A funcionalidade de assinatura eletrônica simples deve ser compatível com o modo offline.

(Demais seções 5.3 a 5.8 mantidas)

6. Regras de Negócio

(Seções 6.1, 6.2 e 6.3 mantidas)

6.4. Regras para Frequência Anexada

A anexação de um formulário físico validado (assinado) para um período substitui a necessidade de batidas digitais para o mesmo. O sistema deve travar o registro digital para aquele período para evitar duplicidade.

A homologação pelo RH valida o documento anexado como o registro oficial para todos os fins (folha de pagamento, auditoria, etc.).

6.5. Zona Segura e Irregularidades de Localização

Para reduzir fraude, o sistema valida a localização do usuário durante o login e no ato da batida digital contra a Zona Segura do setor ao qual está lotado. Quando a localização estiver fora da área definida:
- O registro é bloqueado e não é computado.
- Um alerta é emitido automaticamente para a chefia imediata.
- Uma irregularidade é gravada no sistema para auditoria, incluindo dados de geolocalização, horário, usuário e setor.

Em situações excepcionais, a chefia pode justificar e liberar registros sob revisão, com trilha de auditoria obrigatória.

7. Experiência do Usuário (UX/UI)

7.1. Colaborador: (Mantido, com a adição de um indicador visual claro quando sua frequência do período for baseada em um documento anexado).

7.2. Chefia: (Mantido, com a adição de uma interface para upload e visualização dos formulários de frequência digitalizados da sua equipe).

7.3. RH/Admin: (Mantido, com a adição de ferramentas para gerenciar e homologar em lote as frequências que foram anexadas fisicamente).

8. Segurança

Autenticação JWT + SSO (OAuth2).

Perfis de acesso granulares: Colaborador, Chefia, RH, Admin.

Logs imutáveis de auditoria: Registro detalhado de cada alteração. Os perfis de RH e Admin terão acesso aos logs de auditoria para fins de verificação e conformidade.

(Demais itens mantidos).

Geofence Anti-Fraude: Validação de localização baseada em cerca eletrônica por setor com políticas de bloqueio, alerta à chefia e registro de irregularidade.

9. Requisitos Não Funcionais

Disponibilidade: 99,9%.

Escalabilidade: Suporte inicial para 10.000+ colaboradores.

Performance: Tempo de resposta médio da API < 200ms em modo online.

Fidelidade de Relatórios: (Mantido).

Plataforma e Offline: Suporte mobile (PWA responsivo). O PWA deve garantir que todas as funcionalidades essenciais (bater ponto, consultar frequência, justificar, assinar) estejam disponíveis offline, com sincronização transparente em segundo plano.

Banco de Dados Provisório e Espelho de Usuários: Enquanto a decisão de banco definitivo estiver em aberto, o sistema deve operar com um banco provisório capaz de armazenar dados operacionais e manter um espelho local dos usuários provenientes da API externa. A sincronização deve ser incremental, resiliente a falhas e registrar conflitos para posterior resolução.

10. Critérios de Aceite Fundamentais

Um usuário (Chefia/RH) deve conseguir fazer o upload de um PDF/imagem de frequência para um colaborador, e o status do período deve mudar para "Frequência Anexada".

Com o dispositivo em modo avião, um usuário deve conseguir registrar uma nova batida de ponto, visualizar seu espelho de ponto do mês anterior e aplicar sua assinatura eletrônica na folha.

O Admin do RH deve conseguir fazer o upload de um novo template de PDF e mapear os campos de dados.

O sistema deve calcular corretamente as horas de um colaborador com base em sua jornada, no calendário de feriados e nas regras de banco de horas.

Um usuário com perfil de Chefia deve conseguir aprovar a ficha de um subordinado.

Um usuário do RH deve conseguir acessar o histórico de alterações de uma folha de ponto.
4.1.3. Previsão de Ponto por Reconhecimento Facial

O sistema deve oferecer uma funcionalidade de previsão de próxima batida baseada em reconhecimento facial. A câmera do dispositivo captura o rosto do colaborador e, ao identificar o perfil, o sistema sugere o próximo tipo de batida e um horário estimado, com base em padrões de uso e regras de jornada.

Regras de operação:
- A previsão é apenas sugestão e requer confirmação explícita do usuário para efetivar o registro.
- Quando offline, a captura funciona e uma heurística local básica sugere o tipo provável; quando online, um serviço de previsão aprimorado é utilizado.
- A previsão não substitui validações de negócio existentes (sequência de batidas, Zona Segura, horário permitido), que continuam sendo aplicadas no momento da confirmação.
- A funcionalidade é opcional por colaborador/equipe e pode ser desativada pela chefia ou pelo RH.