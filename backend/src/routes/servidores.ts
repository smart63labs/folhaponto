import { Router, Request, Response } from 'express';
import logger from '../utils/logger';
import { database } from '../config/database';

const router = Router();

// Interface para Servidor
interface Servidor {
  id?: number;
  nome: string;
  email: string;
  matricula: string;
  cargo: string;
  setor_id: number;
  status: 'ativo' | 'inativo';
  tipo_vinculo: string;
  data_admissao: string;
  telefone?: string;
  endereco?: string;
  cpf?: string;
  rg?: string;
  data_nascimento?: string;
  estado_civil?: string;
  escolaridade?: string;
  banco?: string;
  agencia?: string;
  conta?: string;
  pix?: string;
}

// GET /api/servidores - Listar servidores com filtros
router.get('/', async (req: Request, res: Response) => {
  try {
    logger.info('GET /api/servidores - Buscando servidores', { query: req.query });

    const { nome, matricula, cargo, setorId, status, tipoVinculo } = req.query;

    let sql = `
      SELECT 
        ID, NOME, EMAIL, MATRICULA, CARGO, SETOR_ID, 
        CASE WHEN USUARIO_ATIVO = 1 THEN 'ativo' ELSE 'inativo' END as STATUS,
        TIPO_VINCULO, TO_CHAR(DATA_ADMISSAO, 'YYYY-MM-DD') as DATA_ADMISSAO,
        TELEFONE, ENDERECO, CPF, RG, 
        TO_CHAR(DATA_NASCIMENTO, 'YYYY-MM-DD') as DATA_NASCIMENTO,
        ESTADO_CIVIL, ESCOLARIDADE_SERVIDOR as ESCOLARIDADE,
        BANCO, AGENCIA, CONTA, PIX
      FROM USUARIOS 
      WHERE ROLE = 'SERVIDOR'
    `;

    const binds: any = {};

    if (nome) {
      sql += ` AND LOWER(NOME) LIKE LOWER(:nome)`;
      binds.nome = `%${nome}%`;
    }

    if (matricula) {
      sql += ` AND MATRICULA LIKE :matricula`;
      binds.matricula = `%${matricula}%`;
    }

    if (cargo) {
      sql += ` AND LOWER(CARGO) LIKE LOWER(:cargo)`;
      binds.cargo = `%${cargo}%`;
    }

    if (setorId) {
      sql += ` AND SETOR_ID = :setorId`;
      binds.setorId = parseInt(setorId as string);
    }

    if (status) {
      const statusValue = status === 'ativo' ? 1 : 0;
      sql += ` AND USUARIO_ATIVO = :status`;
      binds.status = statusValue;
    }

    if (tipoVinculo) {
      sql += ` AND LOWER(TIPO_VINCULO) LIKE LOWER(:tipoVinculo)`;
      binds.tipoVinculo = `%${tipoVinculo}%`;
    }

    sql += ` ORDER BY NOME`;

    const result = await database.executeQuery(sql, binds);

    res.json(result.rows);
  } catch (error) {
    logger.error('Erro ao buscar servidores:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: 'Erro ao buscar servidores'
    });
  }
});

// GET /api/servidores/:id - Buscar servidor por ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    logger.info(`GET /api/servidores/${id} - Buscando servidor`);

    const sql = `
      SELECT 
        ID, NOME, EMAIL, MATRICULA, CARGO, SETOR_ID, 
        CASE WHEN USUARIO_ATIVO = 1 THEN 'ativo' ELSE 'inativo' END as STATUS,
        TIPO_VINCULO, TO_CHAR(DATA_ADMISSAO, 'YYYY-MM-DD') as DATA_ADMISSAO,
        TELEFONE, ENDERECO, CPF, RG, 
        TO_CHAR(DATA_NASCIMENTO, 'YYYY-MM-DD') as DATA_NASCIMENTO,
        ESTADO_CIVIL, ESCOLARIDADE_SERVIDOR as ESCOLARIDADE,
        BANCO, AGENCIA, CONTA, PIX
      FROM USUARIOS 
      WHERE ID = :id AND ROLE = 'SERVIDOR'
    `;

    const result = await database.executeQuery(sql, { id: parseInt(id) });

    if (!result.rows || result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Servidor não encontrado',
        message: `Servidor com ID ${id} não foi encontrado`
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    logger.error('Erro ao buscar servidor:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: 'Erro ao buscar servidor'
    });
  }
});

// POST /api/servidores - Criar novo servidor
router.post('/', async (req: Request, res: Response) => {
  try {
    logger.info('POST /api/servidores - Criando servidor', { body: req.body });

    const servidor: Servidor = req.body;

    const sql = `
      INSERT INTO USUARIOS (
        NOME, EMAIL, MATRICULA, CARGO, SETOR_ID, USUARIO_ATIVO, ROLE,
        TIPO_VINCULO, DATA_ADMISSAO, TELEFONE, ENDERECO, CPF, RG,
        DATA_NASCIMENTO, ESTADO_CIVIL, ESCOLARIDADE_SERVIDOR,
        BANCO, AGENCIA, CONTA, PIX
      ) VALUES (
        :nome, :email, :matricula, :cargo, :setor_id, :usuario_ativo, 'SERVIDOR',
        :tipo_vinculo, TO_DATE(:data_admissao, 'YYYY-MM-DD'), :telefone, :endereco, :cpf, :rg,
        TO_DATE(:data_nascimento, 'YYYY-MM-DD'), :estado_civil, :escolaridade,
        :banco, :agencia, :conta, :pix
      ) RETURNING ID INTO :id
    `;

    const binds = {
      nome: servidor.nome,
      email: servidor.email,
      matricula: servidor.matricula,
      cargo: servidor.cargo,
      setor_id: servidor.setor_id,
      usuario_ativo: servidor.status === 'ativo' ? 1 : 0,
      tipo_vinculo: servidor.tipo_vinculo,
      data_admissao: servidor.data_admissao,
      telefone: servidor.telefone || null,
      endereco: servidor.endereco || null,
      cpf: servidor.cpf || null,
      rg: servidor.rg || null,
      data_nascimento: servidor.data_nascimento || null,
      estado_civil: servidor.estado_civil || null,
      escolaridade: servidor.escolaridade || null,
      banco: servidor.banco || null,
      agencia: servidor.agencia || null,
      conta: servidor.conta || null,
      pix: servidor.pix || null,
      id: { type: Number, dir: 3003 } // oracledb.BIND_OUT
    };

    const result = await database.executeQuery(sql, binds);

    // @ts-ignore
    const newId = result.outBinds.id[0];

    res.status(201).json({
      success: true,
      data: { ...servidor, id: newId },
      message: 'Servidor criado com sucesso'
    });
  } catch (error) {
    logger.error('Erro ao criar servidor:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: 'Erro ao criar servidor'
    });
  }
});

// PUT /api/servidores/:id - Atualizar servidor
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    logger.info(`PUT /api/servidores/${id} - Atualizando servidor`, { body: req.body });

    const servidor: Servidor = req.body;

    const sql = `
      UPDATE USUARIOS SET
        NOME = :nome,
        EMAIL = :email,
        MATRICULA = :matricula,
        CARGO = :cargo,
        SETOR_ID = :setor_id,
        USUARIO_ATIVO = :usuario_ativo,
        TIPO_VINCULO = :tipo_vinculo,
        DATA_ADMISSAO = TO_DATE(:data_admissao, 'YYYY-MM-DD'),
        TELEFONE = :telefone,
        ENDERECO = :endereco,
        CPF = :cpf,
        RG = :rg,
        DATA_NASCIMENTO = TO_DATE(:data_nascimento, 'YYYY-MM-DD'),
        ESTADO_CIVIL = :estado_civil,
        ESCOLARIDADE_SERVIDOR = :escolaridade,
        BANCO = :banco,
        AGENCIA = :agencia,
        CONTA = :conta,
        PIX = :pix,
        DATA_ATUALIZACAO = CURRENT_TIMESTAMP
      WHERE ID = :id AND ROLE = 'SERVIDOR'
    `;

    const binds = {
      id: parseInt(id),
      nome: servidor.nome,
      email: servidor.email,
      matricula: servidor.matricula,
      cargo: servidor.cargo,
      setor_id: servidor.setor_id,
      usuario_ativo: servidor.status === 'ativo' ? 1 : 0,
      tipo_vinculo: servidor.tipo_vinculo,
      data_admissao: servidor.data_admissao,
      telefone: servidor.telefone || null,
      endereco: servidor.endereco || null,
      cpf: servidor.cpf || null,
      rg: servidor.rg || null,
      data_nascimento: servidor.data_nascimento || null,
      estado_civil: servidor.estado_civil || null,
      escolaridade: servidor.escolaridade || null,
      banco: servidor.banco || null,
      agencia: servidor.agencia || null,
      conta: servidor.conta || null,
      pix: servidor.pix || null
    };

    const result = await database.executeQuery(sql, binds);

    if (result.rowsAffected === 0) {
      return res.status(404).json({
        success: false,
        error: 'Servidor não encontrado',
        message: `Servidor com ID ${id} não foi encontrado`
      });
    }

    res.json({
      success: true,
      data: { ...servidor, id: parseInt(id) },
      message: 'Servidor atualizado com sucesso'
    });
  } catch (error) {
    logger.error('Erro ao atualizar servidor:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: 'Erro ao atualizar servidor'
    });
  }
});

// DELETE /api/servidores/:id - Deletar servidor (Soft Delete)
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    logger.info(`DELETE /api/servidores/${id} - Deletando servidor`);

    const sql = `
      UPDATE USUARIOS SET 
        USUARIO_ATIVO = 0,
        DATA_ATUALIZACAO = CURRENT_TIMESTAMP
      WHERE ID = :id AND ROLE = 'SERVIDOR'
    `;

    const result = await database.executeQuery(sql, { id: parseInt(id) });

    if (result.rowsAffected === 0) {
      return res.status(404).json({
        success: false,
        error: 'Servidor não encontrado',
        message: `Servidor com ID ${id} não foi encontrado`
      });
    }

    res.json({
      success: true,
      message: 'Servidor deletado com sucesso'
    });
  } catch (error) {
    logger.error('Erro ao deletar servidor:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: 'Erro ao deletar servidor'
    });
  }
});

// GET /api/servidores/setor/:setorId - Buscar servidores por setor
router.get('/setor/:setorId', async (req: Request, res: Response) => {
  try {
    const { setorId } = req.params;
    logger.info(`GET /api/servidores/setor/${setorId} - Buscando servidores do setor`);

    const sql = `
      SELECT 
        ID, NOME, EMAIL, MATRICULA, CARGO, SETOR_ID, 
        CASE WHEN USUARIO_ATIVO = 1 THEN 'ativo' ELSE 'inativo' END as STATUS,
        TIPO_VINCULO, TO_CHAR(DATA_ADMISSAO, 'YYYY-MM-DD') as DATA_ADMISSAO,
        TELEFONE, ENDERECO, CPF, RG, 
        TO_CHAR(DATA_NASCIMENTO, 'YYYY-MM-DD') as DATA_NASCIMENTO,
        ESTADO_CIVIL, ESCOLARIDADE_SERVIDOR as ESCOLARIDADE,
        BANCO, AGENCIA, CONTA, PIX
      FROM USUARIOS 
      WHERE SETOR_ID = :setorId AND ROLE = 'SERVIDOR'
      ORDER BY NOME
    `;

    const result = await database.executeQuery(sql, { setorId: parseInt(setorId) });

    res.json(result.rows);
  } catch (error) {
    logger.error('Erro ao buscar servidores do setor:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: 'Erro ao buscar servidores do setor'
    });
  }
});

export default router;