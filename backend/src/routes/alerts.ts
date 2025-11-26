import express from 'express';
import logger from '../utils/logger';

const router = express.Router();

router.post('/manager', async (req, res) => {
  try {
    const { userId, setorId, message, metadata } = req.body || {};
    logger.audit('MANAGER_ALERT', userId || null, { setorId, message, metadata });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

export default router;