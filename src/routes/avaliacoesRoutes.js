const router = require('express').Router();
const controller = require('../controllers/avaliacoesController');
const { exigeLogin, exigeAluno } = require('../middlewares/authMiddleware');

// ✅ Apenas alunos logados podem avaliar
router.post(
  '/estabelecimentos/:id/avaliacoes',
  exigeLogin,
  exigeAluno,
  controller.criarAvaliacao
);

module.exports = router;