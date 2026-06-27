const express = require('express');
const router = express.Router();
const controller = require('../controllers/authController');
const { redirecionarSeLogado } = require('../middlewares/authMiddleware');

// Rotas públicas (redireciona se já logado)
router.get('/login', redirecionarSeLogado, controller.loginForm);
router.post('/login', redirecionarSeLogado, controller.login);

router.get('/cadastro', redirecionarSeLogado, controller.cadastroForm);
router.post('/cadastro', redirecionarSeLogado, controller.cadastro);

// Logout
router.get('/logout', controller.logout);

module.exports = router;