import { Sector } from '../types/sector';
import { database } from '../config/database';
import logger from '../utils/logger';

export class SectorService {
  // Obter todos os setores
  static async getAllSectors(): Promise<Sector[]> {
    try {
      const result = await database.executeQuery(`
        SELECT id, nome_setor, codigo_setor, orgao,
               logradouro, numero, complemento, bairro, cidade, estado,
               cep, telefone, email, ativo, data_criacao, data_atualizacao
        FROM setores
        ORDER BY nome_setor
      `);

      return result.rows?.map(row => ({
        id: row.ID,
        name: row.NOME_SETOR,
        code: row.CODIGO_SETOR,
        parentId: null, // Campo não existe na tabela atual
        level: 0, // TODO: Calculate level based on hierarchy
        managerId: null, // Campo não existe na tabela atual
        description: null, // Campo não existe na tabela atual
        orgao: row.ORGAO,
        logradouro: row.LOGRADOURO,
        numero: row.NUMERO,
        complemento: row.COMPLEMENTO,
        bairro: row.BAIRRO,
        cidade: row.CIDADE,
        estado: row.ESTADO,
        cep: row.CEP,
        telefone: row.TELEFONE,
        email: row.EMAIL,
        active: row.ATIVO === '1',
        createdAt: row.DATA_CRIACAO,
        updatedAt: row.DATA_ATUALIZACAO
        })) || [];
    } catch (error: any) {
      const code = error?.code ?? error?.errorNum;
      const message = error?.message ?? String(error);

      // Se a tabela não existir, retornar lista vazia para evitar erro 500
      if (code === 'ORA-00942' || code === 942 || message.includes('ORA-00942')) {
        logger.warn('Tabela "SETORES" não existe. Retornando lista vazia para GET /api/setores');
        return [];
      }

      logger.error('Erro ao buscar setores:', error);
      // Propagar um erro mais amigável mantendo o status adequado na rota
      throw new Error('Erro ao buscar setores: ' + message);
    }
  }

  // Obter setor por ID
  static async getSectorById(id: number): Promise<Sector | null> {
    try {
      const result = await database.executeQuery(`
        SELECT id, nome_setor, codigo_setor, orgao,
               logradouro, numero, complemento, bairro, cidade, estado,
               cep, telefone, email, ativo, data_criacao, data_atualizacao
        FROM setores
        WHERE id = ?
      `, [id]);

      if (!result.rows || result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      return {
        id: row.ID,
        name: row.NOME_SETOR,
        code: row.CODIGO_SETOR,
        parentId: null, // Campo não existe na tabela atual
        level: 0, // TODO: Calculate level
        managerId: null, // Campo não existe na tabela atual
        description: null, // Campo não existe na tabela atual
        orgao: row.ORGAO,
        logradouro: row.LOGRADOURO,
        numero: row.NUMERO,
        complemento: row.COMPLEMENTO,
        bairro: row.BAIRRO,
        cidade: row.CIDADE,
        estado: row.ESTADO,
        cep: row.CEP,
        telefone: row.TELEFONE,
        email: row.EMAIL,
        active: row.ATIVO === '1',
        createdAt: row.DATA_CRIACAO,
        updatedAt: row.DATA_ATUALIZACAO
      };
    } catch (error) {
      logger.error('Erro ao buscar setor por ID:', error);
      throw error;
    }
  }

  // Criar novo setor
  static async createSector(sectorData: any): Promise<Sector> {
    try {
      await database.executeQuery(`
        INSERT INTO setores (
          nome_setor, codigo_setor, orgao,
          logradouro, numero, complemento, bairro, cidade, estado,
          cep, telefone, email, ativo, data_criacao, data_atualizacao
        ) VALUES (
          ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        )
      `, [
        sectorData.name,
        sectorData.code,
        sectorData.orgao || null,
        sectorData.logradouro || null,
        sectorData.numero || null,
        sectorData.complemento || null,
        sectorData.bairro || null,
        sectorData.cidade || null,
        sectorData.estado || null,
        sectorData.cep || null,
        sectorData.telefone || null,
        sectorData.email || null,
        sectorData.active ? '1' : '0'
      ]);

      // Buscar o último setor inserido (assumindo que é o que acabamos de criar)
      const lastInsertResult = await database.executeQuery(`
        SELECT id FROM setores ORDER BY id DESC FETCH FIRST 1 ROW ONLY
      `);

      const newId = lastInsertResult.rows?.[0]?.ID;
      if (!newId) {
        throw new Error('Erro ao obter ID do setor criado');
      }

      const createdSector = await this.getSectorById(newId);
      if (!createdSector) {
        throw new Error('Erro ao buscar setor criado');
      }

      return createdSector;
    } catch (error) {
      logger.error('Erro ao criar setor:', error);
      throw error;
    }
  }

  // Atualizar setor
  static async updateSector(id: number, changes: Partial<Sector>): Promise<Sector> {
    try {
      const updateFields: string[] = [];
      const values: any[] = [];

      if (changes.name !== undefined) {
        updateFields.push('nome_setor = ?');
        values.push(changes.name);
      }
      if (changes.code !== undefined) {
        updateFields.push('codigo_setor = ?');
        values.push(changes.code);
      }
      if (changes.orgao !== undefined) {
        updateFields.push('orgao = ?');
        values.push(changes.orgao);
      }
      if (changes.logradouro !== undefined) {
        updateFields.push('logradouro = ?');
        values.push(changes.logradouro);
      }
      if (changes.numero !== undefined) {
        updateFields.push('numero = ?');
        values.push(changes.numero);
      }
      if (changes.complemento !== undefined) {
        updateFields.push('complemento = ?');
        values.push(changes.complemento);
      }
      if (changes.bairro !== undefined) {
        updateFields.push('bairro = ?');
        values.push(changes.bairro);
      }
      if (changes.cidade !== undefined) {
        updateFields.push('cidade = ?');
        values.push(changes.cidade);
      }
      if (changes.estado !== undefined) {
        updateFields.push('estado = ?');
        values.push(changes.estado);
      }
      if (changes.cep !== undefined) {
        updateFields.push('cep = ?');
        values.push(changes.cep);
      }
      if (changes.telefone !== undefined) {
        updateFields.push('telefone = ?');
        values.push(changes.telefone);
      }
      if (changes.email !== undefined) {
        updateFields.push('email = ?');
        values.push(changes.email);
      }
      if (changes.active !== undefined) {
        updateFields.push('ativo = ?');
        values.push(changes.active ? '1' : '0');
      }

      if (updateFields.length === 0) {
        throw new Error('Nenhum campo para atualizar');
      }

      updateFields.push('data_atualizacao = CURRENT_TIMESTAMP');

      const query = `UPDATE setores SET ${updateFields.join(', ')} WHERE id = ?`;
      values.push(id);

      await database.executeQuery(query, values);

      const updatedSector = await this.getSectorById(id);
      if (!updatedSector) {
        throw new Error('Setor não encontrado após atualização');
      }

      return updatedSector;
    } catch (error) {
      logger.error('Erro ao atualizar setor:', error);
      throw error;
    }
  }

  // Excluir setor
  static async deleteSector(id: number): Promise<void> {
    try {
      // Verificar se tem filhos (não aplicável na estrutura atual)
      // const childrenResult = await database.executeQuery(
      //   'SELECT COUNT(*) as count FROM setores WHERE parent_id = ?',
      //   [id]
      // );

      // if (childrenResult.rows?.[0]?.COUNT > 0) {
      //   throw new Error('Não é possível excluir um setor que possui subsetores');
      // }

      await database.executeQuery('DELETE FROM setores WHERE id = ?', [id]);
    } catch (error) {
      logger.error('Erro ao excluir setor:', error);
      throw error;
    }
  }
}

export const sectorService = new SectorService();