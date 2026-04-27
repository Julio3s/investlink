const pool = require('../config/db');
const { uploadBuffer } = require('../utils/cloudinary');

// POST /kyc/submit
const submitKYC = async (req, res) => {
  try {
    const idDocumentFile = req.files?.id_document?.[0];
    const selfieFile = req.files?.selfie?.[0];

    const [id_document_url, selfie_url] = await Promise.all([
      idDocumentFile
        ? uploadBuffer(idDocumentFile, { folder: 'investlink/kyc', resourceType: 'auto' })
        : null,
      selfieFile
        ? uploadBuffer(selfieFile, { folder: 'investlink/kyc', resourceType: 'image' })
        : null,
    ]);

    if (!id_document_url || !selfie_url) {
      return res.status(400).json({ message: 'Pièce d\'identité et selfie requis' });
    }

    // Check existing
    const existing = await pool.query('SELECT id FROM kyc_verifications WHERE user_id=$1', [req.user.id]);
    if (existing.rows[0]) {
      await pool.query(
        'UPDATE kyc_verifications SET id_document_url=$1, selfie_url=$2, status=\'en_attente\', submitted_at=NOW() WHERE user_id=$3',
        [id_document_url, selfie_url, req.user.id]
      );
    } else {
      await pool.query(
        'INSERT INTO kyc_verifications (user_id, id_document_url, selfie_url) VALUES ($1,$2,$3)',
        [req.user.id, id_document_url, selfie_url]
      );
    }

    await pool.query('UPDATE users SET verification_status=\'en_attente\' WHERE id=$1', [req.user.id]);

    res.json({ message: 'Vérification soumise, en attente de validation' });
  } catch (err) {
    if (err.message === 'Cloudinary is not configured') {
      return res.status(503).json({ message: 'Le stockage Cloudinary n est pas configure sur ce deploiement' });
    }
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// GET /kyc/status
const getKYCStatus = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT status, rejection_reason, submitted_at FROM kyc_verifications WHERE user_id=$1',
      [req.user.id]
    );
    res.json(result.rows[0] || { status: 'non_soumis' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Admin: GET /kyc/pending
const getPendingKYC = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT k.*, u.first_name, u.last_name, u.email, u.role
       FROM kyc_verifications k JOIN users u ON u.id = k.user_id
       WHERE k.status = 'en_attente' ORDER BY k.submitted_at ASC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Admin: POST /kyc/:userId/validate
const validateKYC = async (req, res) => {
  try {
    const { userId } = req.params;
    const { action, reason } = req.body; // 'approve' | 'reject'

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ message: 'Action invalide' });
    }

    const status = action === 'approve' ? 'verifie' : 'rejete';
    const user_status = action === 'approve' ? 'verifie' : 'rejete';

    await pool.query(
      `UPDATE kyc_verifications SET status=$1, rejection_reason=$2, reviewed_by=$3, reviewed_at=NOW()
       WHERE user_id=$4`,
      [status, reason || null, req.user.id, userId]
    );

    await pool.query('UPDATE users SET verification_status=$1 WHERE id=$2', [user_status, userId]);

    // Update trust score
    if (action === 'approve') {
      await pool.query('UPDATE users SET trust_score = LEAST(trust_score + 40, 100) WHERE id=$1', [userId]);
    }

    // Notify user
    const notifTitle = action === 'approve' ? 'Profil vérifié ✅' : 'Vérification rejetée ❌';
    const notifMsg = action === 'approve'
      ? 'Votre profil a été vérifié avec succès.'
      : `Votre vérification a été rejetée : ${reason || 'Documents insuffisants'}`;

    await pool.query(
      'INSERT INTO notifications (user_id, type, title, message) VALUES ($1,$2,$3,$4)',
      [userId, 'kyc_result', notifTitle, notifMsg]
    );

    res.json({ message: `KYC ${action === 'approve' ? 'approuvé' : 'rejeté'}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

module.exports = { submitKYC, getKYCStatus, getPendingKYC, validateKYC };
