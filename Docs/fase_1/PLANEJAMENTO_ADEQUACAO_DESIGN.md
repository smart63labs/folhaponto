# Planejamento de Adequação de Design/Layout - Nova Folha Ponto

## 📋 Visão Geral

Este documento apresenta o planejamento completo para adequar o projeto Nova Folha Ponto ao padrão de design governamental estabelecido no modelo de referência localizado na pasta `modelo_design`.

## 🎯 Objetivos

- Implementar identidade visual governamental consistente
- Padronizar componentes de layout (header, sidebar, footer)
- Aplicar sistema de cores e tipografia oficial
- Melhorar experiência do usuário seguindo padrões governamentais
- Manter funcionalidades existentes durante a migração

## 📊 Análise Comparativa

### Estrutura Atual vs. Modelo de Referência

| Componente | Atual | Modelo de Referência | Status |
|------------|-------|---------------------|---------|
| **Layout Principal** | `DashboardLayout.tsx` simples | `Layout.tsx` completo com Header/Sidebar/Footer | ❌ Precisa adequação |
| **Header** | Básico com SidebarTrigger | Header governamental completo com logo, busca, notificações | ❌ Precisa implementação |
| **Sidebar** | `AppSidebar.tsx` funcional | Sidebar com design governamental e cores temáticas | ⚠️ Precisa redesign |
| **Footer** | ❌ Não existe | Footer governamental completo | ❌ Precisa implementação |
| **Sistema de Cores** | Padrão shadcn/ui | Cores governamentais oficiais | ❌ Precisa adequação |
| **Tipografia** | Padrão | Open Sans + Roboto (fontes governamentais) | ❌ Precisa adequação |

## 🎨 Sistema de Design Governamental

### Paleta de Cores Oficial
```css
/* Cores Principais */
--primary: 218 73% 35%; /* #1351a3 - Azul Principal Governamental */
--primary-hover: 216 73% 24%; /* #0c3260 - Azul Secundário */

/* Cores de Destaque */
--accent-orange: 26 91% 54%; /* #f58220 - Laranja Interativo */
--accent-green: 80 41% 47%; /* #7dae40 - Verde Confirmação */
--accent-red: 4 81% 56%; /* #e53935 - Vermelho Alerta */

/* Cor Específica do Protocolo */
--protocolo-blue: #2e3092; /* Azul do Sistema de Protocolo */
```

### Tipografia
- **Títulos**: Open Sans (600-700)
- **Corpo**: Roboto (300-500)
- **Hierarquia**: H1-H6 com cores governamentais

### Componentes Visuais
- **Sombras**: Suaves e consistentes
- **Bordas**: Arredondadas (8px)
- **Transições**: Suaves (cubic-bezier)
- **Gradientes**: Header governamental

## 📋 Plano de Implementação

### Fase 1: Preparação e Estrutura Base
**Prioridade: Alta | Tempo Estimado: 2-3 horas**

#### 1.1 Atualização do Sistema de Cores
- [ ] Migrar `src/index.css` para incluir variáveis CSS governamentais
- [ ] Atualizar `tailwind.config.ts` com cores customizadas
- [ ] Implementar classes utilitárias governamentais

#### 1.2 Configuração de Fontes
- [ ] Adicionar Google Fonts (Open Sans + Roboto) ao `index.html`
- [ ] Configurar hierarquia tipográfica no CSS

#### 1.3 Assets e Recursos
- [ ] Adicionar logo da SEFAZ-TO
- [ ] Preparar ícones governamentais necessários
- [ ] Configurar assets de imagem

### Fase 2: Componentes de Layout
**Prioridade: Alta | Tempo Estimado: 4-5 horas**

#### 2.1 Header Governamental
- [ ] Criar `src/components/layout/Header.tsx`
  - Logo da instituição (SEFAZ-TO)
  - Barra de pesquisa centralizada
  - Menu de notificações
  - Dropdown do usuário com avatar
  - Estilo governamental com sombras

#### 2.2 Sidebar Redesign
- [ ] Refatorar `src/components/AppSidebar.tsx`
  - Implementar design governamental
  - Cores temáticas por módulo
  - Ícones apropriados para folha de ponto
  - Estado colapsado/expandido
  - Tooltips informativos

#### 2.3 Footer Governamental
- [ ] Criar `src/components/layout/Footer.tsx`
  - Informações institucionais
  - Links úteis governamentais
  - Contatos e endereços
  - Copyright e versão do sistema

#### 2.4 Layout Principal
- [ ] Refatorar `src/components/DashboardLayout.tsx`
  - Integrar Header, Sidebar e Footer
  - Estrutura flex responsiva
  - Gerenciamento de estado do layout
  - Navegação entre módulos

### Fase 3: Adequação de Páginas
**Prioridade: Média | Tempo Estimado: 3-4 horas**

#### 3.1 Página de Login
- [ ] Redesign da `src/pages/Login.tsx`
  - Layout governamental
  - Logo e identidade visual
  - Formulário estilizado
  - Validações visuais

#### 3.2 Dashboards
- [ ] Atualizar `src/pages/AdminDashboard.tsx`
  - Cards governamentais
  - Gráficos com cores oficiais
  - Layout responsivo

- [ ] Atualizar `src/pages/ServidorDashboard.tsx`
  - Componentes de frequência
  - Calendário estilizado
  - Estatísticas visuais

#### 3.3 Página 404
- [ ] Redesign da `src/pages/NotFound.tsx`
  - Design governamental
  - Navegação de retorno

### Fase 4: Componentes Específicos
**Prioridade: Média | Tempo Estimado: 2-3 horas**

#### 4.1 Cards e Estatísticas
- [ ] Atualizar `src/components/StatsCard.tsx`
  - Estilo governamental
  - Cores e sombras oficiais
  - Ícones apropriados

#### 4.2 Calendário de Frequência
- [ ] Redesign `src/components/AttendanceCalendar.tsx`
  - Cores governamentais
  - Estados visuais claros
  - Responsividade

### Fase 5: Refinamentos e Testes
**Prioridade: Baixa | Tempo Estimado: 2 horas**

#### 5.1 Responsividade
- [ ] Testar em diferentes resoluções
- [ ] Ajustar breakpoints
- [ ] Otimizar para mobile

#### 5.2 Acessibilidade
- [ ] Verificar contraste de cores
- [ ] Implementar navegação por teclado
- [ ] Adicionar ARIA labels

#### 5.3 Performance
- [ ] Otimizar carregamento de fontes
- [ ] Minimizar CSS customizado
- [ ] Testar performance geral

## 🗂️ Estrutura de Arquivos Proposta

```
src/
├── components/
│   ├── layout/
│   │   ├── Header.tsx          # ✨ Novo
│   │   ├── Footer.tsx          # ✨ Novo
│   │   ├── Layout.tsx          # ✨ Novo (substitui DashboardLayout)
│   │   └── Sidebar.tsx         # 🔄 Refatorado
│   ├── ui/                     # Mantém componentes shadcn/ui
│   └── ...                     # Outros componentes existentes
├── assets/
│   ├── images/
│   │   ├── logo-sefaz-to.png   # ✨ Novo
│   │   └── ...
├── styles/
│   ├── globals.css             # 🔄 Atualizado com cores governamentais
│   └── components.css          # ✨ Novo (estilos específicos)
└── ...
```

## 🎯 Critérios de Sucesso

### Visuais
- [ ] Identidade visual 100% alinhada com padrões governamentais
- [ ] Cores oficiais implementadas em todos os componentes
- [ ] Tipografia governamental aplicada consistentemente
- [ ] Logo e elementos visuais da SEFAZ-TO integrados

### Funcionais
- [ ] Todas as funcionalidades existentes mantidas
- [ ] Navegação intuitiva e responsiva
- [ ] Performance mantida ou melhorada
- [ ] Compatibilidade com diferentes navegadores

### Técnicos
- [ ] Código limpo e bem documentado
- [ ] Componentes reutilizáveis
- [ ] CSS organizado e otimizado
- [ ] Sem quebras de funcionalidade

## 📝 Observações Importantes

### Compatibilidade
- Manter compatibilidade com sistema de autenticação atual
- Preservar rotas e navegação existentes
- Garantir funcionamento em IE11+ (padrão governamental)

### Acessibilidade
- Seguir diretrizes WCAG 2.1 AA
- Implementar navegação por teclado
- Garantir contraste adequado (4.5:1 mínimo)

### Manutenibilidade
- Documentar componentes customizados
- Criar guia de estilo para futuras implementações
- Estabelecer padrões de nomenclatura

## 🚀 Próximos Passos

1. **Aprovação do Planejamento**: Validar escopo e prioridades
2. **Setup Inicial**: Configurar ambiente e dependências
3. **Implementação Gradual**: Seguir fases definidas
4. **Testes Contínuos**: Validar cada etapa implementada
5. **Deploy e Monitoramento**: Acompanhar performance pós-implementação

---

**Documento criado em**: `${new Date().toLocaleDateString('pt-BR')}`  
**Versão**: 1.0  
**Responsável**: Equipe de Desenvolvimento  
**Projeto**: Nova Folha Ponto - SEFAZ-TO