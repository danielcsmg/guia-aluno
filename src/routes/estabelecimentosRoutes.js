const express = require('express');
const router = express.Router();
const multer = require('multer');
const controller = require('../controllers/estabelecimentosController');
const { exigeProprietario } = require('../middlewares/authMiddleware');

const storage = multer.diskStorage({
  destination: 'public/uploads',
  filename: (req, file, cb) =>
    cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`)
});
const upload = multer({ storage });

// Rotas públicas (qualquer usuário logado)
router.get('/', controller.listar);
router.get('/:id', controller.detalhar);

// Rotas restritas a proprietários
router.post('/', exigeProprietario, upload.single('foto'), controller.cadastrar);
router.put('/:id', exigeProprietario, upload.single('foto'), controller.atualizar);
router.delete('/:id', exigeProprietario, controller.excluir);

// 🆕 Listar meus estabelecimentos (proprietário)
router.get('/me/listar', exigeProprietario, controller.meusEstabelecimentos);

module.exports = router;