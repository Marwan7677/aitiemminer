/* ==========================================
   DASHBOARD PAGES - User Panel
   ========================================== */

// 📄 File: pages/dashboard/index.js (Dashboard Main)
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const mockChartData = [
  { name: 'شنبه', value: 4000 },
  { name: 'یکشنبه', value: 3000 },
  { name: 'دوشنبه', value: 5000 },
  { name: 'سه‌شنبه', value: 4500 },
  { name: 'چهارشنبه', value: 6000 },
  { name: 'پنج‌شنبه', value: 5500 },
  { name: 'جمعه', value: 7000 }
];

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalBalance, setTotalBalance] = useState(0);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }

        const res = await fetch('/api/dashboard/user', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!res.ok) throw new Error('Failed to fetch user');

        const data = await res.json();
        setUser(data.user);
        setWallets(data.wallets);
        const total = data.wallets.reduce((sum, w) => sum + parseFloat(w.balance || 0), 0);
        setTotalBalance(total);
      } catch (err) {
        console.error('Error:', err);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) return <div className="flex items-center justify-center min-h-screen">درحال بارگذاری...</div>;

  const tierColors = {
    bronze: 'from-orange-500 to-yellow-600',
    silver: 'from-gray-400 to-gray-600',
    gold: 'from-yellow-400 to-yellow-600',
    diamond: 'from-blue-400 to-cyan-400'
  };

  const tierNames = {
    bronze: 'پلن برنزی',
    silver: 'پلن نقره‌ای',
    gold: 'پلن طلایی',
    diamond: 'پلن الماسی'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black text-white pt-20 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-10">
          <div>
            <h1 className="text-4xl font-bold mb-2">خوش آمدید، {user?.first_name}</h1>
            <p className="text-gray-400">داشبورد شخصی Atiem</p>
          </div>
          <button
            onClick={() => {
              localStorage.removeItem('token');
              router.push('/');
            }}
            className="px-6 py-2 bg-red-600 rounded-lg hover:bg-red-700 transition"
          >
            خروج
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <div className={`p-6 bg-gradient-to-br ${tierColors[user?.membership_tier]} rounded-xl border border-white/20`}>
            <p className="text-sm text-gray-200 mb-2">سطح عضویت</p>
            <h3 className="text-2xl font-bold">{tierNames[user?.membership_tier]}</h3>
          </div>
          <div className="p-6 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl border border-white/20">
            <p className="text-sm text-gray-200 mb-2">موجودی کل</p>
            <h3 className="text-2xl font-bold">${totalBalance.toFixed(2)}</h3>
          </div>
          <div className="p-6 bg-gradient-to-br from-green-600 to-green-700 rounded-xl border border-white/20">
            <p className="text-sm text-gray-200 mb-2">معاملات ماه</p>
            <h3 className="text-2xl font-bold">۱۲</h3>
          </div>
          <div className="p-6 bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl border border-white/20">
            <p className="text-sm text-gray-200 mb-2">درآمد امروز</p>
            <h3 className="text-2xl font-bold">$۲۴.۵</h3>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          {/* Wallets */}
          <div className="lg:col-span-2 bg-slate-800 border border-slate-700 rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">کیف پول‌های من</h2>
              <Link href="/dashboard/wallet" className="text-blue-400 hover:text-blue-300">
                مشاهده همه →
              </Link>
            </div>
            <div className="space-y-3">
              {wallets.map((wallet) => (
                <div key={wallet.id} className="p-4 bg-slate-700 rounded-lg flex justify-between items-center">
                  <div>
                    <h4 className="font-bold">{wallet.currency}</h4>
                    <p className="text-xs text-gray-400 break-all">{wallet.wallet_address}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{wallet.balance}</p>
                    <p className="text-xs text-gray-400">{wallet.currency}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <h2 className="text-xl font-bold mb-6">عملیات سریع</h2>
            <div className="space-y-3">
              <Link
                href="/dashboard/deposit"
                className="block p-4 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg text-center font-bold hover:shadow-lg hover:shadow-blue-500/50 transition"
              >
                💰 واریز
              </Link>
              <Link
                href="/dashboard/withdraw"
                className="block p-4 bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg text-center font-bold hover:shadow-lg hover:shadow-purple-500/50 transition"
              >
                💸 برداشت
              </Link>
              <Link
                href="/dashboard/mining"
                className="block p-4 bg-gradient-to-r from-orange-600 to-orange-700 rounded-lg text-center font-bold hover:shadow-lg hover:shadow-orange-500/50 transition"
              >
                ⛏️ استخر ماینینگ
              </Link>
              <Link
                href="/dashboard/settings"
                className="block p-4 bg-gradient-to-r from-gray-600 to-gray-700 rounded-lg text-center font-bold hover:shadow-lg transition"
              >
                ⚙️ تنظیمات
              </Link>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <h3 className="text-xl font-bold mb-4">روند درآمد</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={mockChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
                <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <h3 className="text-xl font-bold mb-4">توزیع کیف پول</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={mockChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
                <Bar dataKey="value" fill="#a855f7" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

// 📄 File: pages/dashboard/wallet.js (Wallet Management)
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function Wallet() {
  const router = useRouter();
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWallets = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }

        const res = await fetch('/api/dashboard/user', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!res.ok) throw new Error('Failed');
        const data = await res.json();
        setWallets(data.wallets);
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWallets();
  }, []);

  const cryptocurrencies = [
    { symbol: 'BTC', name: 'Bitcoin', color: 'from-orange-500 to-yellow-500', icon: '₿' },
    { symbol: 'ETH', name: 'Ethereum', color: 'from-blue-500 to-purple-500', icon: 'Ξ' },
    { symbol: 'USDT', name: 'Tether', color: 'from-green-500 to-cyan-500', icon: '₮' },
    { symbol: 'TON', name: 'TON Coin', color: 'from-blue-600 to-blue-700', icon: '◈' },
    { symbol: 'TRX', name: 'Tron', color: 'from-red-500 to-pink-500', icon: '▲' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black text-white pt-20 pb-20">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-4xl font-bold">کیف پول‌های من</h1>
          <Link href="/dashboard" className="text-blue-400 hover:text-blue-300">
            ← بازگشت
          </Link>
        </div>

        {loading ? (
          <p className="text-center text-gray-400">درحال بارگذاری...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wallets.map((wallet) => {
              const crypto = cryptocurrencies.find(c => c.symbol === wallet.currency);
              return (
                <div key={wallet.id} className={`p-6 bg-gradient-to-br ${crypto?.color} rounded-xl border border-white/20`}>
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-2xl font-bold">{crypto?.name}</h3>
                      <p className="text-sm text-white/70">{crypto?.symbol}</p>
                    </div>
                    <span className="text-4xl">{crypto?.icon}</span>
                  </div>

                  <div className="mb-6 p-4 bg-black/30 rounded-lg">
                    <p className="text-xs text-white/70 mb-1">آدرس کیف پول</p>
                    <p className="text-xs break-all font-mono">{wallet.wallet_address}</p>
                  </div>

                  <div className="mb-6">
                    <p className="text-sm text-white/70 mb-1">موجودی</p>
                    <h4 className="text-3xl font-bold">{wallet.balance}</h4>
                    <p className="text-sm text-white/70">{wallet.currency}</p>
                  </div>

                  <div className="flex gap-2">
                    <button className="flex-1 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition font-bold text-sm">
                      واریز
                    </button>
                    <button className="flex-1 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition font-bold text-sm">
                      برداشت
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// 📄 File: pages/dashboard/transactions.js (Transaction History)
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function Transactions() {
  const router = useRouter();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }

        const res = await fetch('/api/transactions/history', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!res.ok) throw new Error('Failed');
        const data = await res.json();
        setTransactions(data);
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-500/20 text-green-300';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-300';
      case 'failed':
        return 'bg-red-500/20 text-red-300';
      default:
        return 'bg-gray-500/20 text-gray-300';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'deposit':
        return '📥';
      case 'withdrawal':
        return '📤';
      case 'plan_purchase':
        return '🛍️';
      default:
        return '💱';
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'deposit':
        return 'واریز';
      case 'withdrawal':
        return 'برداشت';
      case 'plan_purchase':
        return 'خرید پلن';
      default:
        return 'معامله';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black text-white pt-20 pb-20">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-4xl font-bold">تاریخچه تراکنش‌ها</h1>
          <Link href="/dashboard" className="text-blue-400 hover:text-blue-300">
            ← بازگشت
          </Link>
        </div>

        {loading ? (
          <p className="text-center text-gray-400">درحال بارگذاری...</p>
        ) : transactions.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 mb-4">تراکنشی وجود ندارد</p>
            <Link href="/dashboard" className="text-blue-400 hover:text-blue-300">
              برای شروع، واریز کنید
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.map((tx) => (
              <div key={tx.id} className="p-6 bg-slate-800 border border-slate-700 rounded-xl hover:border-blue-500 transition">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-3xl">{getTypeIcon(tx.transaction_type)}</span>
                    <div>
                      <h4 className="font-bold">{getTypeLabel(tx.transaction_type)}</h4>
                      <p className="text-sm text-gray-400">{tx.currency}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-lg">{tx.amount} {tx.currency}</p>
                    <p className="text-sm text-gray-400">
                      {new Date(tx.created_at).toLocaleDateString('fa-IR')}
                    </p>
                  </div>

                  <div>
                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${getStatusColor(tx.status)}`}>
                      {tx.status === 'confirmed' ? '✓ تأیید شده' : tx.status === 'pending' ? '⏳ در انتظار' : '✗ ناموفق'}
                    </span>
                  </div>
                </div>

                {tx.blockchain_hash && (
                  <div className="mt-4 pt-4 border-t border-slate-700">
                    <p className="text-xs text-gray-400 mb-2">Hash تراکنش:</p>
                    <p className="text-xs break-all font-mono text-blue-400">{tx.blockchain_hash}</p>
                    <p className="text-xs text-gray-400 mt-2">تأیید‌ها: {tx.confirmations}/3</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// 📄 File: pages/dashboard/deposit.js (Deposit Page)
import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function Deposit() {
  const router = useRouter();
  const [selectedCurrency, setSelectedCurrency] = useState('BTC');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('direct');

  const currencies = [
    { code: 'BTC', name: 'Bitcoin', address: '164JCo3JP4toJPKrERE9SbTNFHP9Pcr7xU', icon: '₿' },
    { code: 'ETH', name: 'Ethereum', address: '0x9c49e28c6bd4f23e044f09fbee6f58863baf1f5e', icon: 'Ξ' },
    { code: 'USDT', name: 'Tether', address: 'TLEZ5G7wH3fvYiAVUfMuC9AUPBNwScBvGF', icon: '₮' },
    { code: 'TON', name: 'TON Coin', address: 'UQDTOndTARXS8avLVwmpf08oGJ8L8Hck-IVuacGNpF8JDBML', icon: '◈' },
    { code: 'TRX', name: 'Tron', address: 'TLEZ5G7wH3fvYiAVUfMuC9AUPBNwScBvGF', icon: '▲' }
  ];

  const selectedCurrencyData = currencies.find(c => c.code === selectedCurrency);

  const handleDeposit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert('مبلغ معتبر وارد کنید');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/transactions/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          walletId: 1,
          transactionType: 'deposit',
          currency: selectedCurrency,
          amount: parseFloat(amount)
        })
      });

      if (!res.ok) throw new Error('Failed');
      alert('درخواست واریز ثبت شد');
      setAmount('');
    } catch (err) {
      alert('خطا: ' + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black text-white pt-20 pb-20">
      <div className="max-w-2xl mx-auto px-6">
        <Link href="/dashboard" className="text-blue-400 hover:text-blue-300 mb-6 inline-block">
          ← بازگشت
        </Link>

        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8">
          <h1 className="text-3xl font-bold mb-8">واریز وجه</h1>

          {/* Currency Selection */}
          <div className="mb-8">
            <label className="block text-sm font-bold mb-4">انتخاب ارز:</label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {currencies.map((curr) => (
                <button
                  key={curr.code}
                  onClick={() => setSelectedCurrency(curr.code)}
                  className={`p-4 rounded-lg border-2 transition ${
                    selectedCurrency === curr.code
                      ? 'border-blue-500 bg-blue-500/20'
                      : 'border-slate-600 hover:border-slate-500'
                  }`}
                >
                  <div className="text-2xl mb-2">{curr.icon}</div>
                  <p className="font-bold text-sm">{curr.code}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Amount Input */}
          <div className="mb-8">
            <label className="block text-sm font-bold mb-2">مبلغ:</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="مبلغ را وارد کنید"
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:border-blue-500 outline-none text-lg"
            />
          </div>

          {/* Wallet Address */}
          <div className="mb-8 p-6 bg-slate-700 rounded-xl">
            <p className="text-sm text-gray-400 mb-2">آدرس کیف پول برای واریز:</p>
            <p className="font-mono text-sm break-all">{selectedCurrencyData?.address}</p>
            <button
              onClick={() => navigator.clipboard.writeText(selectedCurrencyData?.address)}
              className="mt-4 px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition text-sm"
            >
              کپی کردن آدرس
            </button>
          </div>

          {/* QR Code (Mock) */}
          <div className="mb-8 p-6 bg-slate-700 rounded-xl text-center">
            <p className="text-sm text-gray-400 mb-4">کد QR برای اسکن:</p>
            <div className="w-64 h-64 bg-white rounded-lg mx-auto flex items-center justify-center">
              <p className="text-gray-400">[QR Code]</p>
            </div>
          </div>

          {/* Instructions */}
          <div className="mb-8 p-6 bg-yellow-900/20 border border-yellow-600/30 rounded-xl">
            <h3 className="font-bold mb-3">نحوه واریز:</h3>
            <ol className="space-y-2 text-sm text-gray-300">
              <li>۱. آدرس بالا را کپی کنید یا QR را اسکن کنید</li>
              <li>۲. از کیف پول خود {selectedCurrency} بفرستید</li>
              <li>۳. پس از تایید شبکه، وجه اضافه خواهد شد</li>
              <li>۴. معمولاً ۱۰-۳۰ دقیقه طول می‌کشد</li>
            </ol>
          </div>

          <button
            onClick={handleDeposit}
            className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg font-bold hover:shadow-lg transition"
          >
            ثبت درخواست واریز
          </button>
        </div>
      </div>
    </div>
  );
}

// 📄 File: pages/dashboard/mining.js (Mining Pools)
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function Mining() {
  const router = useRouter();
  const [activePools, setActivePools] = useState([]);
  const [selectedDuration, setSelectedDuration] = useState('daily');
  const [selectedAmount, setSelectedAmount] = useState('100');
  const [selectedCurrency, setSelectedCurrency] = useState('BTC');

  const durations = [
    { value: 'daily', label: 'روزانه', days: 1, returnRate: 0.5 },
    { value: 'weekly', label: 'هفتگی', days: 7, returnRate: 3.8 },
    { value: 'monthly', label: 'ماهانه', days: 30, returnRate: 15.5 },
    { value: '6months', label: '۶ ماهه', days: 180, returnRate: 100 },
    { value: 'yearly', label: 'سالانه', days: 365, returnRate: 220 }
  ];

  const selectedPlan = durations.find(d => d.value === selectedDuration);
  const calculatedReturn = (parseFloat(selectedAmount) * selectedPlan.returnRate) / 100;

  const handleCreatePool = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/mining/create-pool', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: `استخر ${selectedPlan.label} - ${selectedAmount} ${selectedCurrency}`,
          duration: selectedDuration,
          amount: parseFloat(selectedAmount),
          currency: selectedCurrency
        })
      });

      if (!res.ok) throw new Error('Failed');
      alert('استخر ماینینگ ایجاد شد');
      setSelectedAmount('100');
    } catch (err) {
      alert('خطا: ' + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black text-white pt-20 pb-20">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-4xl font-bold">استخرهای ماینینگ</h1>
          <Link href="/dashboard" className="text-blue-400 hover:text-blue-300">
            ← بازگشت
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Create Pool */}
          <div className="lg:col-span-1 bg-slate-800 border border-slate-700 rounded-xl p-6 h-fit">
            <h2 className="text-xl font-bold mb-6">استخر جدید</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2">مدت‌زمان:</label>
                <select
                  value={selectedDuration}
                  onChange={(e) => setSelectedDuration(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:border-blue-500 outline-none"
                >
                  {durations.map(d => (
                    <option key={d.value} value={d.value}>{d.label} ({d.returnRate}%)</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">ارز:</label>
                <select
                  value={selectedCurrency}
                  onChange={(e) => setSelectedCurrency(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:border-blue-500 outline-none"
                >
                  <option value="BTC">Bitcoin</option>
                  <option value="ETH">Ethereum</option>
                  <option value="USDT">Tether</option>
                  <option value="TON">TON Coin</option>
                  <option value="TRX">Tron</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">مبلغ:</label>
                <input
                  type="number"
                  value={selectedAmount}
                  onChange={(e) => setSelectedAmount(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:border-blue-500 outline-none"
                />
              </div>

              <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 p-4 rounded-lg border border-purple-500/30">
                <p className="text-xs text-gray-300 mb-2">برآورد سود:</p>
                <h3 className="text-2xl font-bold">${calculatedReturn.toFixed(2)}</h3>
                <p className="text-xs text-gray-400 mt-2">در طول {selectedPlan.days} روز</p>
              </div>

              <button
                onClick={handleCreatePool}
                className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg font-bold hover:shadow-lg transition"
              >
                شروع ماینینگ
              </button>
            </div>
          </div>

          {/* Active Pools */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-bold">استخرهای فعال:</h2>
            {activePools.length === 0 ? (
              <div className="p-8 bg-slate-800 border border-slate-700 rounded-xl text-center">
                <p className="text-gray-400">هنوز استخر فعالی ندارید</p>
              </div>
            ) : (
              activePools.map((pool) => (
                <div key={pool.id} className="p-6 bg-slate-800 border border-slate-700 rounded-xl">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-lg">{pool.name}</h3>
                      <p className="text-sm text-gray-400">شروع: {new Date(pool.created_at).toLocaleDateString('fa-IR')}</p>
                    </div>
                    <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm font-bold">
                      فعال
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-gray-400">مبلغ</p>
                      <p className="font-bold">{pool.amount} {pool.currency}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">سود روزانه</p>
                      <p className="font-bold text-green-400">${pool.daily_return}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">سود کل</p>
                      <p className="font-bold text-blue-400">${pool.total_return}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// 📄 File: pages/dashboard/settings.js (User Settings)
import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function Settings() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [twoFACode, setTwoFACode] = useState('');
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    transactions: true,
    deposits: true
  });

  const handleNotificationChange = (key) => {
    setNotifications({ ...notifications, [key]: !notifications[key] });
  };

  const handleEnable2FA = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/auth/setup-2fa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) throw new Error('Failed');
      alert('۲FA فعال شد');
    } catch (err) {
      alert('خطا: ' + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black text-white pt-20 pb-20">
      <div className="max-w-4xl mx-auto px-6">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-4xl font-bold">تنظیمات</h1>
          <Link href="/dashboard" className="text-blue-400 hover:text-blue-300">
            ← بازگشت
          </Link>
        </div>

        <div className="space-y-6">
          {/* Security Section */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-8">
            <h2 className="text-2xl font-bold mb-6">🔒 امنیت</h2>
            <div className="space-y-6">
              <div className="p-6 bg-slate-700 rounded-lg">
                <h3 className="font-bold mb-2">تأیید دو مرحله‌ای (2FA)</h3>
                <p className="text-gray-400 mb-4">امنیت حساب خود را افزایش دهید</p>
                <button
                  onClick={handleEnable2FA}
                  className="px-6 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition"
                >
                  فعال کردن
                </button>
              </div>

              <div className="p-6 bg-slate-700 rounded-lg">
                <h3 className="font-bold mb-2">تغییر رمز عبور</h3>
                <div className="space-y-4">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="رمز فعلی"
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg focus:border-blue-500 outline-none"
                  />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="رمز جدید"
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg focus:border-blue-500 outline-none"
                  />
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={showPassword}
                      onChange={() => setShowPassword(!showPassword)}
                    />
                    نمایش رمز
                  </label>
                  <button className="w-full py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition">
                    تغییر رمز
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Notifications Section */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-8">
            <h2 className="text-2xl font-bold mb-6">🔔 اطلاع‌رسانی‌ها</h2>
            <div className="space-y-4">
              {Object.entries(notifications).map(([key, value]) => (
                <label key={key} className="flex items-center gap-3 p-4 bg-slate-700 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={() => handleNotificationChange(key)}
                    className="w-4 h-4"
                  />
                  <span className="flex-1 font-bold">
                    {key === 'email' && 'اطلاع‌های ایمیلی'}
                    {key === 'sms' && 'اطلاع‌های پیامکی'}
                    {key === 'transactions' && 'اطلاع معاملات'}
                    {key === 'deposits' && 'اطلاع واریزها'}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Account Section */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-8">
            <h2 className="text-2xl font-bold mb-6">👤 حساب کاربری</h2>
            <div className="space-y-4">
              <button className="w-full py-3 bg-slate-700 rounded-lg hover:bg-slate-600 transition text-left px-4 font-bold">
                ✏️ ویرایش پروفایل
              </button>
              <button className="w-full py-3 bg-slate-700 rounded-lg hover:bg-slate-600 transition text-left px-4 font-bold">
                🆔 احراز هویت (KYC)
              </button>
              <button className="w-full py-3 bg-red-900/30 text-red-300 rounded-lg hover:bg-red-900/50 transition text-left px-4 font-bold border border-red-600">
                🚪 حذف حساب
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
