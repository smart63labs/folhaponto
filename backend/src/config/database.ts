import oracledb from 'oracledb';
import dotenv from 'dotenv';
import logger from '../utils/logger';

dotenv.config();

export interface DatabaseConfig {
  user: string;
  password: string;
  connectString: string;
  poolMin?: number;
  poolMax?: number;
  poolIncrement?: number;
  poolTimeout?: number;
}

export const dbConfig: DatabaseConfig = {
  user: process.env.DB_USER || 'folhaponto_user',
  password: process.env.DB_PASSWORD || 'folhaponto123',
  connectString: process.env.DB_CONNECTION_STRING || 'localhost:1521/FOLHAPONTO_PDB',
  poolMin: 2,
  poolMax: 10,
  poolIncrement: 1,
  poolTimeout: 60
};

class Database {
  private pool: oracledb.Pool | null = null;

  async initialize(): Promise<void> {
    try {
      // Configurar Oracle client
      oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
      oracledb.autoCommit = true;

      // Criar pool de conexões
      this.pool = await oracledb.createPool(dbConfig);
      
      logger.info('Pool de conexões Oracle criado com sucesso');
      
      // Testar conexão
      await this.testConnection();
      
    } catch (error) {
      logger.error('Erro ao inicializar banco de dados Oracle:', error);
      throw error;
    }
  }

  async testConnection(): Promise<void> {
    let connection: oracledb.Connection | undefined;
    
    try {
      connection = await this.getConnection();
      const result = await connection.execute('SELECT 1 FROM DUAL');
      logger.info('Teste de conexão Oracle bem-sucedido');
    } catch (error) {
      logger.error('Erro no teste de conexão Oracle:', error);
      throw error;
    } finally {
      if (connection) {
        await connection.close();
      }
    }
  }

  async getConnection(): Promise<oracledb.Connection> {
    if (!this.pool) {
      throw new Error('Pool de conexões não inicializado');
    }
    
    return await this.pool.getConnection();
  }

  async close(): Promise<void> {
    if (this.pool) {
      await this.pool.close(10);
      this.pool = null;
      logger.info('Pool de conexões Oracle fechado');
    }
  }

  async executeQuery(sql: string, binds: any[] = []): Promise<oracledb.Result<any>> {
    let connection: oracledb.Connection | undefined;
    
    try {
      connection = await this.getConnection();
      const result = await connection.execute(sql, binds);
      return result;
    } catch (error) {
      logger.error('Erro ao executar query:', { sql, error });
      throw error;
    } finally {
      if (connection) {
        await connection.close();
      }
    }
  }

  async executeTransaction(queries: Array<{ sql: string; binds?: any[] }>): Promise<any[]> {
    let connection: oracledb.Connection | undefined;
    
    try {
      connection = await this.getConnection();
      
      // Desabilitar autoCommit para transação
      const originalAutoCommit = oracledb.autoCommit;
      oracledb.autoCommit = false;
      
      const results: any[] = [];
      
      for (const query of queries) {
        const result = await connection.execute(query.sql, query.binds || []);
        results.push(result);
      }
      
      await connection.commit();
      return results;
      
    } catch (error) {
      if (connection) {
        await connection.rollback();
      }
      logger.error('Erro na transação:', error);
      throw error;
    } finally {
      if (connection) {
        oracledb.autoCommit = true;
        await connection.close();
      }
    }
  }
}

export const database = new Database();
export default database;