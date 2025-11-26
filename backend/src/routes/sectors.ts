import { Router, Request, Response } from 'express';
import multer from 'multer';
import { parse } from 'csv-parse';
import { SectorService } from '../services/sectorService';
import { database } from '../config/database';
import logger from '../utils/logger';

const router = Router();

// Configuração do multer para upload de arquivos
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['text/csv', 'text/plain', 'application/vnd.ms-excel'];
    const allowedExtensions = ['.csv', '.txt'];

    const fileExtension = file.originalname.toLowerCase().substring(file.originalname.lastIndexOf('.'));
    const isValidType = allowedTypes.includes(file.mimetype);
    const isValidExtension = allowedExtensions.includes(fileExtension);

    if (isValidType || isValidExtension) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de arquivo não suportado. Use apenas .csv ou .txt'));
    }
  }
});

// GET /api/sectors - Listar todos os setores
router.get('/', async (req: Request, res: Response) => {
  try {
    const sectors = await SectorService.getAllSectors();
    res.json(sectors);
  } catch (error) {
    logger.error('Erro ao buscar setores:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/sectors - Criar novo setor
router.post('/', async (req: Request, res: Response) => {
  try {
    const sectorData = req.body;
    const newSector = await SectorService.createSector(sectorData);
    res.status(201).json(newSector);
  } catch (error) {
    logger.error('Erro ao criar setor:', error);
    res.status(500).json({ error: 'Erro ao criar setor' });
  }
});

// POST /api/sectors/bulk-import - Importação em lote com preview
router.post('/bulk-import', upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Arquivo não fornecido' });
    }

    const { preview } = req.query;
    const isPreview = preview === 'true';

    const fileContent = req.file.buffer.toString('utf-8');
    const records: any[] = [];

    // Parse do CSV/TXT
    const parser = parse(fileContent, {
      skip_empty_lines: true,
      trim: true,
      delimiter: ';', // Usar ponto e vírgula como delimitador
      from_line: 2, // Pular cabeçalho
      relax_column_count: true, // Permitir número variável de colunas
      columns: false // Não usar nomes de colunas fixos, usar índices
    });

    for await (const record of parser) {
      records.push(record);
    }

    if (isPreview) {
      // Modo preview: retornar dados parseados para visualização (sem banco de dados)
      const previewData = records.map((record, index) => {
        // Como o CSV tem muitas colunas, vamos mapear apenas as que precisamos para setores
        // Baseado no cabeçalho: ORDEM;NOME;NUMFUNC;NUMVINC;CPF;...;ORGAO;SETOR;LOTACAO;...
        const orgaoIndex = 52; // Posição da coluna ORGAO
        const setorIndex = 53; // Posição da coluna SETOR
        const lotacaoIndex = 54; // Posição da coluna LOTACAO
        
        return {
          id: index + 1,
          codigo_setor: record[0] || '', // ORDEM como código do setor
          nome_setor: record[setorIndex] || record[lotacaoIndex] || '', // SETOR ou LOTACAO como nome
          orgao: record[orgaoIndex] || '',
          ativo: '1',
          logradouro: '',
          numero: '',
          complemento: '',
          bairro: '',
          cidade: '',
          estado: '',
          cep: '',
          telefone: '',
          email: '',
          status: 'pending',
          errors: [] as string[]
        };
      });

      return res.json({
        preview: true,
        totalRecords: records.length,
        data: previewData
      });
    }

    // Modo importação: processar e inserir dados
    const results = {
      success: 0,
      errors: [] as string[],
      processed: records.length
    };

    // Preparar queries para transação
    const queries: Array<{ sql: string; binds?: any[] }> = [];

    for (const record of records) {
      try {
        // Validar dados obrigatórios
        if (!record.codigo_setor || !record.nome_setor) {
          results.errors.push(`Linha com código ${record.codigo_setor || 'vazio'}: Código e nome são obrigatórios`);
          continue;
        }

        // Preparar query de inserção
        const insertQuery = `
          INSERT INTO setores (
            name, code, orgao, active, logradouro, numero, complemento,
            bairro, cidade, estado, cep, telefone, email, created_at, updated_at
          ) VALUES (
            ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
          )
        `;

        queries.push({
          sql: insertQuery,
          binds: [
            record.nome_setor,
            record.codigo_setor,
            record.orgao || null,
            record.ativo === '1' || record.ativo === 'true' ? 1 : 0,
            record.logradouro || null,
            record.numero || null,
            record.complemento || null,
            record.bairro || null,
            record.cidade || null,
            record.estado || null,
            record.cep || null,
            record.telefone || null,
            record.email || null
          ]
        });

        results.success++;

      } catch (recordError) {
        logger.error('Erro ao preparar registro:', recordError);
        results.errors.push(`Erro ao preparar linha com código ${record.codigo_setor}: ${recordError.message}`);
      }
    }

    // Executar transação se houver queries válidas
    if (queries.length > 0) {
      try {
        await database.executeTransaction(queries);
      } catch (error) {
        logger.error('Erro na transação:', error);
        results.errors.push(`Erro na transação: ${error.message}`);
        results.success = 0; // Reset success count on transaction failure
      }
    }

    res.json({
      message: 'Importação concluída',
      results
    });

  } catch (error) {
    logger.error('Erro na importação em lote:', error);
    res.status(500).json({ error: 'Erro na importação em lote' });
  }
});

// PUT /api/sectors/:id - Atualizar setor
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const changes = req.body;
    const updatedSector = await SectorService.updateSector(parseInt(id), changes);
    res.json(updatedSector);
  } catch (error) {
    logger.error('Erro ao atualizar setor:', error);
    res.status(500).json({ error: 'Erro ao atualizar setor' });
  }
});

// DELETE /api/sectors/:id - Excluir setor
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await SectorService.deleteSector(parseInt(id));
    res.status(204).send();
  } catch (error) {
    logger.error('Erro ao excluir setor:', error);
    res.status(500).json({ error: 'Erro ao excluir setor' });
  }
});

export default router;