/**
 * Middleware que exige login para acessar rotas protegidas
 */
exports.exigeLogin = (req, res, next) => {
  if (req.session && req.session.usuario) {
    return next();
  }
  
  req.flash('erro', 'Você precisa estar logado para acessar esta página');
  res.redirect('/login');
};

/**
 * Middleware que redireciona usuários já logados (login/cadastro)
 */
exports.redirecionarSeLogado = (req, res, next) => {
  if (req.session && req.session.usuario) {
    return res.redirect('/');
  }
  next();
};

/**
 * Exige que o usuário seja ALUNO
 */
exports.exigeAluno = (req, res, next) => {
  if (req.session?.usuario?.tipo === 'aluno') return next();
  req.flash('erro', 'Acesso restrito a alunos');
  res.redirect('/');
};

/**
 * Exige que o usuário seja PROPRIETÁRIO
 */
exports.exigeProprietario = (req, res, next) => {
  if (req.session?.usuario?.tipo === 'proprietario') return next();
  req.flash('erro', 'Acesso restrito a proprietários');
  res.redirect('/');
};

/**
 * Disponibiliza usuário e mensagens para todas as views
 */
exports.usuarioGlobal = (req, res, next) => {
  res.locals.usuario = req.session?.usuario || null;
  res.locals.mensagens = {
    erro: req.flash('erro'),
    sucesso: req.flash('sucesso')
  };
  next();
};
