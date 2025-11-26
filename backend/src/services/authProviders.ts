import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { google } from 'googleapis';
import ldap from 'ldapjs';
import oracledb from 'oracledb';
import logger from '../utils/logger';

export interface AuthProvider {
  name: string;
  authenticate(email: string, password: string): Promise<AuthResult>;
  isEnabled(): Promise<boolean>;
}

export interface AuthResult {
  success: boolean;
  user?: {
    id: number;
    email: string;
    name: string;
    profile: string;
    department: string;
    permissions: string[];
  };
  error?: string;
}

export interface AuthConfig {
  id: number;
  tipo_auth: string;
  ativo: number;
  configuracao: string;
}

// Mock Authentication Provider
export class MockAuthProvider implements AuthProvider {
  name = 'MOCK';

  async authenticate(email: string, password: string): Promise<AuthResult> {
    try {
      const connection = await oracledb.getConnection();
      
      const result = await connection.execute(
        `SELECT u.id, u.email, u.password_hash, u.name, u.perfil as profile, 
                u.departamento as department, u.is_active
         FROM usuarios u 
         WHERE LOWER(u.email) = LOWER(:email)`,
        { email }
      );

      await connection.close();

      if (!result.rows || result.rows.length === 0) {
        return { success: false, error: 'Usuário não encontrado' };
      }

      const user = result.rows[0] as any[];
      const [id, userEmail, passwordHash, name, profile, department, isActive] = user;

      if (!isActive) {
        return { success: false, error: 'Usuário inativo' };
      }

      const isMatch = await bcrypt.compare(password, passwordHash);
      if (!isMatch) {
        return { success: false, error: 'Senha incorreta' };
      }

      // Get user permissions
      const permissions = await this.getUserPermissions(id);

      return {
        success: true,
        user: {
          id,
          email: userEmail,
          name,
          profile,
          department,
          permissions
        }
      };
    } catch (error) {
      logger.error('Mock auth error:', error);
      return { success: false, error: 'Erro interno de autenticação' };
    }
  }

  async isEnabled(): Promise<boolean> {
    try {
      const connection = await oracledb.getConnection();
      const result = await connection.execute(
        `SELECT ativo FROM configuracoes_autenticacao WHERE tipo_auth = 'MOCK'`
      );
      await connection.close();
      
      return result.rows && result.rows.length > 0 && result.rows[0][0] === 1;
    } catch (error) {
      logger.error('Error checking mock auth status:', error);
      return false;
    }
  }

  private async getUserPermissions(userId: number): Promise<string[]> {
    try {
      const connection = await oracledb.getConnection();
      
      const result = await connection.execute(
        `SELECT DISTINCT p.nome
         FROM usuarios u
         JOIN perfil_permissoes pp ON u.perfil = pp.perfil
         JOIN permissoes p ON pp.permissao_id = p.id
         WHERE u.id = :userId`,
        { userId }
      );

      await connection.close();

      return result.rows ? result.rows.map((row: any) => row[0]) : [];
    } catch (error) {
      logger.error('Error getting user permissions:', error);
      return [];
    }
  }
}

// LDAP Authentication Provider
export class LDAPAuthProvider implements AuthProvider {
  name = 'LDAP';

  async authenticate(email: string, password: string): Promise<AuthResult> {
    try {
      const config = await this.getConfig();
      if (!config) {
        return { success: false, error: 'Configuração LDAP não encontrada' };
      }

      const ldapConfig = JSON.parse(config.configuracao);
      
      const client = ldap.createClient({
        url: `ldap://${ldapConfig.server}:${ldapConfig.port}`
      });

      return new Promise((resolve) => {
        // Bind with service account
        client.bind(ldapConfig.userDN, ldapConfig.password, (bindErr) => {
          if (bindErr) {
            logger.error('LDAP bind error:', bindErr);
            client.destroy();
            return resolve({ success: false, error: 'Erro de conexão LDAP' });
          }

          // Search for user
          const searchFilter = `(mail=${email})`;
          client.search(ldapConfig.baseDN, { filter: searchFilter }, (searchErr, searchRes) => {
            if (searchErr) {
              logger.error('LDAP search error:', searchErr);
              client.destroy();
              return resolve({ success: false, error: 'Erro na busca LDAP' });
            }

            let userDN: string | null = null;
            let userData: any = null;

            searchRes.on('searchEntry', (entry) => {
              userDN = entry.dn.toString();
              userData = entry.object;
            });

            searchRes.on('end', () => {
              if (!userDN) {
                client.destroy();
                return resolve({ success: false, error: 'Usuário não encontrado no LDAP' });
              }

              // Try to authenticate with user credentials
              client.bind(userDN, password, async (authErr) => {
                client.destroy();
                
                if (authErr) {
                  logger.error('LDAP auth error:', authErr);
                  return resolve({ success: false, error: 'Credenciais inválidas' });
                }

                // Create or update user in local database
                const localUser = await this.createOrUpdateLocalUser(userData);
                if (!localUser) {
                  return resolve({ success: false, error: 'Erro ao criar usuário local' });
                }

                resolve({
                  success: true,
                  user: localUser
                });
              });
            });
          });
        });
      });
    } catch (error) {
      logger.error('LDAP auth error:', error);
      return { success: false, error: 'Erro interno de autenticação LDAP' };
    }
  }

  async isEnabled(): Promise<boolean> {
    try {
      const connection = await oracledb.getConnection();
      const result = await connection.execute(
        `SELECT ativo FROM configuracoes_autenticacao WHERE tipo_auth = 'LDAP'`
      );
      await connection.close();
      
      return result.rows && result.rows.length > 0 && result.rows[0][0] === 1;
    } catch (error) {
      logger.error('Error checking LDAP auth status:', error);
      return false;
    }
  }

  private async getConfig(): Promise<AuthConfig | null> {
    try {
      const connection = await oracledb.getConnection();
      const result = await connection.execute(
        `SELECT id, tipo_auth, ativo, configuracao 
         FROM configuracoes_autenticacao 
         WHERE tipo_auth = 'LDAP'`
      );
      await connection.close();

      if (!result.rows || result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0] as any[];
      return {
        id: row[0],
        tipo_auth: row[1],
        ativo: row[2],
        configuracao: row[3]
      };
    } catch (error) {
      logger.error('Error getting LDAP config:', error);
      return null;
    }
  }

  private async createOrUpdateLocalUser(ldapUser: any): Promise<AuthResult['user'] | null> {
    try {
      const connection = await oracledb.getConnection();
      
      // Check if user exists
      let result = await connection.execute(
        `SELECT id, email, name, perfil, departamento 
         FROM usuarios 
         WHERE LOWER(email) = LOWER(:email)`,
        { email: ldapUser.mail }
      );

      let userId: number;
      
      if (result.rows && result.rows.length > 0) {
        // Update existing user
        userId = result.rows[0][0] as number;
        await connection.execute(
          `UPDATE usuarios 
           SET name = :name, data_atualizacao = CURRENT_TIMESTAMP
           WHERE id = :id`,
          { 
            name: ldapUser.displayName || ldapUser.cn,
            id: userId
          }
        );
      } else {
        // Create new user
        result = await connection.execute(
          `INSERT INTO usuarios (email, name, perfil, departamento, is_active, password_hash)
           VALUES (:email, :name, 'SERVIDOR', 'TI', 1, :passwordHash)
           RETURNING id INTO :id`,
          {
            email: ldapUser.mail,
            name: ldapUser.displayName || ldapUser.cn,
            passwordHash: await bcrypt.hash('ldap_user', 10),
            id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
          }
        );
        userId = result.outBinds?.id[0] as number;
      }

      await connection.commit();
      await connection.close();

      // Get user permissions
      const permissions = await this.getUserPermissions(userId);

      return {
        id: userId,
        email: ldapUser.mail,
        name: ldapUser.displayName || ldapUser.cn,
        profile: 'SERVIDOR',
        department: 'TI',
        permissions
      };
    } catch (error) {
      logger.error('Error creating/updating local user:', error);
      return null;
    }
  }

  private async getUserPermissions(userId: number): Promise<string[]> {
    try {
      const connection = await oracledb.getConnection();
      
      const result = await connection.execute(
        `SELECT DISTINCT p.nome
         FROM usuarios u
         JOIN perfil_permissoes pp ON u.perfil = pp.perfil
         JOIN permissoes p ON pp.permissao_id = p.id
         WHERE u.id = :userId`,
        { userId }
      );

      await connection.close();

      return result.rows ? result.rows.map((row: any) => row[0]) : [];
    } catch (error) {
      logger.error('Error getting user permissions:', error);
      return [];
    }
  }
}

// Gmail OAuth Provider
export class GmailAuthProvider implements AuthProvider {
  name = 'GMAIL';

  async authenticate(email: string, accessToken: string): Promise<AuthResult> {
    try {
      const config = await this.getConfig();
      if (!config) {
        return { success: false, error: 'Configuração Gmail não encontrada' };
      }

      const gmailConfig = JSON.parse(config.configuracao);
      
      const oauth2Client = new google.auth.OAuth2(
        gmailConfig.clientId,
        gmailConfig.clientSecret,
        gmailConfig.redirectUri
      );

      oauth2Client.setCredentials({ access_token: accessToken });

      const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
      const userInfo = await oauth2.userinfo.get();

      if (!userInfo.data.email || userInfo.data.email !== email) {
        return { success: false, error: 'Token inválido ou email não corresponde' };
      }

      // Create or update user in local database
      const localUser = await this.createOrUpdateLocalUser(userInfo.data);
      if (!localUser) {
        return { success: false, error: 'Erro ao criar usuário local' };
      }

      return {
        success: true,
        user: localUser
      };
    } catch (error) {
      logger.error('Gmail auth error:', error);
      return { success: false, error: 'Erro interno de autenticação Gmail' };
    }
  }

  async isEnabled(): Promise<boolean> {
    try {
      const connection = await oracledb.getConnection();
      const result = await connection.execute(
        `SELECT ativo FROM configuracoes_autenticacao WHERE tipo_auth = 'GMAIL'`
      );
      await connection.close();
      
      return result.rows && result.rows.length > 0 && result.rows[0][0] === 1;
    } catch (error) {
      logger.error('Error checking Gmail auth status:', error);
      return false;
    }
  }

  private async getConfig(): Promise<AuthConfig | null> {
    try {
      const connection = await oracledb.getConnection();
      const result = await connection.execute(
        `SELECT id, tipo_auth, ativo, configuracao 
         FROM configuracoes_autenticacao 
         WHERE tipo_auth = 'GMAIL'`
      );
      await connection.close();

      if (!result.rows || result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0] as any[];
      return {
        id: row[0],
        tipo_auth: row[1],
        ativo: row[2],
        configuracao: row[3]
      };
    } catch (error) {
      logger.error('Error getting Gmail config:', error);
      return null;
    }
  }

  private async createOrUpdateLocalUser(googleUser: any): Promise<AuthResult['user'] | null> {
    try {
      const connection = await oracledb.getConnection();
      
      // Check if user exists
      let result = await connection.execute(
        `SELECT id, email, name, perfil, departamento 
         FROM usuarios 
         WHERE LOWER(email) = LOWER(:email)`,
        { email: googleUser.email }
      );

      let userId: number;
      
      if (result.rows && result.rows.length > 0) {
        // Update existing user
        userId = result.rows[0][0] as number;
        await connection.execute(
          `UPDATE usuarios 
           SET name = :name, data_atualizacao = CURRENT_TIMESTAMP
           WHERE id = :id`,
          { 
            name: googleUser.name,
            id: userId
          }
        );
      } else {
        // Create new user
        result = await connection.execute(
          `INSERT INTO usuarios (email, name, perfil, departamento, is_active, password_hash)
           VALUES (:email, :name, 'SERVIDOR', 'TI', 1, :passwordHash)
           RETURNING id INTO :id`,
          {
            email: googleUser.email,
            name: googleUser.name,
            passwordHash: await bcrypt.hash('gmail_user', 10),
            id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
          }
        );
        userId = result.outBinds?.id[0] as number;
      }

      await connection.commit();
      await connection.close();

      // Get user permissions
      const permissions = await this.getUserPermissions(userId);

      return {
        id: userId,
        email: googleUser.email,
        name: googleUser.name,
        profile: 'SERVIDOR',
        department: 'TI',
        permissions
      };
    } catch (error) {
      logger.error('Error creating/updating local user:', error);
      return null;
    }
  }

  private async getUserPermissions(userId: number): Promise<string[]> {
    try {
      const connection = await oracledb.getConnection();
      
      const result = await connection.execute(
        `SELECT DISTINCT p.nome
         FROM usuarios u
         JOIN perfil_permissoes pp ON u.perfil = pp.perfil
         JOIN permissoes p ON pp.permissao_id = p.id
         WHERE u.id = :userId`,
        { userId }
      );

      await connection.close();

      return result.rows ? result.rows.map((row: any) => row[0]) : [];
    } catch (error) {
      logger.error('Error getting user permissions:', error);
      return [];
    }
  }
}

// Auth Provider Factory
export class AuthProviderFactory {
  private static providers: Map<string, AuthProvider> = new Map([
    ['MOCK', new MockAuthProvider()],
    ['LDAP', new LDAPAuthProvider()],
    ['GMAIL', new GmailAuthProvider()]
  ]);

  static async getEnabledProviders(): Promise<AuthProvider[]> {
    const enabledProviders: AuthProvider[] = [];
    
    for (const [name, provider] of this.providers) {
      if (await provider.isEnabled()) {
        enabledProviders.push(provider);
      }
    }
    
    return enabledProviders;
  }

  static getProvider(name: string): AuthProvider | undefined {
    return this.providers.get(name);
  }

  static async authenticateWithProviders(email: string, password: string, accessToken?: string): Promise<AuthResult> {
    const enabledProviders = await this.getEnabledProviders();
    
    if (enabledProviders.length === 0) {
      return { success: false, error: 'Nenhum provedor de autenticação habilitado' };
    }

    // Try each enabled provider
    for (const provider of enabledProviders) {
      try {
        let result: AuthResult;
        
        if (provider.name === 'GMAIL' && accessToken) {
          result = await (provider as GmailAuthProvider).authenticate(email, accessToken);
        } else if (provider.name !== 'GMAIL') {
          result = await provider.authenticate(email, password);
        } else {
          continue; // Skip Gmail if no access token
        }

        if (result.success) {
          logger.info(`Authentication successful with provider: ${provider.name}`, {
            email,
            provider: provider.name
          });
          return result;
        }
      } catch (error) {
        logger.error(`Authentication error with provider ${provider.name}:`, error);
      }
    }

    return { success: false, error: 'Falha na autenticação com todos os provedores' };
  }
}