const pool = require('../config/db');

// POST /conversations - create or get existing
const createConversation = async (req, res) => {
  try {
    const { project_id, recipient_id } = req.body;
    const sender_id = req.user.id;

    // Check if conversation already exists
    const existing = await pool.query(
      `SELECT * FROM conversations WHERE project_id = $1 
       AND ((user_1_id=$2 AND user_2_id=$3) OR (user_1_id=$3 AND user_2_id=$2))`,
      [project_id, sender_id, recipient_id]
    );

    if (existing.rows[0]) return res.json(existing.rows[0]);

    // Verify project exists
    const project = await pool.query('SELECT owner_id, title FROM projects WHERE id=$1', [project_id]);
    if (!project.rows[0]) return res.status(404).json({ message: 'Projet introuvable' });

    const result = await pool.query(
      'INSERT INTO conversations (project_id, user_1_id, user_2_id) VALUES ($1,$2,$3) RETURNING *',
      [project_id, sender_id, recipient_id]
    );

    // Notify recipient
    await pool.query(
      `INSERT INTO notifications (user_id, type, title, message, reference_id, reference_type)
       VALUES ($1,'new_conversation','Nouvel investisseur intéressé',
       'Un investisseur est intéressé par votre projet : ' || $2, $3, 'conversation')`,
      [recipient_id, project.rows[0].title, result.rows[0].id]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// GET /conversations - user's conversations
const getUserConversations = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.*,
        p.title AS project_title,
        u1.first_name AS user1_first_name, u1.last_name AS user1_last_name, u1.avatar_url AS user1_avatar,
        u2.first_name AS user2_first_name, u2.last_name AS user2_last_name, u2.avatar_url AS user2_avatar,
        (SELECT content FROM messages WHERE conversation_id=c.id ORDER BY created_at DESC LIMIT 1) AS last_message,
        (SELECT created_at FROM messages WHERE conversation_id=c.id ORDER BY created_at DESC LIMIT 1) AS last_message_at,
        (SELECT COUNT(*) FROM messages WHERE conversation_id=c.id AND sender_id != $1 AND is_read = FALSE) AS unread_count
       FROM conversations c
       LEFT JOIN projects p ON p.id = c.project_id
       JOIN users u1 ON u1.id = c.user_1_id
       JOIN users u2 ON u2.id = c.user_2_id
       WHERE c.user_1_id = $1 OR c.user_2_id = $1
       ORDER BY last_message_at DESC NULLS LAST`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// GET /conversations/:id/messages
const getMessages = async (req, res) => {
  try {
    const { id } = req.params;
    const conv = await pool.query(
      'SELECT * FROM conversations WHERE id=$1 AND (user_1_id=$2 OR user_2_id=$2)',
      [id, req.user.id]
    );
    if (!conv.rows[0]) return res.status(403).json({ message: 'Accès refusé' });

    const messages = await pool.query(
      `SELECT m.*, u.first_name, u.last_name, u.avatar_url
       FROM messages m JOIN users u ON u.id = m.sender_id
       WHERE m.conversation_id = $1 ORDER BY m.created_at ASC`,
      [id]
    );

    // Mark messages as read
    await pool.query(
      'UPDATE messages SET is_read=TRUE WHERE conversation_id=$1 AND sender_id != $2',
      [id, req.user.id]
    );

    res.json(messages.rows);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// POST /messages
const sendMessage = async (req, res) => {
  try {
    const { conversation_id, content } = req.body;
    const file_url = req.file ? `/${req.file.path.replace(/\\/g, '/')}` : null;
    const type = file_url ? 'fichier' : 'texte';

    const conv = await pool.query(
      'SELECT * FROM conversations WHERE id=$1 AND (user_1_id=$2 OR user_2_id=$2) AND status = \'actif\'',
      [conversation_id, req.user.id]
    );
    if (!conv.rows[0]) return res.status(403).json({ message: 'Accès refusé ou conversation inactive' });

    const result = await pool.query(
      'INSERT INTO messages (conversation_id, sender_id, content, type, file_url) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [conversation_id, req.user.id, content || '', type, file_url]
    );

    // Notify other participant
    const other_id = conv.rows[0].user_1_id === req.user.id ? conv.rows[0].user_2_id : conv.rows[0].user_1_id;
    await pool.query(
      `INSERT INTO notifications (user_id, type, title, message, reference_id, reference_type)
       VALUES ($1,'new_message','Nouveau message','Vous avez reçu un nouveau message',$2,'conversation')`,
      [other_id, conversation_id]
    );

    // Update conversation updated_at
    await pool.query('UPDATE conversations SET updated_at=NOW() WHERE id=$1', [conversation_id]);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// POST /conversations/:id/report
const reportConversation = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const conv = await pool.query('SELECT * FROM conversations WHERE id=$1', [id]);
    if (!conv.rows[0]) return res.status(404).json({ message: 'Conversation introuvable' });
    const reported_user_id = conv.rows[0].user_1_id === req.user.id ? conv.rows[0].user_2_id : conv.rows[0].user_1_id;
    await pool.query(
      'INSERT INTO reports (reporter_id, reported_user_id, reason) VALUES ($1,$2,$3)',
      [req.user.id, reported_user_id, reason]
    );
    res.json({ message: 'Signalement envoyé' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

module.exports = { createConversation, getUserConversations, getMessages, sendMessage, reportConversation };
