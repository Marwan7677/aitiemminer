/* ==========================================
   BLOCKCHAIN MONITORING SERVICE
   ========================================== */

// 📄 File: lib/blockchain-monitor.js (Automatic Monitoring)
const axios = require('axios');
const pool = require('./db');

class BlockchainMonitor {
  constructor() {
    this.monitoringIntervals = {};
  }

  // Monitor Bitcoin Transactions
  async monitorBTC(address) {
    try {
      const response = await axios.get(
        `https://blockchain.info/q/addressbalance/${address}`
      );
      return parseFloat(response.data) / 1e8; // Convert Satoshis to BTC
    } catch (err) {
      console.error('BTC monitoring error:', err.message);
      return null;
    }
  }

  // Monitor Ethereum Transactions
  async monitorETH(address) {
    try {
      const response = await axios.get(
        `https://api.etherscan.io/api?module=account&action=balance&address=${address}&apikey=${process.env.BLOCKCHAIN_API_KEY}`
      );
      
      if (response.data.status === '1') {
        return parseFloat(response.data.result) / 1e18; // Convert Wei to ETH
      }
    } catch (err) {
      console.error('ETH monitoring error:', err.message);
    }
    return null;
  }

  // Monitor USDT (on Tron Network)
  async monitorUSDT(address) {
    try {
      const response = await axios.get(
        `https://api.trongrid.io/v1/accounts/${address}/`
      );
      
      if (response.data.data && response.data.data.length > 0) {
        // USDT Contract on Tron: TR7NHqjeKQxGTCi8q282JLJQ8Led4uf6eT
        const trc20balance = response.data.data[0].trc20?.[0]?.['TR7NHqjeKQxGTCi8q282JLJQ8Led4uf6eT'] || 0;
        return parseFloat(trc20balance) / 1e6; // Convert to USDT
      }
    } catch (err) {
      console.error('USDT monitoring error:', err.message);
    }
    return null;
  }

  // Monitor Tron (TRX)
  async monitorTRX(address) {
    try {
      const response = await axios.get(
        `https://api.trongrid.io/v1/accounts/${address}`
      );
      
      if (response.data.data && response.data.data.length > 0) {
        return response.data.data[0].balance / 1e6; // Convert to TRX
      }
    } catch (err) {
      console.error('TRX monitoring error:', err.message);
    }
    return null;
  }

  // Monitor TON Coin
  async monitorTON(address) {
    try {
      const response = await axios.get(
        `https://tonapi.io/v2/accounts/${address}`
      );
      return response.data.balance / 1e9; // Convert to TON
    } catch (err) {
      console.error('TON monitoring error:', err.message);
    }
    return null;
  }

  // Route monitoring based on currency
  async getBalance(currency, address) {
    switch (currency) {
      case 'BTC':
        return await this.monitorBTC(address);
      case 'ETH':
        return await this.monitorETH(address);
      case 'USDT':
        return await this.monitorUSDT(address);
      case 'TRX':
        return await this.monitorTRX(address);
      case 'TON':
        return await this.monitorTON(address);
      default:
        return null;
    }
  }

  // Update wallet balance in database
  async updateWalletBalance(walletId, currency, address) {
    try {
      const newBalance = await this.getBalance(currency, address);
      
      if (newBalance === null) {
        console.log(`Failed to get balance for ${currency}`);
        return false;
      }

      // Get old balance
      const oldBalanceResult = await pool.query(
        'SELECT balance FROM wallets WHERE id = $1',
        [walletId]
      );
      
      const oldBalance = oldBalanceResult.rows[0]?.balance || 0;

      // Update wallet balance
      await pool.query(
        'UPDATE wallets SET balance = $1, is_verified = TRUE WHERE id = $2',
        [newBalance, walletId]
      );

      // If balance changed, check for deposits
      if (parseFloat(newBalance) > parseFloat(oldBalance)) {
        const depositAmount = parseFloat(newBalance) - parseFloat(oldBalance);
        
        // Create deposit transaction
        const walletData = await pool.query(
          'SELECT user_id FROM wallets WHERE id = $1',
          [walletId]
        );
        
        await pool.query(
          `INSERT INTO transactions (user_id, wallet_id, transaction_type, currency, amount, status, confirmations)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [walletData.rows[0].user_id, walletId, 'deposit', currency, depositAmount, 'confirmed', 3]
        );

        console.log(`✅ Deposit detected: ${depositAmount} ${currency}`);
      }

      return true;
    } catch (err) {
      console.error('Update balance error:', err);
      return false;
    }
  }

  // Monitor all active wallets
  async monitorAllWallets() {
    try {
      console.log('🔍 Starting wallet monitoring...');
      
      const wallets = await pool.query(
        `SELECT w.id, w.currency, w.wallet_address, w.user_id 
         FROM wallets w 
         JOIN blockchain_monitoring bm ON w.id = bm.wallet_id 
         WHERE bm.status = $1`,
        ['active']
      );

      for (const wallet of wallets.rows) {
        await this.updateWalletBalance(
          wallet.id,
          wallet.currency,
          wallet.wallet_address
        );
      }

      console.log('✅ Wallet monitoring completed');
    } catch (err) {
      console.error('Wallet monitoring error:', err);
    }
  }

  // Start automatic monitoring (every 30 minutes)
  startMonitoring() {
    console.log('⛓️ Blockchain monitoring started (interval: 30 min)');
    
    // Initial monitoring
    this.monitorAllWallets();

    // Set interval to 30 minutes
    this.monitoringIntervals.main = setInterval(
      () => this.monitorAllWallets(),
      30 * 60 * 1000
    );
  }

  // Stop monitoring
  stopMonitoring() {
    Object.values(this.monitoringIntervals).forEach(interval => {
      clearInterval(interval);
    });
    console.log('⛓️ Blockchain monitoring stopped');
  }
}

module.exports = new BlockchainMonitor();

// 📄 File: pages/api/monitoring/start.js (Start Monitoring)
import blockchainMonitor from '../../../lib/blockchain-monitor';
import pool from '../../../lib/db';

export default async function handler(req, res) {
  // Only allow POST requests with admin token
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check admin authentication (add your admin check here)
    const adminToken = req.headers['x-admin-token'];
    if (!adminToken || adminToken !== process.env.ADMIN_TOKEN) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get all active wallets
    const wallets = await pool.query(
      `SELECT DISTINCT w.id, w.currency, w.wallet_address 
       FROM wallets w`
    );

    // Create monitoring entries for each wallet
    for (const wallet of wallets.rows) {
      await pool.query(
        `INSERT INTO blockchain_monitoring (wallet_id, currency, address, status)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT DO NOTHING`,
        [wallet.id, wallet.currency, wallet.wallet_address, 'active']
      );
    }

    // Start monitoring
    blockchainMonitor.startMonitoring();

    res.status(200).json({
      message: 'Blockchain monitoring started',
      walletsMonitored: wallets.rows.length
    });
  } catch (err) {
    console.error('Start monitoring error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// 📄 File: pages/api/monitoring/check-single.js (Check Single Wallet)
import blockchainMonitor from '../../../lib/blockchain-monitor';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { walletId, currency, address } = req.body;

    if (!currency || !address) {
      return res.status(400).json({ error: 'Currency and address required' });
    }

    const balance = await blockchainMonitor.getBalance(currency, address);

    if (balance === null) {
      return res.status(400).json({ error: 'Failed to get balance' });
    }

    res.status(200).json({
      currency,
      address,
      balance,
      lastChecked: new Date()
    });
  } catch (err) {
    console.error('Check single error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// 📄 File: pages/api/monitoring/status.js (Get Monitoring Status)
import pool from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get all monitored wallets
    const monitored = await pool.query(
      `SELECT COUNT(*) as total, status 
       FROM blockchain_monitoring 
       GROUP BY status`
    );

    // Get recent transactions
    const recentTransactions = await pool.query(
      `SELECT id, currency, amount, status, created_at 
       FROM transactions 
       WHERE status = 'pending' OR status = 'confirmed'
       ORDER BY created_at DESC 
       LIMIT 10`
    );

    res.status(200).json({
      monitoringStatus: monitored.rows,
      recentTransactions: recentTransactions.rows
    });
  } catch (err) {
    console.error('Status error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// 📄 File: server.js (برای اجرای monitoring در background)
const http = require('http');
const blockchainMonitor = require('./lib/blockchain-monitor');

// شروع blockchain monitoring
blockchainMonitor.startMonitoring();

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, stopping monitoring...');
  blockchainMonitor.stopMonitoring();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, stopping monitoring...');
  blockchainMonitor.stopMonitoring();
  process.exit(0);
});

module.exports = blockchainMonitor;

// 📄 File: pages/api/admin/dashboard.js (Admin Panel)
import pool from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check admin authentication
    const adminToken = req.headers['x-admin-token'];
    if (!adminToken || adminToken !== process.env.ADMIN_TOKEN) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Total Users
    const users = await pool.query('SELECT COUNT(*) as count FROM users');
    
    // Total Wallets
    const wallets = await pool.query('SELECT COUNT(*) as count FROM wallets');
    
    // Total Transactions
    const transactions = await pool.query('SELECT COUNT(*) as count FROM transactions');
    
    // Total Volume
    const volume = await pool.query(
      `SELECT SUM(amount) as total FROM transactions WHERE status = 'confirmed'`
    );

    // User Tiers Distribution
    const tiers = await pool.query(
      `SELECT membership_tier, COUNT(*) as count FROM users GROUP BY membership_tier`
    );

    // Pending Transactions
    const pending = await pool.query(
      `SELECT id, currency, amount, created_at FROM transactions WHERE status = 'pending' LIMIT 20`
    );

    res.status(200).json({
      stats: {
        totalUsers: users.rows[0].count,
        totalWallets: wallets.rows[0].count,
        totalTransactions: transactions.rows[0].count,
        totalVolume: volume.rows[0].total || 0
      },
      tiers: tiers.rows,
      pendingTransactions: pending.rows
    });
  } catch (err) {
    console.error('Admin dashboard error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// 📄 File: pages/admin/dashboard.js (Admin Panel UI)
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const adminToken = prompt('Admin Token:');
        if (!adminToken) return;

        const res = await fetch('/api/admin/dashboard', {
          headers: { 'x-admin-token': adminToken }
        });

        if (!res.ok) throw new Error('Failed');
        const data = await res.json();
        setStats(data);
      } catch (err) {
        alert('Error: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <div className="flex items-center justify-center min-h-screen">درحال بارگذاری...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black text-white pt-20 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        <h1 className="text-4xl font-bold mb-10">پنل مدیریت Atiem</h1>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <div className="p-6 bg-slate-800 border border-slate-700 rounded-xl">
            <p className="text-gray-400 mb-2">کل کاربران</p>
            <h3 className="text-3xl font-bold">{stats?.stats.totalUsers}</h3>
          </div>
          <div className="p-6 bg-slate-800 border border-slate-700 rounded-xl">
            <p className="text-gray-400 mb-2">کل کیف‌پول‌ها</p>
            <h3 className="text-3xl font-bold">{stats?.stats.totalWallets}</h3>
          </div>
          <div className="p-6 bg-slate-800 border border-slate-700 rounded-xl">
            <p className="text-gray-400 mb-2">کل تراکنش‌ها</p>
            <h3 className="text-3xl font-bold">{stats?.stats.totalTransactions}</h3>
          </div>
          <div className="p-6 bg-slate-800 border border-slate-700 rounded-xl">
            <p className="text-gray-400 mb-2">کل حجم</p>
            <h3 className="text-3xl font-bold">${stats?.stats.totalVolume.toFixed(2)}</h3>
          </div>
        </div>

        {/* Pending Transactions */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <h2 className="text-2xl font-bold mb-6">تراکنش‌های در انتظار</h2>
          <div className="space-y-4">
            {stats?.pendingTransactions.map((tx) => (
              <div key={tx.id} className="p-4 bg-slate-700 rounded-lg flex justify-between items-center">
                <div>
                  <p className="font-bold">{tx.currency}</p>
                  <p className="text-sm text-gray-400">{new Date(tx.created_at).toLocaleDateString('fa-IR')}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">${tx.amount}</p>
                  <p className="text-sm text-yellow-400">⏳ در انتظار</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}