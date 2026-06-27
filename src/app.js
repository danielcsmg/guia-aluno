const express = require('express');
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// ============ Middlewares ============
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '..', 'public')));

// ============ Sessão ============
app.use(session({
  secret: process.env.SESSION_SECRET || 'guia-aluno-secret-key-2026',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24 }
}));

app.use(flash());

// ============ Variáveis globais para views ============
const { usuarioGlobal } = require('./middlewares/authMiddleware');
app.use(usuarioGlobal);

// ============ Template engine ============
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'views'));

// ============ Middlewares de auth ============
const { exigeLogin, exigeProprietario } = require('./middlewares/authMiddleware');

// ============ ROTAS ============

// 1) Autenticação (públicas)
app.use('/', require('./routes/authRoutes'));

// 2) Avaliações (protegidas — apenas alunos)
app.use('/', exigeLogin, require('./routes/avaliacoesRoutes'));

// 3) API de estabelecimentos (protegidas)
app.use('/api/estabelecimentos', exigeLogin, require('./routes/estabelecimentosRoutes'));

// 4) Páginas protegidas (views)
const estabelecimentosController = require('./controllers/estabelecimentosController');
app.get('/', exigeLogin, (req, res) => res.render('index'));
app.get('/estabelecimento/:id', exigeLogin, estabelecimentosController.detalhar);

// 5) Área do proprietário (protegidas)
app.use('/proprietario', exigeLogin, exigeProprietario, require('./routes/proprietarioRoutes'));
app.use('/estabelecimentos', exigeLogin, exigeProprietario, require('./routes/proprietarioRoutes'));

// 6) 404 — SEMPRE por último, ANTES do listen
app.use((req, res) => res.status(404).render('404', { mensagem: 'Página não encontrada' }));

// 7) Handler de erros
app.use((err, req, res, next) => {
  console.error('❌ Erro:', err);
  res.status(500).render('erro', { mensagem: 'Erro interno do servidor' });
});

// 8) Servidor — SEMPRE no final
app.listen(port, () => console.log(`🚀 Servidor rodando em http://localhost:${port}`));