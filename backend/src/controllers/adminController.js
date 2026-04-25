const pool = require('../config/db');

const getDashboard = async (req, res) => {
  try {
    const [users, projects, pending_kyc, reports, conversations] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM users'),
      pool.query('SELECT COUNT(*) FROM projects'),
      pool.query("SELECT COUNT(*) FROM kyc_verifications WHERE status='en_attente'"),
      pool.query("SELECT COUNT(*) FROM reports WHERE status='ouvert'"),
      pool.query('SELECT COUNT(*) FROM conversations'),
    ]);

    res.json({
      total_users: parseInt(users.rows[0].count),
      total_projects: parseInt(projects.rows[0].count),
      pending_kyc: parseInt(pending_kyc.rows[0].count),
      open_reports: parseInt(reports.rows[0].count),
      total_conversations: parseInt(conversations.rows[0].count),
    });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, role, verification_status } = req.query;
    const offset = (page - 1) * limit;
    const filters = [];
    const values = [];
    let i = 1;

    if (role) { filters.push(`role=$${i++}`); values.push(role); }
    if (verification_status) { filters.push(`verification_status=$${i++}`); values.push(verification_status); }

    const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
    values.push(limit, offset);

    const result = await pool.query(
      `SELECT id, email, role, first_name, last_name, verification_status, trust_score, 
       is_active, is_suspended, created_at FROM users ${where} 
       ORDER BY created_at DESC LIMIT $${i++} OFFSET $${i}`,
      values
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

const suspendUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { suspend, reason } = req.body;
    await pool.query('UPDATE users SET is_suspended=$1 WHERE id=$2', [suspend, userId]);
    if (suspend) {
      await pool.query(
        'INSERT INTO notifications (user_id, type, title, message) VALUES ($1,$2,$3,$4)',
        [userId, 'account_action', 'Compte suspendu', reason || 'Votre compte a été suspendu par un administrateur']
      );
    }
    res.json({ message: `Utilisateur ${suspend ? 'suspendu' : 'réactivé'}` });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

const getReports = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT r.*, 
       reporter.first_name AS reporter_first, reporter.last_name AS reporter_last,
       reported.first_name AS reported_first, reported.last_name AS reported_last
       FROM reports r
       LEFT JOIN users reporter ON reporter.id = r.reporter_id
       LEFT JOIN users reported ON reported.id = r.reported_user_id
       WHERE r.status = 'ouvert' ORDER BY r.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

const resolveReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, admin_note } = req.body;
    await pool.query(
      'UPDATE reports SET status=$1, admin_note=$2 WHERE id=$3',
      [status, admin_note, id]
    );
    res.json({ message: 'Signalement traité' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

const moderateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'validate' | 'flag' | 'remove'
    if (action === 'validate') {
      await pool.query('UPDATE projects SET is_validated=TRUE WHERE id=$1', [id]);
      const p = await pool.query('SELECT owner_id, title FROM projects WHERE id=$1', [id]);
      await pool.query(
        'INSERT INTO notifications (user_id, type, title, message) VALUES ($1,$2,$3,$4)',
        [p.rows[0].owner_id, 'project_validated', 'Projet validé ✅', `Votre projet "${p.rows[0].title}" a été validé.`]
      );
    } else if (action === 'flag') {
      await pool.query('UPDATE projects SET is_flagged=TRUE WHERE id=$1', [id]);
    } else if (action === 'remove') {
      await pool.query('DELETE FROM projects WHERE id=$1', [id]);
    }
    res.json({ message: 'Action effectuée' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

module.exports = { getDashboard, getUsers, suspendUser, getReports, resolveReport, moderateProject };
