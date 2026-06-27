const model = require('../models/avaliacaoModel');

exports.criarAvaliacao = async (req, res) => {
  try {
    const { nota, comentario } = req.body;
    const estabelecimento_id = req.params.id;
    const usuario_id = req.session.usuario.id; // ✅ Identifica o aluno

    // Validação da nota
    const notaNum = Number(nota);
    if (!Number.isInteger(notaNum) || notaNum < 1 || notaNum > 5) {
      req.flash('erro', 'Nota deve ser um número entre 1 e 5');
      return res.redirect(`/estabelecimento/${estabelecimento_id}`);
    }

    // Impede avaliação duplicada
    if (await model.jaAvaliou(usuario_id, estabelecimento_id)) {
      req.flash('erro', 'Você já avaliou este estabelecimento');
      return res.redirect(`/estabelecimento/${estabelecimento_id}`);
    }

    await model.create({ estabelecimento_id, nota: notaNum, comentario, usuario_id });

    req.flash('sucesso', 'Avaliação registrada com sucesso!');
    res.redirect(`/estabelecimento/${estabelecimento_id}`);
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      req.flash('erro', 'Você já avaliou este estabelecimento');
      return res.redirect(`/estabelecimento/${req.params.id}`);
    }
    console.error('Erro ao criar avaliação:', err);
    req.flash('erro', 'Erro ao registrar avaliação');
    res.redirect(`/estabelecimento/${req.params.id}`);
  }
};