import express, { Request, Response } from 'express';
import logger from '../utils/logger';
import fs from 'fs';
import path from 'path';

const router = express.Router();

const facesDir = path.join(process.cwd(), 'uploads', 'faces');
if (!fs.existsSync(facesDir)) {
  fs.mkdirSync(facesDir, { recursive: true });
}

router.post('/enroll', async (req: Request, res: Response) => {
  try {
    const { userId, descriptor, imageData } = req.body || {};
    if (!userId || !descriptor || !Array.isArray(descriptor)) {
      return res.status(400).json({ success: false, error: 'Dados inválidos' });
    }
    const filePath = path.join(facesDir, `${userId}.json`);
    const payload = { userId, descriptor };
    fs.writeFileSync(filePath, JSON.stringify(payload));
    if (typeof imageData === 'string' && imageData.startsWith('data:image/')) {
      const ext = imageData.includes('image/png') ? 'png' : 'jpg';
      const imgPath = path.join(facesDir, `${userId}.${ext}`);
      const base64 = imageData.replace(/^data:image\/[a-zA-Z]+;base64,/, '');
      const buf = Buffer.from(base64, 'base64');
      fs.writeFileSync(imgPath, buf);
    }
    logger.info('FACE_ENROLL', { userId });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

router.post('/verify', async (req: Request, res: Response) => {
  try {
    const { userId, descriptor } = req.body || {};
    if (!userId || !descriptor || !Array.isArray(descriptor)) {
      return res.status(400).json({ success: false, error: 'Dados inválidos' });
    }
    const filePath = path.join(facesDir, `${userId}.json`);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, error: 'Usuário sem cadastro facial' });
    }
    const stored = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const a: number[] = descriptor.map((x: any) => Number(x));
    const b: number[] = (stored.descriptor || []).map((x: any) => Number(x));
    if (a.length !== b.length || a.length === 0) {
      return res.status(400).json({ success: false, error: 'Descriptor inválido' });
    }
    let sum = 0;
    for (let i = 0; i < a.length; i++) {
      const d = a[i] - b[i];
      sum += d * d;
    }
    const distance = Math.sqrt(sum);
    const threshold = 0.45;
    const matched = distance <= threshold;
    logger.info('FACE_VERIFY', { userId, distance, matched });
    res.json({ success: true, data: { matched, distance, threshold } });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

export default router;