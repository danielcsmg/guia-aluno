# 🍔 Guia Aluno

Sistema web para alunos de faculdade encontrarem os melhores estabelecimentos para lanchar perto do campus. Proprietários podem cadastrar seus estabelecimentos e alunos podem avaliá-los com notas de 1 a 5 estrelas.

## 🎯 Funcionalidades

- ✅ Cadastro de usuários (alunos e proprietários)
- ✅ Login/logout com sessões seguras
- ✅ Proprietários cadastram estabelecimentos com foto
- ✅ Alunos buscam estabelecimentos por categoria
- ✅ Alunos avaliam estabelecimentos (1 avaliação por local)
- ✅ Ranking automático por média de estrelas
- ✅ Páginas de detalhes com comentários

---

## 📋 Pré-requisitos

Antes de começar, você precisa ter instalado:

| Ferramenta | Versão | Como verificar |
|---|---|---|
| [Node.js](https://nodejs.org/) | v24.x | `node -v` |
| [MySQL](https://dev.mysql.com/downloads/) | v8.x | `mysql --version` |
| [Git](https://git-scm.com/) (opcional) | qualquer | `git --version` |

> 💡 **Recomendação:** Use o Node 22 LTS se tiver problemas com o Node 24.

---

## 🚀 Instalação passo a passo

### 1. Clone ou extraia o projeto

```bash
cd guia-aluno
```

### 2. Corrija o `package.json`

⚠️ **IMPORTANTE:** O `package.json` original tem espaços nas chaves (bug). Substitua todo o conteúdo por:

```json
{
  "name": "guia-aluno",
  "version": "1.0.0",
  "description": "Guia de estabelecimentos para alunos",
  "main": "src/app.js",
  "scripts": {
    "start": "node src/app.js",
    "dev": "nodemon src/app.js",
    "db:setup": "mysql -u root -p < db/schema.sql"
  },
  "type": "commonjs",
  "dependencies": {
    "bcrypt": "^6.0.0",
    "connect-flash": "^0.1.1",
    "dotenv": "^17.4.2",
    "ejs": "^6.0.1",
    "express": "^5.2.1",
    "express-session": "^1.19.0",
    "multer": "^2.2.0",
    "mysql2": "^3.22.5"
  },
  "devDependencies": {
    "nodemon": "^3.1.14"
  }
}
```

### 3. Instale as dependências

```bash
npm install
```

### 4. Configure o arquivo `.env`

Crie um arquivo `.env` na raiz do projeto:

```env
PORT=3000
SESSION_SECRET=altere-isto-para-uma-string-aleatoria-longa
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sua_senha_do_mysql
DB_NAME=guia_aluno
```

> 🔒 **Segurança:** Nunca suba o `.env` para o GitHub. Adicione-o ao `.gitignore`.

---

## 🗄️ Configurando o banco de dados

### 1. Crie o arquivo `db/schema.sql`

Copie o conteúdo do schema fornecido (recria o banco do zero com todas as tabelas corretas).

### 2. Execute o schema

```bash
npm run db:setup
```

Ou manualmente:

```bash
mysql -u root -p < db/schema.sql
```

### 3. Verifique se funcionou

```bash
mysql -u root -p -e "USE guia_aluno; SHOW TABLES;"
```

Deve mostrar: `avaliacoes`, `estabelecimentos`, `usuarios`.

---

## 🔧 Correções obrigatórias nos arquivos

Antes de rodar, aplique estas correções (bugs identificados na análise):

### ✅ Correção 1 — `src/app.js`

As rotas do proprietário estão **depois** do `app.listen()` e do middleware 404. Substitua o arquivo pela versão corrigida (rotas antes do 404 e do listen).

### ✅ Correção 2 — `src/controllers/estabelecimentosController.js`

As funções `detalhar` e `cadastrar` estão duplicadas. Apague as primeiras versões (que retornam JSON) e mantenha apenas as versões que renderizam views.

### ✅ Correção 3 — `src/controllers/avaliacoesController.js`

Atualize para salvar `usuario_id` e validar a nota:

```javascript
const model = require('../models/avaliacaoModel');

exports.criarAvaliacao = async (req, res) => {
  try {
    const { nota, comentario } = req.body;
    const estabelecimento_id = req.params.id;
    const usuario_id = req.session.usuario.id;

    const notaNum = Number(nota);
    if (!Number.isInteger(notaNum) || notaNum < 1 || notaNum > 5) {
      req.flash('erro', 'Nota deve ser entre 1 e 5');
      return res.redirect(`/estabelecimento/${estabelecimento_id}`);
    }

    if (await model.jaAvaliou(usuario_id, estabelecimento_id)) {
      req.flash('erro', 'Você já avaliou este estabelecimento');
      return res.redirect(`/estabelecimento/${estabelecimento_id}`);
    }

    await model.create({ estabelecimento_id, nota: notaNum, comentario, usuario_id });
    req.flash('sucesso', 'Avaliação registrada!');
    res.redirect(`/estabelecimento/${estabelecimento_id}`);
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      req.flash('erro', 'Você já avaliou este estabelecimento');
      return res.redirect(`/estabelecimento/${req.params.id}`);
    }
    console.error(err);
    req.flash('erro', 'Erro ao registrar avaliação');
    res.redirect(`/estabelecimento/${req.params.id}`);
  }
};
```

### ✅ Correção 4 — `src/models/avaliacaoModel.js`

Atualize para incluir `usuario_id` e impedir avaliações duplicadas:

```javascript
const pool = require('../config/database');

module.exports = {
  async create({ estabelecimento_id, nota, comentario, usuario_id }) {
    const [result] = await pool.execute(
      'INSERT INTO avaliacoes (estabelecimento_id, usuario_id, nota, comentario) VALUES (?, ?, ?, ?)',
      [estabelecimento_id, usuario_id, nota, comentario]
    );
    return result.insertId;
  },

  async findByEstabelecimento(estabelecimento_id) {
    const [rows] = await pool.execute(
      `SELECT a.id, a.nota, a.comentario, a.criado_em, u.nome AS autor_nome
       FROM avaliacoes a
       JOIN usuarios u ON a.usuario_id = u.id
       WHERE a.estabelecimento_id = ?
       ORDER BY a.criado_em DESC`,
      [estabelecimento_id]
    );
    return rows;
  },

  async jaAvaliou(usuario_id, estabelecimento_id) {
    const [rows] = await pool.execute(
      'SELECT id FROM avaliacoes WHERE usuario_id = ? AND estabelecimento_id = ?',
      [usuario_id, estabelecimento_id]
    );
    return rows.length > 0;
  }
};
```

### ✅ Correção 5 — `src/routes/avaliacoesRoutes.js`

Adicione autenticação — apenas alunos logados podem avaliar:

```javascript
const router = require('express').Router();
const controller = require('../controllers/avaliacoesController');
const { exigeLogin, exigeAluno } = require('../middlewares/authMiddleware');

router.post(
  '/estabelecimentos/:id/avaliacoes',
  exigeLogin,
  exigeAluno,
  controller.criarAvaliacao
);

module.exports = router;
```

### ✅ Correção 6 — `src/app.js` (montagem da rota)

Troque:
```javascript
app.use('/api', exigeLogin, require('./routes/avaliacoesRoutes'));
```

Por:
```javascript
app.use('/', exigeLogin, require('./routes/avaliacoesRoutes'));
```

---

## ▶️ Rodando o projeto

### Ambiente de desenvolvimento (com auto-reload)

```bash
npm run dev
```

### Ambiente de produção

```bash
npm start
```

O servidor estará disponível em: **http://localhost:3000**

---

## 🧪 Fluxo de uso

### 1. Cadastrar um proprietário
1. Acesse `/cadastro`
2. Preencha os dados e selecione "Proprietário"
3. Você será redirecionado para a home logado

### 2. Cadastrar um estabelecimento
1. Acesse `/proprietario/cadastrar`
2. Preencha nome, endereço, categoria e envie uma foto
3. O estabelecimento aparecerá na home

### 3. Cadastrar um aluno
1. Faça logout (`/logout`)
2. Acesse `/cadastro` novamente
3. Selecione "Aluno"

### 4. Avaliar um estabelecimento
1. Logado como aluno, acesse `/estabelecimento/:id`
2. Preencha o formulário de avaliação (nota 1-5 + comentário)
3. Você só pode avaliar cada estabelecimento **uma vez**

---

## 📁 Estrutura do projeto

```
guia-aluno/
├── db/
│   └── schema.sql              # Script do banco de dados
├── public/
│   ├── css/
│   ├── js/
│   └── uploads/                # Fotos dos estabelecimentos
├── src/
│   ├── config/
│   │   └── database.js         # Conexão MySQL
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── avaliacoesController.js
│   │   └── estabelecimentosController.js
│   ├── middlewares/
│   │   └── authMiddleware.js
│   ├── models/
│   │   ├── avaliacaoModel.js
│   │   ├── estabelecimentoModel.js
│   │   └── usuarioModel.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── avaliacoesRoutes.js
│   │   ├── estabelecimentosRoutes.js
│   │   └── proprietarioRoutes.js
│   └── app.js                  # Arquivo principal
├── views/
│   ├── cadastro.ejs
│   ├── detalhes.ejs
│   ├── index.ejs
│   ├── login.ejs
│   ├── 404.ejs
│   └── erro.ejs
├── .env                        # Variáveis de ambiente
├── .gitignore
├── package.json
└── README.md
```

---

## 🐛 Troubleshooting

### Erro: `Cannot find module`
```bash
rm -rf node_modules package-lock.json
npm install
```

### Erro: `ECONNREFUSED` ao conectar no MySQL
- Verifique se o MySQL está rodando
- Confirme as credenciais no `.env`
- Teste: `mysql -u root -p`

### Erro: `argument handler must be a function`
- Verifique se o controller não tem funções duplicadas
- Confirme que todas as funções estão em `module.exports`

### Erro: `Table 'guia_aluno.avaliacoes' doesn't exist`
- Rode novamente: `npm run db:setup`

### Avaliação não funciona (404)
- Verifique se o formulário envia para `/estabelecimentos/:id/avaliacoes` (sem `/api`)
- Confirme que o usuário está logado como **aluno**

### Proprietário não consegue cadastrar estabelecimento
- Verifique se as rotas `/proprietario/*` estão **antes** do middleware 404 no `app.js`
- Confirme que o `proprietarioRoutes.js` existe

---

## 🔒 Segurança

- ✅ Senhas hasheadas com `bcrypt` (10 rounds)
- ✅ Sessions com cookie HTTP-only
- ✅ Middlewares de autenticação por tipo de usuário
- ✅ UNIQUE KEY impede avaliações duplicadas
- ✅ Validação de nota (1-5) no backend

### ⚠️ Melhorias recomendadas
- Adicionar CSRF protection (`csurf`)
- Adicionar rate limiting (`express-rate-limit`)
- Validar uploads com `multer` (tipo e tamanho de arquivo)
- Usar `helmet` para headers de segurança
- Mover `SESSION_SECRET` para `.env` (não usar fallback fraco)

---

## 📝 Licença

ISC