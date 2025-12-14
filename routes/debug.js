const express = require('express');
const router = express.Router();
const pool = require('../config/database');

router.get('/db', async (req, res) => {
  try {
    const ok = await pool.checkConnection();
    res.json({ dbConnected: ok });
  } catch (err) {
    res.status(500).json({ dbConnected: false, error: err && err.message ? err.message : String(err) });
  }
});

module.exports = router;
