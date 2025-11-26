// Interface para Servidor baseada no CSV SERVIDORES.csv e schema do banco
export interface Servidor {
  id: number;
  nome: string;
  email: string;
  cpf: string;
  matricula: string;
  cargo: string;
  setor: string; // Nome do setor para exibição
  setorId: number; // ID do setor para relacionamento
  status: 'ATIVO' | 'INATIVO' | 'APOSENTADO' | 'LICENCA' | 'AFASTADO';
  dataAdmissao: string;
  dataDemissao?: string;
  telefone?: string;
  jornada: string;
  tipoVinculo: 'EFETIVO' | 'COMISSIONADO' | 'ESTAGIARIO' | 'TERCEIRIZADO';
  categoria: string;
  regimeJuridico: 'ESTATUTARIO' | 'CLT' | 'ESTAGIARIO';
  situacao: 'ATIVO' | 'INATIVO' | 'APOSENTADO' | 'LICENCA' | 'AFASTADO';
  salario?: number;
  cargaHoraria?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

// Interface para criação/edição de servidor
export interface CreateServidorData {
  nome: string;
  email: string;
  cpf: string;
  matricula: string;
  cargo: string;
  setorId: number;
  dataAdmissao: string;
  telefone?: string;
  jornada: string;
  tipoVinculo: 'EFETIVO' | 'COMISSIONADO' | 'ESTAGIARIO' | 'TERCEIRIZADO';
  categoria: string;
  regimeJuridico: 'ESTATUTARIO' | 'CLT' | 'ESTAGIARIO';
  situacao: 'ATIVO' | 'INATIVO' | 'APOSENTADO' | 'LICENCA' | 'AFASTADO';
  salario?: number;
  cargaHoraria?: number;
}

// Interface para filtros de servidor
export interface ServidorFilters {
  nome?: string;
  matricula?: string;
  cargo?: string;
  setorId?: number;
  status?: 'ATIVO' | 'INATIVO' | 'APOSENTADO' | 'LICENCA' | 'AFASTADO';
  tipoVinculo?: 'EFETIVO' | 'COMISSIONADO' | 'ESTAGIARIO' | 'TERCEIRIZADO';
  regimeJuridico?: 'ESTATUTARIO' | 'CLT' | 'ESTAGIARIO';
}

// Interface para dados do CSV de importação
export interface ServidorCSVData {
  NOME: string;
  CPF: string;
  MATRICULA: string;
  EMAIL: string;
  CARGO: string;
  SETOR: string; // Código do setor
  TIPO_VINCULO: string;
  CATEGORIA: string;
  REGIME_JURIDICO: string;
  SITUACAO: string;
  DATA_ADMISSAO?: string;
  TELEFONE?: string;
  JORNADA?: string;
  SALARIO?: string;
  CARGA_HORARIA?: string;
}