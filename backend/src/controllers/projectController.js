const pool = require('../config/db');
const { uploadBuffer } = require('../utils/cloudinary');

// GET /projects
const getProjects = async (req, res) => {
  try {
    const { sector, country, status, min_amount, max_amount, sort = 'recent', page = 1, limit = 12 } = req.query;
    const offset = (page - 1) * limit;
    const filters = ["p.status != 'brouillon'"];
    const values = [];
    let i = 1;

    if (sector) { filters.push(`p.sector = $${i++}`); values.push(sector); }
    if (country) { filters.push(`p.country = $${i++}`); values.push(country); }
    if (status) { filters.push(`p.status = $${i++}`); values.push(status); }
    if (min_amount) { filters.push(`p.amount_sought >= $${i++}`); values.push(min_amount); }
    if (max_amount) { filters.push(`p.amount_sought <= $${i++}`); values.push(max_amount); }

    const sortMap = {
      recent: 'p.created_at DESC',
      popular: 'p.views_count DESC',
      amount_asc: 'p.amount_sought ASC',
      amount_desc: 'p.amount_sought DESC',
    };
    const orderBy = sortMap[sort] || 'p.created_at DESC';

    const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
    values.push(limit, offset);

    const query = `
      SELECT p.*, 
             u.first_name, u.last_name, u.avatar_url, u.verification_status, u.trust_score,
             (SELECT COUNT(*) FROM favorites WHERE project_id = p.id) AS favorites_count
      FROM projects p
      JOIN users u ON u.id = p.owner_id
      ${where}
      ORDER BY ${orderBy}
      LIMIT $${i++} OFFSET $${i}
    `;

    const countQuery = `SELECT COUNT(*) FROM projects p ${where}`;
    const [rows, count] = await Promise.all([
      pool.query(query, values),
      pool.query(countQuery, values.slice(0, -2)),
    ]);

    res.json({
      projects: rows.rows,
      total: parseInt(count.rows[0].count),
      page: parseInt(page),
      pages: Math.ceil(count.rows[0].count / limit),
    });
  } catch (err) {
    if (err.message === 'Cloudinary is not configured') {
      return res.status(503).json({ message: 'Le stockage Cloudinary n est pas configure sur ce deploiement' });
    }
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// GET /projects/:id
const getProject = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT p.*, u.first_name, u.last_name, u.avatar_url, u.verification_status, u.trust_score, u.bio
       FROM projects p JOIN users u ON u.id = p.owner_id WHERE p.id = $1`,
      [id]
    );
    if (!result.rows[0]) return res.status(404).json({ message: 'Projet introuvable' });

    await pool.query('UPDATE projects SET views_count = views_count + 1 WHERE id = $1', [id]);

    const updates = await pool.query(
      'SELECT * FROM project_updates WHERE project_id = $1 ORDER BY created_at DESC',
      [id]
    );

    res.json({ ...result.rows[0], updates: updates.rows });
  } catch (err) {
    if (err.message === 'Cloudinary is not configured') {
      return res.status(503).json({ message: 'Le stockage Cloudinary n est pas configure sur ce deploiement' });
    }
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// POST /projects
const createProject = async (req, res) => {
  try {
    const {
      title, problem_description, solution, target_market,
      business_model, amount_sought, sector, country,
    } = req.body;

    const pitchDeckFile = req.files?.pitch_deck?.[0];
    const projectImageFile = req.files?.project_image?.[0];

    const [pitch_deck_url, image_url] = await Promise.all([
      pitchDeckFile
        ? uploadBuffer(pitchDeckFile, { folder: 'investlink/pitchdecks', resourceType: 'raw' })
        : null,
      projectImageFile
        ? uploadBuffer(projectImageFile, { folder: 'investlink/projects', resourceType: 'image' })
        : null,
    ]);

    const result = await pool.query(
      `INSERT INTO projects (owner_id, title, problem_description, solution, target_market,
       business_model, amount_sought, sector, country, pitch_deck_url, image_url)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
      [req.user.id, title, problem_description, solution, target_market,
       business_model, amount_sought, sector, country, pitch_deck_url, image_url]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// PUT /projects/:id
const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await pool.query('SELECT * FROM projects WHERE id = $1', [id]);
    if (!project.rows[0]) return res.status(404).json({ message: 'Projet introuvable' });
    if (project.rows[0].owner_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    const { title, problem_description, solution, target_market,
      business_model, amount_sought, sector, country, status } = req.body;

    const pitchDeckFile = req.files?.pitch_deck?.[0];
    const projectImageFile = req.files?.project_image?.[0];
    const [pitch_deck_url, image_url] = await Promise.all([
      pitchDeckFile
        ? uploadBuffer(pitchDeckFile, { folder: 'investlink/pitchdecks', resourceType: 'raw' })
        : null,
      projectImageFile
        ? uploadBuffer(projectImageFile, { folder: 'investlink/projects', resourceType: 'image' })
        : null,
    ]);

    const result = await pool.query(
      `UPDATE projects SET title=COALESCE($1,title), problem_description=COALESCE($2,problem_description),
       solution=COALESCE($3,solution), target_market=COALESCE($4,target_market),
       business_model=COALESCE($5,business_model), amount_sought=COALESCE($6,amount_sought),
       sector=COALESCE($7,sector), country=COALESCE($8,country), status=COALESCE($9,status),
       pitch_deck_url=COALESCE($10,pitch_deck_url), image_url=COALESCE($11,image_url)
       WHERE id=$12 RETURNING *`,
      [title, problem_description, solution, target_market, business_model, amount_sought, sector, country, status, pitch_deck_url, image_url, id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// DELETE /projects/:id
const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await pool.query('SELECT owner_id FROM projects WHERE id = $1', [id]);
    if (!project.rows[0]) return res.status(404).json({ message: 'Projet introuvable' });
    if (project.rows[0].owner_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Accès refusé' });
    }
    await pool.query('DELETE FROM projects WHERE id = $1', [id]);
    res.json({ message: 'Projet supprimé' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// POST /projects/:id/favorite
const toggleFavorite = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await pool.query(
      'SELECT id FROM favorites WHERE user_id=$1 AND project_id=$2',
      [req.user.id, id]
    );
    if (existing.rows[0]) {
      await pool.query('DELETE FROM favorites WHERE user_id=$1 AND project_id=$2', [req.user.id, id]);
      return res.json({ favorited: false });
    }
    await pool.query('INSERT INTO favorites (user_id, project_id) VALUES ($1,$2)', [req.user.id, id]);
    res.json({ favorited: true });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// GET /projects/my
const getMyProjects = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM projects WHERE owner_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// POST /projects/:id/update
const addProjectUpdate = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;
    const project = await pool.query('SELECT owner_id FROM projects WHERE id=$1', [id]);
    if (!project.rows[0] || project.rows[0].owner_id !== req.user.id) {
      return res.status(403).json({ message: 'Accès refusé' });
    }
    const result = await pool.query(
      'INSERT INTO project_updates (project_id, title, content) VALUES ($1,$2,$3) RETURNING *',
      [id, title, content]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

module.exports = { getProjects, getProject, createProject, updateProject, deleteProject, toggleFavorite, getMyProjects, addProjectUpdate };
