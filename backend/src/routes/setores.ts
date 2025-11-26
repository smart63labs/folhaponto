import { Router, Request, Response } from 'express';
import logger from '../utils/logger';
import { SectorService } from '../services/sectorService';

const router = Router();

// GET /api/setores - Listar setores com filtros
router.get('/', async (req: Request, res: Response) => {
  try {
    logger.info('GET /api/setores - Buscando setores', { query: req.query });
    
    let setores = await SectorService.getAllSectors();
    
    // Aplicar filtros se fornecidos
    const { nome, codigo, ativo } = req.query;
    
    if (nome) {
      setores = setores.filter(s => 
        s.name.toLowerCase().includes((nome as string).toLowerCase())
      );
    }
    
    if (codigo) {
      setores = setores.filter(s => 
        s.code?.toLowerCase().includes((codigo as string).toLowerCase())
      );
    }
    
    if (ativo !== undefined) {
      const isAtivo = ativo === 'true';
      setores = setores.filter(s => s.active === isAtivo);
    }
    
    // Mapear para o formato esperado pelo frontend
    const setoresFormatados = setores.map(setor => ({
      id: setor.id,
      nome: setor.name,
      codigo: setor.code,
      descricao: setor.description,
      ativo: setor.active,
      orgao: setor.orgao,
      logradouro: setor.logradouro,
      numero: setor.numero,
      complemento: setor.complemento,
      bairro: setor.bairro,
      cidade: setor.cidade,
      estado: setor.estado,
      cep: setor.cep,
      telefone: setor.telefone,
      email: setor.email,
      latitude: setor.latitude,
      longitude: setor.longitude,
      created_at: setor.createdAt,
      updated_at: setor.updatedAt
    }));
    
    res.json(setoresFormatados);
  } catch (error) {
    logger.error('Erro ao buscar setores:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: 'Erro ao buscar setores'
    });
  }
});

// GET /api/setores/:id - Buscar setor por ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    logger.info(`GET /api/setores/${id} - Buscando setor`);
    
    const setor = await SectorService.getSectorById(parseInt(id));
    
    if (!setor) {
      return res.status(404).json({
        success: false,
        error: 'Setor não encontrado',
        message: `Setor com ID ${id} não foi encontrado`
      });
    }
    
    // Mapear para o formato esperado pelo frontend
    const setorFormatado = {
      id: setor.id,
      nome: setor.name,
      codigo: setor.code,
      descricao: setor.description,
      ativo: setor.active,
      orgao: setor.orgao,
      logradouro: setor.logradouro,
      numero: setor.numero,
      complemento: setor.complemento,
      bairro: setor.bairro,
      cidade: setor.cidade,
      estado: setor.estado,
      cep: setor.cep,
      telefone: setor.telefone,
      email: setor.email,
      latitude: setor.latitude,
      longitude: setor.longitude,
      created_at: setor.createdAt,
      updated_at: setor.updatedAt
    };
    
    res.json(setorFormatado);
  } catch (error) {
    logger.error('Erro ao buscar setor:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: 'Erro ao buscar setor'
    });
  }
});

// POST /api/setores - Criar novo setor
router.post('/', async (req: Request, res: Response) => {
  try {
    logger.info('POST /api/setores - Criando setor', { body: req.body });
    
    // Mapear do formato do frontend para o formato do service
    const sectorData = {
      name: req.body.nome,
      code: req.body.codigo,
      description: req.body.descricao,
      active: req.body.ativo !== undefined ? req.body.ativo : true,
      orgao: req.body.orgao,
      logradouro: req.body.logradouro,
      numero: req.body.numero,
      complemento: req.body.complemento,
      bairro: req.body.bairro,
      cidade: req.body.cidade,
      estado: req.body.estado,
      cep: req.body.cep,
      telefone: req.body.telefone,
      email: req.body.email,
      latitude: req.body.latitude,
      longitude: req.body.longitude,
      parentId: req.body.parentId,
      managerId: req.body.managerId
    };
    
    const novoSetor = await SectorService.createSector(sectorData);
    
    // Mapear para o formato esperado pelo frontend
    const setorFormatado = {
      id: novoSetor.id,
      nome: novoSetor.name,
      codigo: novoSetor.code,
      descricao: novoSetor.description,
      ativo: novoSetor.active,
      orgao: novoSetor.orgao,
      logradouro: novoSetor.logradouro,
      numero: novoSetor.numero,
      complemento: novoSetor.complemento,
      bairro: novoSetor.bairro,
      cidade: novoSetor.cidade,
      estado: novoSetor.estado,
      cep: novoSetor.cep,
      telefone: novoSetor.telefone,
      email: novoSetor.email,
      latitude: novoSetor.latitude,
      longitude: novoSetor.longitude,
      created_at: novoSetor.createdAt,
      updated_at: novoSetor.updatedAt
    };
    
    res.status(201).json({
      success: true,
      data: setorFormatado,
      message: 'Setor criado com sucesso'
    });
  } catch (error) {
    logger.error('Erro ao criar setor:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: 'Erro ao criar setor'
    });
  }
});

// PUT /api/setores/:id - Atualizar setor
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    logger.info(`PUT /api/setores/${id} - Atualizando setor`, { body: req.body });
    
    // Mapear do formato do frontend para o formato do service
    const changes: any = {};
    
    if (req.body.nome !== undefined) changes.name = req.body.nome;
    if (req.body.codigo !== undefined) changes.code = req.body.codigo;
    if (req.body.descricao !== undefined) changes.description = req.body.descricao;
    if (req.body.ativo !== undefined) changes.active = req.body.ativo;
    if (req.body.orgao !== undefined) changes.orgao = req.body.orgao;
    if (req.body.logradouro !== undefined) changes.logradouro = req.body.logradouro;
    if (req.body.numero !== undefined) changes.numero = req.body.numero;
    if (req.body.complemento !== undefined) changes.complemento = req.body.complemento;
    if (req.body.bairro !== undefined) changes.bairro = req.body.bairro;
    if (req.body.cidade !== undefined) changes.cidade = req.body.cidade;
    if (req.body.estado !== undefined) changes.estado = req.body.estado;
    if (req.body.cep !== undefined) changes.cep = req.body.cep;
    if (req.body.telefone !== undefined) changes.telefone = req.body.telefone;
    if (req.body.email !== undefined) changes.email = req.body.email;
    if (req.body.latitude !== undefined) changes.latitude = req.body.latitude;
    if (req.body.longitude !== undefined) changes.longitude = req.body.longitude;
    if (req.body.parentId !== undefined) changes.parentId = req.body.parentId;
    if (req.body.managerId !== undefined) changes.managerId = req.body.managerId;
    
    const setorAtualizado = await SectorService.updateSector(parseInt(id), changes);
    
    // Mapear para o formato esperado pelo frontend
    const setorFormatado = {
      id: setorAtualizado.id,
      nome: setorAtualizado.name,
      codigo: setorAtualizado.code,
      descricao: setorAtualizado.description,
      ativo: setorAtualizado.active,
      orgao: setorAtualizado.orgao,
      logradouro: setorAtualizado.logradouro,
      numero: setorAtualizado.numero,
      complemento: setorAtualizado.complemento,
      bairro: setorAtualizado.bairro,
      cidade: setorAtualizado.cidade,
      estado: setorAtualizado.estado,
      cep: setorAtualizado.cep,
      telefone: setorAtualizado.telefone,
      email: setorAtualizado.email,
      latitude: setorAtualizado.latitude,
      longitude: setorAtualizado.longitude,
      created_at: setorAtualizado.createdAt,
      updated_at: setorAtualizado.updatedAt
    };
    
    res.json({
      success: true,
      data: setorFormatado,
      message: 'Setor atualizado com sucesso'
    });
  } catch (error) {
    logger.error('Erro ao atualizar setor:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: 'Erro ao atualizar setor'
    });
  }
});

// DELETE /api/setores/:id - Deletar setor
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    logger.info(`DELETE /api/setores/${id} - Deletando setor`);
    
    // Buscar o setor antes de deletar para retornar os dados
    const setor = await SectorService.getSectorById(parseInt(id));
    
    if (!setor) {
      return res.status(404).json({
        success: false,
        error: 'Setor não encontrado',
        message: `Setor com ID ${id} não foi encontrado`
      });
    }
    
    await SectorService.deleteSector(parseInt(id));
    
    // Mapear para o formato esperado pelo frontend
    const setorFormatado = {
      id: setor.id,
      nome: setor.name,
      codigo: setor.code,
      descricao: setor.description,
      ativo: setor.active,
      orgao: setor.orgao,
      logradouro: setor.logradouro,
      numero: setor.numero,
      complemento: setor.complemento,
      bairro: setor.bairro,
      cidade: setor.cidade,
      estado: setor.estado,
      cep: setor.cep,
      telefone: setor.telefone,
      email: setor.email,
      latitude: setor.latitude,
      longitude: setor.longitude,
      created_at: setor.createdAt,
      updated_at: setor.updatedAt
    };
    
    res.json({
      success: true,
      data: setorFormatado,
      message: 'Setor deletado com sucesso'
    });
  } catch (error) {
    logger.error('Erro ao deletar setor:', error);
    
    // Verificar se é erro de setor com filhos
    if (error instanceof Error && error.message.includes('subsetores')) {
      return res.status(400).json({
        success: false,
        error: 'Operação não permitida',
        message: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: 'Erro ao deletar setor'
    });
  }
});



export default router;