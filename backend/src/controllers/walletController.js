const pool = require('../config/db');

const DEFAULT_WALLET = {
  base_currency: 'USD',
  total_balance: 150,
  investable_balance: 150,
  withdrawable_balance: 0,
  locked_bonus: 150,
  deposit_status: 'developpement',
  withdrawal_status: 'developpement',
};

const ensureWalletForUser = async (userId) => {
  if (!userId) return;

  await pool.query(
    `INSERT INTO wallet_accounts (
      user_id, base_currency, total_balance, investable_balance, withdrawable_balance, locked_bonus
    ) VALUES ($1,$2,$3,$4,$5,$6)
    ON CONFLICT (user_id) DO NOTHING`,
    [userId, DEFAULT_WALLET.base_currency, DEFAULT_WALLET.total_balance, DEFAULT_WALLET.investable_balance, DEFAULT_WALLET.withdrawable_balance, DEFAULT_WALLET.locked_bonus]
  );

  await pool.query(
    `INSERT INTO wallet_transactions (user_id, type, amount, currency_code, note, status)
     SELECT $1, 'bonus', 150, 'USD', 'Solde de départ non retirable', 'confirmee'
     WHERE NOT EXISTS (
       SELECT 1 FROM wallet_transactions WHERE user_id = $1 AND type = 'bonus'
     )`,
    [userId]
  );
};

const getMyWallet = async (req, res) => {
  try {
    await ensureWalletForUser(req.user.id);

    const [wallet, transactions] = await Promise.all([
      pool.query('SELECT * FROM wallet_accounts WHERE user_id = $1', [req.user.id]),
      pool.query(
        `SELECT id, type, amount, currency_code, note, status, created_at
         FROM wallet_transactions
         WHERE user_id = $1
         ORDER BY created_at DESC
         LIMIT 20`,
        [req.user.id]
      ),
    ]);

    const walletRow = wallet.rows[0] || {
      user_id: req.user.id,
      ...DEFAULT_WALLET,
    };

    res.json({
      wallet: walletRow,
      transactions: transactions.rows,
      supported_currencies: ['USD', 'EUR', 'XOF', 'GBP', 'CAD'],
    });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

module.exports = {
  ensureWalletForUser,
  getMyWallet,
};
