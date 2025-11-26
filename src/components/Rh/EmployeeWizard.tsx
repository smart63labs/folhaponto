import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, X } from 'lucide-react';
import { CepService } from '@/services/cepService';

interface EmployeeWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: any) => void;
  editing?: boolean;
}

export const EmployeeWizard: React.FC<EmployeeWizardProps> = ({
  open,
  onOpenChange,
  onSave,
  editing = false
}) => {
  const [currentStep, setCurrentStep] = useState('pessoal');
  const [cepLoading, setCepLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Dados Pessoais
    nome: '',
    cpf: '',
    pisPasep: '',
    sexo: '',
    estadoCivil: '',
    dataNascimento: '',
    pai: '',
    mae: '',
    rg: '',
    tipoRg: '',
    orgaoExpeditor: '',
    ufRg: '',
    expedicaoRg: '',
    cidadeNascimento: '',
    ufNascimento: '',
    tipoSanguineo: '',
    racaCor: '',
    pne: false,
    // Dados Profissionais
    numFunc: '',
    numVinc: '',
    tipoVinculo: '',
    categoria: '',
    regimeJur: '',
    regimePrev: '',
    tipoEvento: '',
    formaProv: '',
    codigoCargo: '',
    cargo: '',
    escolaridadeCargo: '',
    escolaridadeServidor: '',
    formacaoProfissional1: '',
    formacaoProfissional2: '',
    jornada: '8h',
    nivelRef: '',
    comissaoFuncao: '',
    dtIniComissao: '',
    // Lotação
    setorId: '',
    orgao: '',
    setor: '',
    lotacao: '',
    municipioLotacao: '',
    situacao: 'ATIVO',
    hierarquiaSetor: '',
    // Contato
    telefone: '',
    endereco: '',
    numEndereco: '',
    complementoEndereco: '',
    bairroEndereco: '',
    cidadeEndereco: '',
    ufEndereco: '',
    cepEndereco: '',
    semNumero: false,
    email: ''
  });

  const fillExampleData = () => {
    setFormData({
      // Dados Pessoais
      nome: 'ABMAEL SANTOS BORGES',
      cpf: '06374325176',
      pisPasep: '21275538152',
      sexo: 'M',
      estadoCivil: 'SOLTEIRO',
      dataNascimento: '1999-03-01',
      pai: 'ANIBRA DA SILVA BORGES',
      mae: 'SILVIA FERREIRA DOS SANTOS BORGES',
      rg: '1212562 2ª VIA',
      tipoRg: 'Civil',
      orgaoExpeditor: 'SSP',
      ufRg: 'TO',
      expedicaoRg: '2015-08-14',
      cidadeNascimento: 'MIRACEMA DO TOCANTINS',
      ufNascimento: 'TO',
      tipoSanguineo: '',
      racaCor: 'Parda',
      pne: false,
      // Dados Profissionais
      numFunc: '11583177',
      numVinc: '6',
      tipoVinculo: 'COMISSIONADO',
      categoria: 'CARGO COMISSAO',
      regimeJur: 'ESTATUTARIO',
      regimePrev: 'RGPS',
      tipoEvento: '',
      formaProv: '',
      codigoCargo: '1978',
      cargo: 'Diretor de Execução Financeira',
      escolaridadeCargo: 'FUNDAMENTAL',
      escolaridadeServidor: 'MEDIO',
      formacaoProfissional1: '',
      formacaoProfissional2: '',
      jornada: '180',
      nivelRef: '',
      comissaoFuncao: 'Diretor de Execução Financeira',
      dtIniComissao: '2024-09-06',
      // Lotação
      setorId: '',
      orgao: 'Secretaria da Fazenda',
      setor: '013.DIREXEFIN',
      lotacao: 'Diretoria de Execução Financeira',
      municipioLotacao: 'PALMAS',
      situacao: 'ATIVO',
      hierarquiaSetor: 'SEFAZ/013.GABSEC/013.GABSEXT/013.SUTES/013.DIREXEFIN',
      // Contato
      telefone: '63999842328',
      endereco: 'ARNO 71 ALAMEDA 23 17 N 17 QI 10 LT 01 CASA',
      numEndereco: '3',
      complementoEndereco: '',
      bairroEndereco: 'CENTRO',
      cidadeEndereco: 'PALMAS',
      ufEndereco: 'TO',
      cepEndereco: '77001877',
      semNumero: false,
      email: 'atualizar_email@sefaz.to.gov.br'
    });
  };

  const handleBuscarCep = async () => {
    if (!formData.cepEndereco.trim()) {
      alert('Digite um CEP válido');
      return;
    }

    setCepLoading(true);
    try {
      const cepData = await CepService.buscarCep(formData.cepEndereco);
      if (cepData) {
        setFormData(prev => ({
          ...prev,
          endereco: cepData.logradouro,
          complementoEndereco: cepData.complemento,
          bairroEndereco: cepData.bairro,
          cidadeEndereco: cepData.localidade,
          ufEndereco: cepData.uf,
          cepEndereco: CepService.formatarCep(cepData.cep)
        }));
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
      alert('Erro ao buscar CEP. Verifique se o CEP está correto.');
    } finally {
      setCepLoading(false);
    }
  };

  const handleSave = () => {
    onSave(formData);
    onOpenChange(false);
  };

  const steps = ['pessoal', 'profissional', 'lotacao', 'contato'];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-3">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-base">
                {editing ? 'Editar Servidor' : 'Novo Servidor'}
              </DialogTitle>
              <DialogDescription className="text-sm">
                {editing
                  ? 'Edite as informações do servidor selecionado'
                  : 'Preencha as informações para cadastrar um novo servidor'
                }
              </DialogDescription>
            </div>
            {!editing && (
              <Button
                variant="outline"
                size="sm"
                onClick={fillExampleData}
              >
                Preencher Exemplo
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-2">
          <Tabs value={currentStep} onValueChange={setCurrentStep} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="pessoal">Dados Pessoais</TabsTrigger>
              <TabsTrigger value="profissional">Profissionais</TabsTrigger>
              <TabsTrigger value="lotacao">Lotação</TabsTrigger>
              <TabsTrigger value="contato">Contato</TabsTrigger>
            </TabsList>

            <TabsContent value="pessoal" className="space-y-3 mt-4">
              <div className="space-y-2">
                <h3 className="text-base font-semibold">Dados Pessoais</h3>
                <div className="grid gap-2 md:grid-cols-2">
                  <div>
                    <Label htmlFor="nome">Nome *</Label>
                    <Input
                      id="nome"
                      value={formData.nome}
                      onChange={(e) => setFormData({...formData, nome: e.target.value})}
                      placeholder="Nome completo"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cpf">CPF *</Label>
                    <Input
                      id="cpf"
                      value={formData.cpf}
                      onChange={(e) => setFormData({...formData, cpf: e.target.value})}
                      placeholder="000.000.000-00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="pisPasep">PIS/PASEP</Label>
                    <Input
                      id="pisPasep"
                      value={formData.pisPasep}
                      onChange={(e) => setFormData({...formData, pisPasep: e.target.value})}
                      placeholder="000.00000.00-0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="sexo">Sexo</Label>
                    <Select
                      value={formData.sexo}
                      onValueChange={(value) => setFormData({...formData, sexo: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="M">Masculino</SelectItem>
                        <SelectItem value="F">Feminino</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="estadoCivil">Estado Civil</Label>
                    <Select
                      value={formData.estadoCivil}
                      onValueChange={(value) => setFormData({...formData, estadoCivil: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SOLTEIRO">Solteiro</SelectItem>
                        <SelectItem value="CASADO">Casado</SelectItem>
                        <SelectItem value="DIVORCIADO">Divorciado</SelectItem>
                        <SelectItem value="VIUVO">Viúvo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="dataNascimento">Data de Nascimento</Label>
                    <Input
                      id="dataNascimento"
                      type="date"
                      value={formData.dataNascimento}
                      onChange={(e) => setFormData({...formData, dataNascimento: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="pai">Nome do Pai</Label>
                    <Input
                      id="pai"
                      value={formData.pai}
                      onChange={(e) => setFormData({...formData, pai: e.target.value})}
                      placeholder="Nome completo do pai"
                    />
                  </div>
                  <div>
                    <Label htmlFor="mae">Nome da Mãe</Label>
                    <Input
                      id="mae"
                      value={formData.mae}
                      onChange={(e) => setFormData({...formData, mae: e.target.value})}
                      placeholder="Nome completo da mãe"
                    />
                  </div>
                  <div>
                    <Label htmlFor="rg">RG</Label>
                    <Input
                      id="rg"
                      value={formData.rg}
                      onChange={(e) => setFormData({...formData, rg: e.target.value})}
                      placeholder="Número do RG"
                    />
                  </div>
                  <div>
                    <Label htmlFor="tipoRg">Tipo RG</Label>
                    <Input
                      id="tipoRg"
                      value={formData.tipoRg}
                      onChange={(e) => setFormData({...formData, tipoRg: e.target.value})}
                      placeholder="Ex: Civil"
                    />
                  </div>
                  <div>
                    <Label htmlFor="orgaoExpeditor">Órgão Expeditor</Label>
                    <Input
                      id="orgaoExpeditor"
                      value={formData.orgaoExpeditor}
                      onChange={(e) => setFormData({...formData, orgaoExpeditor: e.target.value})}
                      placeholder="Ex: SSP"
                    />
                  </div>
                  <div>
                    <Label htmlFor="ufRg">UF RG</Label>
                    <Select
                      value={formData.ufRg}
                      onValueChange={(value) => setFormData({...formData, ufRg: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="UF" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TO">TO</SelectItem>
                        {/* Add other states */}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="expedicaoRg">Expedição RG</Label>
                    <Input
                      id="expedicaoRg"
                      type="date"
                      value={formData.expedicaoRg}
                      onChange={(e) => setFormData({...formData, expedicaoRg: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="cidadeNascimento">Cidade Nascimento</Label>
                    <Input
                      id="cidadeNascimento"
                      value={formData.cidadeNascimento}
                      onChange={(e) => setFormData({...formData, cidadeNascimento: e.target.value})}
                      placeholder="Cidade de nascimento"
                    />
                  </div>
                  <div>
                    <Label htmlFor="ufNascimento">UF Nascimento</Label>
                    <Select
                      value={formData.ufNascimento}
                      onValueChange={(value) => setFormData({...formData, ufNascimento: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="UF" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TO">TO</SelectItem>
                        {/* Add other states */}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="tipoSanguineo">Tipo Sanguíneo</Label>
                    <Select
                      value={formData.tipoSanguineo}
                      onValueChange={(value) => setFormData({...formData, tipoSanguineo: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A+">A+</SelectItem>
                        <SelectItem value="A-">A-</SelectItem>
                        <SelectItem value="B+">B+</SelectItem>
                        <SelectItem value="B-">B-</SelectItem>
                        <SelectItem value="AB+">AB+</SelectItem>
                        <SelectItem value="AB-">AB-</SelectItem>
                        <SelectItem value="O+">O+</SelectItem>
                        <SelectItem value="O-">O-</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="racaCor">Raça/Cor</Label>
                    <Select
                      value={formData.racaCor}
                      onValueChange={(value) => setFormData({...formData, racaCor: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Branca">Branca</SelectItem>
                        <SelectItem value="Preta">Preta</SelectItem>
                        <SelectItem value="Parda">Parda</SelectItem>
                        <SelectItem value="Amarela">Amarela</SelectItem>
                        <SelectItem value="Indigena">Indígena</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="pne"
                      checked={formData.pne}
                      onChange={(e) => setFormData({...formData, pne: e.target.checked})}
                      className="w-4 h-4"
                    />
                    <Label htmlFor="pne">Pessoa com Necessidades Especiais (PNE)</Label>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="profissional" className="space-y-3 mt-4">
              <div className="space-y-2">
                <h3 className="text-base font-semibold">Dados Profissionais</h3>
                <div className="grid gap-2 md:grid-cols-2">
                  <div>
                    <Label htmlFor="numFunc">Número Funcional *</Label>
                    <Input
                      id="numFunc"
                      value={formData.numFunc}
                      onChange={(e) => setFormData({...formData, numFunc: e.target.value})}
                      placeholder="Número funcional"
                    />
                  </div>
                  <div>
                    <Label htmlFor="numVinc">Número Vínculo</Label>
                    <Input
                      id="numVinc"
                      value={formData.numVinc}
                      onChange={(e) => setFormData({...formData, numVinc: e.target.value})}
                      placeholder="Número do vínculo"
                    />
                  </div>
                  <div>
                    <Label htmlFor="tipoVinculo">Tipo Vínculo</Label>
                    <Select
                      value={formData.tipoVinculo}
                      onValueChange={(value) => setFormData({...formData, tipoVinculo: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EFETIVO">Efetivo</SelectItem>
                        <SelectItem value="COMISSIONADO">Comissionado</SelectItem>
                        <SelectItem value="TEMPORARIO">Temporário</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="categoria">Categoria</Label>
                    <Select
                      value={formData.categoria}
                      onValueChange={(value) => setFormData({...formData, categoria: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CARGO COMISSAO">Cargo Comissão</SelectItem>
                        <SelectItem value="FUNCAO COMISSIONADA">Função Comissionada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="regimeJur">Regime Jurídico</Label>
                    <Select
                      value={formData.regimeJur}
                      onValueChange={(value) => setFormData({...formData, regimeJur: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ESTATUTARIO">Estatutário</SelectItem>
                        <SelectItem value="CLT">CLT</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="regimePrev">Regime Previdenciário</Label>
                    <Select
                      value={formData.regimePrev}
                      onValueChange={(value) => setFormData({...formData, regimePrev: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="RGPS">RGPS</SelectItem>
                        <SelectItem value="RPPS">RPPS</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="tipoEvento">Tipo Evento</Label>
                    <Input
                      id="tipoEvento"
                      value={formData.tipoEvento}
                      onChange={(e) => setFormData({...formData, tipoEvento: e.target.value})}
                      placeholder="Tipo de evento"
                    />
                  </div>
                  <div>
                    <Label htmlFor="formaProv">Forma Provimento</Label>
                    <Input
                      id="formaProv"
                      value={formData.formaProv}
                      onChange={(e) => setFormData({...formData, formaProv: e.target.value})}
                      placeholder="Forma de provimento"
                    />
                  </div>
                  <div>
                    <Label htmlFor="codigoCargo">Código Cargo</Label>
                    <Input
                      id="codigoCargo"
                      value={formData.codigoCargo}
                      onChange={(e) => setFormData({...formData, codigoCargo: e.target.value})}
                      placeholder="Código do cargo"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cargo">Cargo *</Label>
                    <Input
                      id="cargo"
                      value={formData.cargo}
                      onChange={(e) => setFormData({...formData, cargo: e.target.value})}
                      placeholder="Nome do cargo"
                    />
                  </div>
                  <div>
                    <Label htmlFor="escolaridadeCargo">Escolaridade Cargo</Label>
                    <Select
                      value={formData.escolaridadeCargo}
                      onValueChange={(value) => setFormData({...formData, escolaridadeCargo: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="FUNDAMENTAL">Fundamental</SelectItem>
                        <SelectItem value="MEDIO">Médio</SelectItem>
                        <SelectItem value="SUPERIOR">Superior</SelectItem>
                        <SelectItem value="POS_GRADUACAO">Pós-graduação</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="escolaridadeServidor">Escolaridade Servidor</Label>
                    <Select
                      value={formData.escolaridadeServidor}
                      onValueChange={(value) => setFormData({...formData, escolaridadeServidor: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="FUNDAMENTAL">Fundamental</SelectItem>
                        <SelectItem value="MEDIO">Médio</SelectItem>
                        <SelectItem value="SUPERIOR">Superior</SelectItem>
                        <SelectItem value="POS_GRADUACAO">Pós-graduação</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="formacaoProfissional1">Formação Profissional 1</Label>
                    <Input
                      id="formacaoProfissional1"
                      value={formData.formacaoProfissional1}
                      onChange={(e) => setFormData({...formData, formacaoProfissional1: e.target.value})}
                      placeholder="Formação profissional"
                    />
                  </div>
                  <div>
                    <Label htmlFor="formacaoProfissional2">Formação Profissional 2</Label>
                    <Input
                      id="formacaoProfissional2"
                      value={formData.formacaoProfissional2}
                      onChange={(e) => setFormData({...formData, formacaoProfissional2: e.target.value})}
                      placeholder="Formação profissional adicional"
                    />
                  </div>
                  <div>
                    <Label htmlFor="jornada">Jornada</Label>
                    <Select
                      value={formData.jornada}
                      onValueChange={(value) => setFormData({...formData, jornada: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="6h">6 horas</SelectItem>
                        <SelectItem value="8h">8 horas</SelectItem>
                        <SelectItem value="40h">40 horas semanais</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="nivelRef">Nível/Referência</Label>
                    <Input
                      id="nivelRef"
                      value={formData.nivelRef}
                      onChange={(e) => setFormData({...formData, nivelRef: e.target.value})}
                      placeholder="Nível ou referência"
                    />
                  </div>
                  <div>
                    <Label htmlFor="comissaoFuncao">Comissão/Função</Label>
                    <Input
                      id="comissaoFuncao"
                      value={formData.comissaoFuncao}
                      onChange={(e) => setFormData({...formData, comissaoFuncao: e.target.value})}
                      placeholder="Comissão ou função"
                    />
                  </div>
                  <div>
                    <Label htmlFor="dtIniComissao">Data Início Comissão</Label>
                    <Input
                      id="dtIniComissao"
                      type="date"
                      value={formData.dtIniComissao}
                      onChange={(e) => setFormData({...formData, dtIniComissao: e.target.value})}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="lotacao" className="space-y-3 mt-4">
              <div className="space-y-2">
                <h3 className="text-base font-semibold">Lotação</h3>
                <div className="grid gap-2 md:grid-cols-2">
                  <div>
                    <Label htmlFor="setorId">ID Setor</Label>
                    <Input
                      id="setorId"
                      value={formData.setorId}
                      onChange={(e) => setFormData({...formData, setorId: e.target.value})}
                      placeholder="ID do setor"
                    />
                  </div>
                  <div>
                    <Label htmlFor="orgao">Órgão</Label>
                    <Input
                      id="orgao"
                      value={formData.orgao}
                      onChange={(e) => setFormData({...formData, orgao: e.target.value})}
                      placeholder="Nome do órgão"
                    />
                  </div>
                  <div>
                    <Label htmlFor="setor">Setor</Label>
                    <Input
                      id="setor"
                      value={formData.setor}
                      onChange={(e) => setFormData({...formData, setor: e.target.value})}
                      placeholder="Nome do setor"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lotacao">Lotação</Label>
                    <Input
                      id="lotacao"
                      value={formData.lotacao}
                      onChange={(e) => setFormData({...formData, lotacao: e.target.value})}
                      placeholder="Lotação"
                    />
                  </div>
                  <div>
                    <Label htmlFor="municipioLotacao">Município Lotação</Label>
                    <Input
                      id="municipioLotacao"
                      value={formData.municipioLotacao}
                      onChange={(e) => setFormData({...formData, municipioLotacao: e.target.value})}
                      placeholder="Município da lotação"
                    />
                  </div>
                  <div>
                    <Label htmlFor="situacao">Situação</Label>
                    <Select
                      value={formData.situacao}
                      onValueChange={(value) => setFormData({...formData, situacao: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ATIVO">Ativo</SelectItem>
                        <SelectItem value="INATIVO">Inativo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="hierarquiaSetor">Hierarquia Setor</Label>
                    <Input
                      id="hierarquiaSetor"
                      value={formData.hierarquiaSetor}
                      onChange={(e) => setFormData({...formData, hierarquiaSetor: e.target.value})}
                      placeholder="Hierarquia do setor"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="contato" className="space-y-3 mt-4">
              <div className="space-y-2">
                <h3 className="text-base font-semibold">Contato</h3>
                <div className="grid gap-2 md:grid-cols-2">
                  <div>
                    <Label htmlFor="telefone">Telefone</Label>
                    <Input
                      id="telefone"
                      value={formData.telefone}
                      onChange={(e) => setFormData({...formData, telefone: e.target.value})}
                      placeholder="(63) 99999-9999"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      placeholder="email@sefaz.to.gov.br"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-base font-semibold">Endereço</h3>
                <div className="grid gap-2 md:grid-cols-2">
                  <div>
                    <Label htmlFor="cepEndereco">CEP</Label>
                    <div className="flex gap-2">
                      <Input
                        id="cepEndereco"
                        value={formData.cepEndereco}
                        onChange={(e) => setFormData({...formData, cepEndereco: CepService.formatarCep(e.target.value)})}
                        placeholder="Ex: 77001-000"
                        maxLength={9}
                        disabled={cepLoading}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleBuscarCep}
                        disabled={cepLoading || !formData.cepEndereco.trim()}
                      >
                        {cepLoading ? '...' : '🔍'}
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="endereco">Logradouro</Label>
                    <Input
                      id="endereco"
                      value={formData.endereco}
                      onChange={(e) => setFormData({...formData, endereco: e.target.value})}
                      placeholder="Ex: Rua das Flores"
                      disabled={true}
                      className="bg-gray-50"
                    />
                  </div>
                  <div>
                    <Label htmlFor="numEndereco">Número</Label>
                    <div className="flex gap-2">
                      <Input
                        id="numEndereco"
                        value={formData.numEndereco}
                        onChange={(e) => setFormData({...formData, numEndereco: e.target.value})}
                        placeholder="Ex: 123"
                        disabled={formData.semNumero}
                      />
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="semNumero"
                          checked={formData.semNumero || false}
                          onChange={(e) => setFormData({...formData, semNumero: e.target.checked, numEndereco: e.target.checked ? 'Sem Numero' : ''})}
                          className="w-4 h-4"
                        />
                        <Label htmlFor="semNumero" className="text-sm">S/N</Label>
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="complementoEndereco">Complemento</Label>
                    <Input
                      id="complementoEndereco"
                      value={formData.complementoEndereco}
                      onChange={(e) => setFormData({...formData, complementoEndereco: e.target.value})}
                      placeholder="Ex: Sala 101"
                    />
                  </div>
                  <div>
                    <Label htmlFor="bairroEndereco">Bairro</Label>
                    <Input
                      id="bairroEndereco"
                      value={formData.bairroEndereco}
                      onChange={(e) => setFormData({...formData, bairroEndereco: e.target.value})}
                      placeholder="Ex: Centro"
                      disabled={true}
                      className="bg-gray-50"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cidadeEndereco">Cidade</Label>
                    <Input
                      id="cidadeEndereco"
                      value={formData.cidadeEndereco}
                      onChange={(e) => setFormData({...formData, cidadeEndereco: e.target.value})}
                      placeholder="Ex: Palmas"
                      disabled={true}
                      className="bg-gray-50"
                    />
                  </div>
                  <div>
                    <Label htmlFor="ufEndereco">Estado</Label>
                    <Select
                      value={formData.ufEndereco || "none"}
                      onValueChange={(value) => setFormData({...formData, ufEndereco: value === "none" ? "" : value})}
                      disabled={true}
                    >
                      <SelectTrigger className="bg-gray-50">
                        <SelectValue placeholder="Selecionar estado..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Selecionar estado...</SelectItem>
                        <SelectItem value="AC">Acre</SelectItem>
                        <SelectItem value="AL">Alagoas</SelectItem>
                        <SelectItem value="AP">Amapá</SelectItem>
                        <SelectItem value="AM">Amazonas</SelectItem>
                        <SelectItem value="BA">Bahia</SelectItem>
                        <SelectItem value="CE">Ceará</SelectItem>
                        <SelectItem value="DF">Distrito Federal</SelectItem>
                        <SelectItem value="ES">Espírito Santo</SelectItem>
                        <SelectItem value="GO">Goiás</SelectItem>
                        <SelectItem value="MA">Maranhão</SelectItem>
                        <SelectItem value="MT">Mato Grosso</SelectItem>
                        <SelectItem value="MS">Mato Grosso do Sul</SelectItem>
                        <SelectItem value="MG">Minas Gerais</SelectItem>
                        <SelectItem value="PA">Pará</SelectItem>
                        <SelectItem value="PB">Paraíba</SelectItem>
                        <SelectItem value="PR">Paraná</SelectItem>
                        <SelectItem value="PE">Pernambuco</SelectItem>
                        <SelectItem value="PI">Piauí</SelectItem>
                        <SelectItem value="RJ">Rio de Janeiro</SelectItem>
                        <SelectItem value="RN">Rio Grande do Norte</SelectItem>
                        <SelectItem value="RS">Rio Grande do Sul</SelectItem>
                        <SelectItem value="RO">Rondônia</SelectItem>
                        <SelectItem value="RR">Roraima</SelectItem>
                        <SelectItem value="SC">Santa Catarina</SelectItem>
                        <SelectItem value="SP">São Paulo</SelectItem>
                        <SelectItem value="SE">Sergipe</SelectItem>
                        <SelectItem value="TO">Tocantins</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Botões de Ação */}
        <div className="flex items-center justify-between pt-2 border-t mt-auto">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                const currentIndex = steps.indexOf(currentStep);
                if (currentIndex > 0) {
                  setCurrentStep(steps[currentIndex - 1]);
                }
              }}
              disabled={currentStep === 'pessoal'}
            >
              Anterior
            </Button>
            <Button
              onClick={() => {
                const currentIndex = steps.indexOf(currentStep);
                if (currentIndex < steps.length - 1) {
                  setCurrentStep(steps[currentIndex + 1]);
                }
              }}
              disabled={currentStep === 'contato'}
            >
              Próximo
            </Button>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              <X className="mr-2 h-4 w-4" />
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              <Save className="mr-2 h-4 w-4" />
              {editing ? 'Atualizar' : 'Cadastrar'} Servidor
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};