const express = require('express');
const router = express.Router();
const { exigeProprietario } = require('../middlewares/authMiddleware');

// Dashboard do proprietário
router.get('/meus-estabelecimentos', exigeProprietario, (req, res) => {
  res.render('proprietario/meus-estabelecimentos');
});

// Página de cadastro de novo estabelecimento
router.get('/novo', exigeProprietario, (req, res) => {
  res.render('proprietario/novo');
});

module.exports = router;