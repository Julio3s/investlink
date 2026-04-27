const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const pool = require('../config/db');
const { uploadBuffer } = require('../utils/cloudinary');

const generateToken = (user) =>
  jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });

const register = async (req, res) => {
  try {
    const { email, password, role, first_name, last_name, phone, country } = req.body;

    if (!['porteur', 'investisseur'].includes(role)) {
      return res.status(400).json({ message: 'Role invalide' });
    }

    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows[0]) {
      return res.status(409).json({ message: 'Email deja utilise' });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const email_token = crypto.randomBytes(32).toString('hex');

    const result = await pool.query(
      `INSERT INTO users (email, password_hash, role, first_name, last_name, phone, country, email_token, verification_status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id, email, role, first_name, last_name`,
      [email, password_hash, role, first_name, last_name, phone, country, email_token, 'non_verifie']
    );

    const user = result.rows[0];
    const token = generateToken(user);

    res.status(201).json({
      message: 'Compte cree avec succes',
      token,
      user: { id: user.id, email: user.email, role: user.role, first_name: user.first_name, last_name: user.last_name },
    });
  } catch (err) {
    if (err.message === 'Cloudinary is not configured') {
      return res.status(503).json({ message: 'Le stockage Cloudinary n est pas configure sur ce deploiement' });
    }
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await pool.query(
      `SELECT id, email, password_hash, role, first_name, last_name, is_active, is_suspended, verification_status, trust_score, avatar_url
       FROM users WHERE email = $1`,
      [email]
    );

    const user = result.rows[0];
    if (!user) return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    if (user.is_suspended) return res.status(403).json({ message: 'Compte suspendu' });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ message: 'Email ou mot de passe incorrect' });

    const token = generateToken(user);
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        first_name: user.first_name,
        last_name: user.last_name,
        verification_status: user.verification_status,
        trust_score: user.trust_score,
        avatar_url: user.avatar_url,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

const getMe = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, email, role, first_name, last_name, phone, country, bio, avatar_url, email_verified, verification_status, trust_score, created_at
       FROM users WHERE id = $1`,
      [req.user.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

const getMembers = async (req, res) => {
  try {
    const { q = '', role = '' } = req.query;
    const filters = ['id != $1', 'is_active = TRUE', 'is_suspended = FALSE'];
    const values = [req.user.id];
    let i = 2;

    if (q) {
      filters.push(`(first_name ILIKE $${i} OR last_name ILIKE $${i} OR email ILIKE $${i} OR country ILIKE $${i})`);
      values.push(`%${q}%`);
      i += 1;
    }

    if (role && ['porteur', 'investisseur', 'admin'].includes(role)) {
      filters.push(`role = $${i}`);
      values.push(role);
      i += 1;
    }

    const result = await pool.query(
      `SELECT id, email, role, first_name, last_name, country, bio, avatar_url, verification_status, trust_score, created_at
       FROM users
       WHERE ${filters.join(' AND ')}
       ORDER BY verification_status = 'verifie' DESC, trust_score DESC, created_at DESC`,
      values
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

const getMemberProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const member = await pool.query(
      `SELECT id, role, first_name, last_name, country, bio, avatar_url, verification_status, trust_score, created_at
       FROM users
       WHERE id = $1 AND is_active = TRUE AND is_suspended = FALSE`,
      [id]
    );

    if (!member.rows[0]) return res.status(404).json({ message: 'Membre introuvable' });

    const projects = await pool.query(
      `SELECT id, title, sector, country, amount_sought, currency_code, image_url, status, created_at
       FROM projects
       WHERE owner_id = $1 AND status != 'brouillon'
       ORDER BY created_at DESC`,
      [id]
    );

    res.json({
      ...member.rows[0],
      project_count: projects.rows.length,
      projects: projects.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { first_name, last_name, phone, country, bio } = req.body;
    const avatar_url = req.file ? await uploadBuffer(req.file, { folder: 'investlink/avatars', resourceType: 'image' }) : undefined;

    const fields = [];
    const values = [];
    let i = 1;

    if (first_name) { fields.push(`first_name=$${i++}`); values.push(first_name); }
    if (last_name) { fields.push(`last_name=$${i++}`); values.push(last_name); }
    if (phone) { fields.push(`phone=$${i++}`); values.push(phone); }
    if (country) { fields.push(`country=$${i++}`); values.push(country); }
    if (bio !== undefined) { fields.push(`bio=$${i++}`); values.push(bio); }
    if (avatar_url) { fields.push(`avatar_url=$${i++}`); values.push(avatar_url); }

    if (!fields.length) return res.status(400).json({ message: 'Aucun champ a mettre a jour' });

    values.push(req.user.id);
    const result = await pool.query(`UPDATE users SET ${fields.join(', ')} WHERE id = $${i} RETURNING id, email, role, first_name, last_name, phone, country, bio, avatar_url`, values);
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

module.exports = { register, login, getMe, getMembers, getMemberProfile, updateProfile };
