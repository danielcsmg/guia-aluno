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