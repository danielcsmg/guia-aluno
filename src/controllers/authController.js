const usuarioModel = require('../models/usuarioModel');

exports.loginForm = (req, res) => res.render('login');

exports.login = async (req, res) => {
  try {
    const { email, senha } = req.body;
    if (!email || !senha) {
      req.flash('erro', 'Preencha todos os campos');
      return res.redirect('/login');
    }

    const usuario = await usuarioModel.validarCredenciais(email, senha);
    if (!usuario) {
      req.flash('erro', 'Email ou senha inválidos');
      return res.redirect('/login');
    }

    // Salva também o TIPO na sessão
    req.session.usuario = {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      tipo: usuario.tipo
    };

    req.flash('sucesso', `Bem-vindo, ${usuario.nome}!`);
    res.redirect('/');
  } catch (err) {
    console.error(err);
    req.flash('erro', 'Erro ao fazer login');
    res.redirect('/login');
  }
};

exports.cadastroForm = (req, res) => res.render('cadastro');

exports.cadastro = async (req, res) => {
  try {
    const { nome, email, senha, confirmar_senha, tipo } = req.body;

    // Validações
    if (!nome || !email || !senha || !confirmar_senha) {
      req.flash('erro', 'Preencha todos os campos');
      return res.redirect('/cadastro');
    }

    if (!['aluno', 'proprietario'].includes(tipo)) {
      req.flash('erro', 'Selecione um tipo de perfil válido');
      return res.redirect('/cadastro');
    }

    if (senha !== confirmar_senha) {
      req.flash('erro', 'As senhas não coincidem');
      return res.redirect('/cadastro');
    }

    if (senha.length < 6) {
      req.flash('erro', 'A senha deve ter pelo menos 6 caracteres');
      return res.redirect('/cadastro');
    }

    const existe = await usuarioModel.emailExists(email);
    if (existe) {
      req.flash('erro', 'Este email já está cadastrado');
      return res.redirect('/cadastro');
    }

    // Cria usuário com o perfil selecionado
    const id = await usuarioModel.create({ nome, email, senha, tipo });

    // Login automático
    req.session.usuario = { id, nome, email, tipo };

    const tipoLabel = tipo === 'proprietario' ? 'Proprietário' : 'Aluno';
    req.flash('sucesso', `Cadastro como ${tipoLabel} realizado com sucesso!`);
    res.redirect('/');
  } catch (err) {
    console.error(err);
    req.flash('erro', 'Erro ao cadastrar: ' + err.message);
    res.redirect('/cadastro');
  }
};

exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) console.error(err);
    res.redirect('/login');
  });
};