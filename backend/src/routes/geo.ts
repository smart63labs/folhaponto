import express from 'express';
import oracledb from 'oracledb';

const router = express.Router();

const toRad = (value: number) => (value * Math.PI) / 180;
const haversine = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

router.post('/validate', async (req, res) => {
  try {
    const { setorId, latitude, longitude, radius } = req.body || {};
    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      return res.status(400).json({ success: false, error: 'Parâmetros de localização inválidos' });
    }

    let centerLat: number | null = null;
    let centerLon: number | null = null;
    let areaRadius = typeof radius === 'number' ? radius : 100;

    if (setorId) {
      try {
        const connection = await oracledb.getConnection();
        const result = await connection.execute(
          `SELECT latitude, longitude, raio_zona FROM setores WHERE id = :id`,
          { id: setorId }
        );
        await connection.close();
        if (result.rows && result.rows.length > 0) {
          const row = result.rows[0] as any[];
          centerLat = row[0] != null ? Number(row[0]) : null;
          centerLon = row[1] != null ? Number(row[1]) : null;
          if (row[2] != null) areaRadius = Number(row[2]);
        }
      } catch {}
    }

    if (centerLat == null || centerLon == null) {
      return res.json({ success: true, data: { allowed: true, distance: 0, radius: areaRadius } });
    }

    const distance = haversine(latitude, longitude, centerLat, centerLon);
    const allowed = distance <= areaRadius;
    return res.json({ success: true, data: { allowed, distance, radius: areaRadius, center: { latitude: centerLat, longitude: centerLon } } });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

export default router;