/* ==========================================
   ATIEM - Crypto Trading Platform
   Full-Stack Next.js + PostgreSQL
   ========================================== */

// 📄 File: package.json
{
  "name": "atiem-crypto",
  "version": "1.0.0",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "db:migrate": "node scripts/migrate.js"
  },
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "pg": "^8.11.0",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.1.0",
    "speakeasy": "^2.0.0",
    "qrcode": "^1.5.3",
    "axios": "^1.6.0",
    "tailwindcss": "^3.3.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0"
  }
}

// 📄 File: .env.local
DATABASE_URL="postgresql://user:password@localhost:5432/atiem"
JWT_SECRET="your_super_secret_jwt_key_change_in_production"
JWT_EXPIRES_IN="7d"

BLOCKCHAIN_API_KEY="your_etherscan_api_key"
BLOCKCHAIR_API_KEY="your_blockchair_api_key"

NEXT_PUBLIC_API_URL="http://localhost:3000"
NEXT_PUBLIC_COMPANY_NAME="Atiem"
NEXT_PUBLIC_CONTACT_EMAIL="brav3mar1@gmail.com"
NEXT_PUBLIC_CONTACT_PHONE="+۹۸۹۱۵۰۳۲۱۸۲۰"

// 📄 File: lib/db.js
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

module.exports = pool;

// 📄 File: scripts/migrate.js (Database Schema)
const pool = require('../lib/db');

const schema = `
-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  kyc_status VARCHAR(50) DEFAULT 'pending', -- pending, verified, rejected
  two_fa_enabled BOOLEAN DEFAULT FALSE,
  two_fa_secret VARCHAR(255),
  membership_tier VARCHAR(50) DEFAULT 'bronze', -- bronze, silver, gold, diamond
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Wallets Table
CREATE TABLE IF NOT EXISTS wallets (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  currency VARCHAR(50) NOT NULL, -- BTC, ETH, USDT, TON, TRX
  wallet_address VARCHAR(255) NOT NULL,
  balance DECIMAL(20, 8) DEFAULT 0,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, currency)
);

-- Transactions Table
CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  wallet_id INTEGER NOT NULL REFERENCES wallets(id),
  transaction_type VARCHAR(50) NOT NULL, -- deposit, withdrawal, plan_purchase
  currency VARCHAR(50) NOT NULL,
  amount DECIMAL(20, 8) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending', -- pending, confirmed, failed
  blockchain_hash VARCHAR(255),
  confirmations INTEGER DEFAULT 0,
  fee DECIMAL(20, 8),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Membership Plans Table
CREATE TABLE IF NOT EXISTS plans (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL, -- برنزی, نقره‌ای, طلایی, الماسی
  tier VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  price_usd DECIMAL(10, 2) NOT NULL,
  price_irr DECIMAL(15, 2) NOT NULL,
  max_trades_per_month INTEGER,
  max_mining_pools INTEGER,
  support_level VARCHAR(50), -- basic, standard, premium
  fee_discount DECIMAL(5, 2) DEFAULT 0, -- percentage discount
  features JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Subscriptions Table
CREATE TABLE IF NOT EXISTS subscriptions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_id INTEGER NOT NULL REFERENCES plans(id),
  status VARCHAR(50) DEFAULT 'active', -- active, expired, cancelled
  start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  end_date TIMESTAMP,
  auto_renew BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Mining Pools Table
CREATE TABLE IF NOT EXISTS mining_pools (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  duration VARCHAR(50) NOT NULL, -- daily, weekly, monthly, 6months, yearly
  amount DECIMAL(20, 8) NOT NULL,
  currency VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'active', -- active, completed, cancelled
  daily_return DECIMAL(10, 8),
  total_return DECIMAL(20, 8) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Blockchain Monitoring Table
CREATE TABLE IF NOT EXISTS blockchain_monitoring (
  id SERIAL PRIMARY KEY,
  wallet_id INTEGER NOT NULL REFERENCES wallets(id),
  currency VARCHAR(50) NOT NULL,
  address VARCHAR(255) NOT NULL,
  last_checked TIMESTAMP,
  status VARCHAR(50) DEFAULT 'active', -- active, paused
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indices for Performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_mining_pools_user_id ON mining_pools(user_id);
`;

async function migrate() {
  try {
    await pool.query(schema);
    console.log('✅ Database migrated successfully');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  }
}

migrate();

// 📄 File: lib/auth.js (Authentication Utilities)
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const speakeasy = require('speakeasy');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;

// Hash Password
async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

// Compare Passwords
async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

// Generate JWT Token
function generateToken(userId, email) {
  return jwt.sign(
    { userId, email },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

// Verify JWT Token
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

// Generate 2FA Secret
function generate2FASecret(email) {
  return speakeasy.generateSecret({
    name: `Atiem (${email})`,
    issuer: 'Atiem',
    length: 32
  });
}

// Verify 2FA Token
function verify2FAToken(secret, token) {
  return speakeasy.totp.verify({
    secret: secret,
    encoding: 'base32',
    token: token,
    window: 2
  });
}

module.exports = {
  hashPassword,
  comparePassword,
  generateToken,
  verifyToken,
  generate2FASecret,
  verify2FAToken
};

// 📄 File: lib/blockchain.js (Blockchain Monitoring)
const axios = require('axios');

// Monitor Bitcoin Transaction
async function monitorBTC(address) {
  try {
    const response = await axios.get(`https://blockchain.info/q/addressbalance/${address}`);
    return { balance: response.data / 1e8 }; // Convert to BTC
  } catch (err) {
    console.error('BTC monitoring error:', err);
    return null;
  }
}

// Monitor Ethereum Transaction
async function monitorETH(address) {
  try {
    const response = await axios.get(
      `https://api.etherscan.io/api?module=account&action=balance&address=${address}&apikey=${process.env.BLOCKCHAIN_API_KEY}`
    );
    if (response.data.status === '1') {
      return { balance: parseInt(response.data.result) / 1e18 }; // Convert to ETH
    }
  } catch (err) {
    console.error('ETH monitoring error:', err);
  }
  return null;
}

// Monitor Tron Transaction
async function monitorTRX(address) {
  try {
    const response = await axios.get(`https://api.trongrid.io/v1/accounts/${address}`);
    if (response.data.data && response.data.data.length > 0) {
      return { balance: response.data.data[0].balance / 1e6 }; // Convert to TRX
    }
  } catch (err) {
    console.error('TRX monitoring error:', err);
  }
  return null;
}

// Monitor TON
async function monitorTON(address) {
  try {
    const response = await axios.get(`https://tonapi.io/v2/accounts/${address}`);
    return { balance: response.data.balance / 1e9 }; // Convert to TON
  } catch (err) {
    console.error('TON monitoring error:', err);
  }
  return null;
}

module.exports = {
  monitorBTC,
  monitorETH,
  monitorTRX,
  monitorTON
};