const pool = require('../config/database');
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

module.exports = {
  /**
   * Cria um novo usuário com perfil (aluno ou proprietario)
   */
  async create({ nome, email, senha, tipo = 'aluno' }) {
    if (!['aluno', 'proprietario'].includes(tipo)) {
      throw new Error('Tipo de usuário inválido');
    }
    const senha_hash = await bcrypt.hash(senha, SALT_ROUNDS);
    const [result] = await pool.execute(
      'INSERT INTO usuarios (nome, email, senha_hash, tipo) VALUES (?, ?, ?, ?)',
      [nome, email, senha_hash, tipo]
    );
    return result.insertId;
  },

  async findByEmail(email) {
    const [rows] = await pool.execute(
      'SELECT * FROM usuarios WHERE email = ?',
      [email]
    );
    return rows[0];
  },

  async findById(id) {
    const [rows] = await pool.execute(
      'SELECT id, nome, email, tipo, criado_em FROM usuarios WHERE id = ?',
      [id]
    );
    return rows[0];
  },

  async emailExists(email) {
    const [rows] = await pool.execute(
      'SELECT COUNT(*) as count FROM usuarios WHERE email = ?',
      [email]
    );
    return rows[0].count > 0;
  },

  async validarCredenciais(email, senha) {
    const usuario = await this.findByEmail(email);
    if (!usuario) return null;

    const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);
    return senhaValida ? usuario : null;
  }
};