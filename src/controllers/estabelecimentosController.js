const model = require('../models/estabelecimentoModel');

exports.listar = async (req, res) => {
  try {
    const estabelecimentos = await model.findAllRanked();
    res.json(estabelecimentos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.detalhar = async (req, res) => {
  try {
    const { id } = req.params;
    const estabelecimento = await model.findByIdWithStats(id);
    if (!estabelecimento) {
      return res.status(404).render('404', { mensagem: 'Estabelecimento não encontrado' });
    }
    const avaliacoes = await model.findAvaliacoesByEstabelecimento(id);
    res.render('detalhes', { estabelecimento, avaliacoes });
  } catch (err) {
    console.error(err);
    res.status(500).render('erro', { mensagem: 'Erro ao carregar detalhes' });
  }
};

exports.cadastrar = async (req, res) => {
  try {
    if (req.session?.usuario?.tipo !== 'proprietario') {
      return res.status(403).json({ error: 'Apenas proprietários podem cadastrar' });
    }
    const foto_url = req.file ? `/uploads/${req.file.filename}` : null;
    const id = await model.create({
      ...req.body,
      foto_url,
      proprietario_id: req.session.usuario.id
    });
    res.status(201).json({ id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

exports.atualizar = async (req, res) => {
  try {
    const foto_url = req.file ? `/uploads/${req.file.filename}` : null;
    await model.update(req.params.id, { ...req.body, foto_url });
    res.status(200).json({ message: 'Atualizado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.excluir = async (req, res) => {
  try {
    await model.delete(req.params.id);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.meusEstabelecimentos = async (req, res) => {
  try {
    const estabelecimentos = await model.findByProprietario(req.session.usuario.id);
    res.json(estabelecimentos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};