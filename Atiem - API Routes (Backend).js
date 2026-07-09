/* ==========================================
   API ROUTES - Backend Logic
   ========================================== */

// 📄 File: pages/api/auth/register.js
import pool from '../../../lib/db';
import { hashPassword, generateToken } from '../../../lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { email, phone, password, firstName, lastName } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // Check if user exists
    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const result = await pool.query(
      `INSERT INTO users (email, phone, password_hash, first_name, last_name, membership_tier)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, email, membership_tier`,
      [email, phone, passwordHash, firstName, lastName, 'bronze']
    );

    const user = result.rows[0];
    const token = generateToken(user.id, user.email);

    // Create default wallets
    const currencies = ['BTC', 'ETH', 'USDT', 'TON', 'TRX'];
    const walletAddresses = {
      BTC: '164JCo3JP4toJPKrERE9SbTNFHP9Pcr7xU',
      ETH: '0x9c49e28c6bd4f23e044f09fbee6f58863baf1f5e',
      USDT: 'TLEZ5G7wH3fvYiAVUfMuC9AUPBNwScBvGF',
      TON: 'UQDTOndTARXS8avLVwmpf08oGJ8L8Hck-IVuacGNpF8JDBML',
      TRX: 'TLEZ5G7wH3fvYiAVUfMuC9AUPBNwScBvGF'
    };

    for (const currency of currencies) {
      await pool.query(
        'INSERT INTO wallets (user_id, currency, wallet_address) VALUES ($1, $2, $3)',
        [user.id, currency, walletAddresses[currency]]
      );
    }

    res.status(201).json({
      message: 'User registered successfully',
      user: { id: user.id, email: user.email, tier: user.membership_tier },
      token
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// 📄 File: pages/api/auth/login.js
import pool from '../../../lib/db';
import { comparePassword, generateToken } from '../../../lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // Find user
    const result = await pool.query(
      'SELECT id, email, password_hash, membership_tier, two_fa_enabled FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];
    const passwordMatch = await comparePassword(password, user.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (user.two_fa_enabled) {
      return res.status(200).json({
        message: 'Enter 2FA code',
        requiresTwoFA: true,
        userId: user.id
      });
    }

    const token = generateToken(user.id, user.email);

    res.status(200).json({
      message: 'Login successful',
      user: { id: user.id, email: user.email, tier: user.membership_tier },
      token
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// 📄 File: pages/api/auth/setup-2fa.js
import pool from '../../../lib/db';
import { generate2FASecret } from '../../../lib/auth';
import qrcode from 'qrcode';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { userId } = req.body;

    const user = await pool.query('SELECT email FROM users WHERE id = $1', [userId]);
    if (user.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const secret = generate2FASecret(user.rows[0].email);
    const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url);

    res.status(200).json({
      secret: secret.base32,
      qrCode: qrCodeUrl,
      message: 'Scan QR code with Google Authenticator'
    });
  } catch (err) {
    console.error('2FA setup error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// 📄 File: pages/api/auth/verify-2fa.js
import pool from '../../../lib/db';
import { verify2FAToken, generateToken } from '../../../lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { userId, token, secret } = req.body;

    const isValid = verify2FAToken(secret, token);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid 2FA code' });
    }

    // Enable 2FA
    const user = await pool.query(
      'UPDATE users SET two_fa_enabled = TRUE, two_fa_secret = $1 WHERE id = $2 RETURNING id, email, membership_tier',
      [secret, userId]
    );

    const jwtToken = generateToken(user.rows[0].id, user.rows[0].email);

    res.status(200).json({
      message: '2FA enabled successfully',
      token: jwtToken
    });
  } catch (err) {
    console.error('2FA verify error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// 📄 File: pages/api/dashboard/user.js
import pool from '../../../lib/db';
import { verifyToken } from '../../../lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    const decoded = verifyToken(token);
    if (!decoded) return res.status(401).json({ error: 'Invalid token' });

    // Get user data
    const user = await pool.query(
      'SELECT id, email, first_name, last_name, membership_tier, kyc_status FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (user.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get wallets
    const wallets = await pool.query(
      'SELECT id, currency, wallet_address, balance FROM wallets WHERE user_id = $1',
      [decoded.userId]
    );

    // Get active subscription
    const subscription = await pool.query(
      `SELECT p.name, p.tier, s.start_date, s.end_date, s.auto_renew
       FROM subscriptions s
       JOIN plans p ON s.plan_id = p.id
       WHERE s.user_id = $1 AND s.status = 'active'
       ORDER BY s.start_date DESC LIMIT 1`,
      [decoded.userId]
    );

    res.status(200).json({
      user: user.rows[0],
      wallets: wallets.rows,
      subscription: subscription.rows[0] || null
    });
  } catch (err) {
    console.error('Get user error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// 📄 File: pages/api/plans/list.js
import pool from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const plans = await pool.query(
      'SELECT id, name, tier, description, price_usd, price_irr, max_trades_per_month, max_mining_pools, support_level, fee_discount FROM plans ORDER BY price_usd ASC'
    );

    res.status(200).json(plans.rows);
  } catch (err) {
    console.error('Get plans error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// 📄 File: pages/api/transactions/create.js
import pool from '../../../lib/db';
import { verifyToken } from '../../../lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    const decoded = verifyToken(token);
    if (!decoded) return res.status(401).json({ error: 'Invalid token' });

    const { walletId, transactionType, currency, amount } = req.body;

    const transaction = await pool.query(
      `INSERT INTO transactions (user_id, wallet_id, transaction_type, currency, amount, status)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, status, created_at`,
      [decoded.userId, walletId, transactionType, currency, amount, 'pending']
    );

    res.status(201).json({
      message: 'Transaction created',
      transaction: transaction.rows[0]
    });
  } catch (err) {
    console.error('Create transaction error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// 📄 File: pages/api/transactions/history.js
import pool from '../../../lib/db';
import { verifyToken } from '../../../lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    const decoded = verifyToken(token);
    if (!decoded) return res.status(401).json({ error: 'Invalid token' });

    const transactions = await pool.query(
      `SELECT id, transaction_type, currency, amount, status, blockchain_hash, confirmations, created_at
       FROM transactions
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 50`,
      [decoded.userId]
    );

    res.status(200).json(transactions.rows);
  } catch (err) {
    console.error('Get transactions error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// 📄 File: pages/api/mining/create-pool.js
import pool from '../../../lib/db';
import { verifyToken } from '../../../lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    const decoded = verifyToken(token);
    if (!decoded) return res.status(401).json({ error: 'Invalid token' });

    const { name, duration, amount, currency } = req.body;

    const pool_query = await pool.query(
      `INSERT INTO mining_pools (user_id, name, duration, amount, currency, daily_return)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, name, duration, amount, currency, daily_return`,
      [decoded.userId, name, duration, amount, currency, (amount * 0.001).toFixed(8)]
    );

    res.status(201).json({
      message: 'Mining pool created',
      pool: pool_query.rows[0]
    });
  } catch (err) {
    console.error('Create mining pool error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// 📄 File: pages/api/webhook/blockchain-update.js
import pool from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { walletId, currency, newBalance, blockchainHash, confirmations } = req.body;

    // Update wallet balance
    await pool.query(
      'UPDATE wallets SET balance = $1 WHERE id = $2',
      [newBalance, walletId]
    );

    // Update transaction status if needed
    if (blockchainHash) {
      await pool.query(
        'UPDATE transactions SET status = $1, confirmations = $2 WHERE blockchain_hash = $3 AND status = $4',
        [confirmations >= 3 ? 'confirmed' : 'pending', confirmations, blockchainHash, 'pending']
      );
    }

    res.status(200).json({ message: 'Blockchain update processed' });
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}