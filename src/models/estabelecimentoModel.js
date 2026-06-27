const pool = require('../config/database');

module.exports = {
  async findAllRanked() {
    const query = `
      SELECT e.id, e.nome, e.endereco, e.foto_url, e.categoria,
             COALESCE(AVG(a.nota), 0) AS media_estrelas,
             COUNT(a.id) AS total_avaliacoes
      FROM estabelecimentos e
      LEFT JOIN avaliacoes a ON e.id = a.estabelecimento_id
      GROUP BY e.id
      ORDER BY media_estrelas DESC
    `;
    const [rows] = await pool.execute(query);
    return rows;
  },

  async findById(id) {
    const [rows] = await pool.execute(
      'SELECT * FROM estabelecimentos WHERE id = ?', [id]
    );
    return rows[0];
  },

  async findByIdWithStats(id) {
    const query = `
      SELECT e.id, e.nome, e.endereco, e.foto_url, e.categoria, e.criado_em,
             COALESCE(AVG(a.nota), 0) AS media_estrelas,
             COUNT(a.id) AS total_avaliacoes
      FROM estabelecimentos e
      LEFT JOIN avaliacoes a ON e.id = a.estabelecimento_id
      WHERE e.id = ?
      GROUP BY e.id
    `;
    const [rows] = await pool.execute(query, [id]);
    return rows[0];
  },

  async findAvaliacoesByEstabelecimento(id) {
    // ✅ Agora traz o nome do aluno que avaliou
    const query = `
      SELECT a.id, a.nota, a.comentario, a.criado_em, u.nome AS autor_nome
      FROM avaliacoes a
      JOIN usuarios u ON a.usuario_id = u.id
      WHERE a.estabelecimento_id = ?
      ORDER BY a.criado_em DESC
    `;
    const [rows] = await pool.execute(query, [id]);
    return rows;
  },

  async create({ nome, endereco, foto_url, categoria, proprietario_id }) {
    const [result] = await pool.execute(
      'INSERT INTO estabelecimentos (nome, endereco, foto_url, categoria, proprietario_id) VALUES (?, ?, ?, ?, ?)',
      [nome, endereco, foto_url, categoria, proprietario_id]
    );
    return result.insertId;
  },

  async update(id, { nome, endereco, foto_url, categoria }) {
    await pool.execute(
      'UPDATE estabelecimentos SET nome = ?, endereco = ?, foto_url = COALESCE(?, foto_url), categoria = ? WHERE id = ?',
      [nome, endereco, foto_url, categoria, id]
    );
  },

  async delete(id) {
    await pool.execute('DELETE FROM estabelecimentos WHERE id = ?', [id]);
  },

  // ✅ Movido do controller para cá (boa prática MVC)
  async findByProprietario(proprietarioId) {
    const query = `
      SELECT e.*,
             COALESCE(AVG(a.nota), 0) AS media_estrelas,
             COUNT(a.id) AS total_avaliacoes
      FROM estabelecimentos e
      LEFT JOIN avaliacoes a ON e.id = a.estabelecimento_id
      WHERE e.proprietario_id = ?
      GROUP BY e.id
      ORDER BY e.criado_em DESC
    `;
    const [rows] = await pool.execute(query, [proprietarioId]);
    return rows;
  }
};