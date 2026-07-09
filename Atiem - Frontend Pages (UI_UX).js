/* ==========================================
   FRONTEND PAGES - UI/UX Components
   ========================================== */

// 📄 File: pages/_app.js
import '../styles/globals.css';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleStart = () => setIsLoading(true);
    const handleStop = () => setIsLoading(false);
    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleStop);
    return () => {
      router.events.off('routeChangeStart', handleStart);
      router.events.off('routeChangeComplete', handleStop);
    };
  }, [router]);

  const hideNavFooter = ['/login', '/register', '/dashboard'].some(path => router.pathname.startsWith(path));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black text-white">
      {!hideNavFooter && <Navbar />}
      <main className={isLoading ? 'opacity-50' : ''}>
        <Component {...pageProps} />
      </main>
      {!hideNavFooter && <Footer />}
    </div>
  );
}

// 📄 File: pages/index.js (Home Page)
import { useState } from 'react';
import Link from 'next/link';
import { FaBitcoin, FaEthereum, FaRocket, FaShieldAlt, FaChartLine } from 'react-icons/fa';

export default function Home() {
  const [activeTab, setActiveTab] = useState('features');

  const features = [
    { icon: '⚡', title: 'تریدینگ سریع', desc: 'خرید و فروش فوری تمام ارزهای دیجیتالی' },
    { icon: '🛡️', title: 'امنیت بالا', desc: 'محفوظ‌ترین کیف پول‌ها با رمزنگاری 256-bit' },
    { icon: '💰', title: 'کارمزد پایین', desc: 'کمترین کارمزد برای تمام تراکنش‌ها' },
    { icon: '📊', title: 'داشبورد پیشرفته', desc: 'نمودارها و تحلیل‌های بی‌نهایت' },
    { icon: '🎁', title: 'معافیت‌های ویژه', desc: 'جوایز و معافیت برای کاربران مختلف' },
    { icon: '🔔', title: 'پشتیبانی ۲۴/۷', desc: 'پاسخگویی سریع و حرفه‌ای' }
  ];

  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section className="min-h-[600px] flex items-center justify-center px-6 py-20 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
            Atiem
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8">
            پلتفرم کامل تریدینگ و ماینینگ ارزهای دیجیتالی
          </p>
          <p className="text-gray-400 mb-10 max-w-2xl mx-auto">
            خرید و فروش ارزهای دیجیتالی، ماینینگ هوشمند، و استخرهای سود‌آور با بهترین کارمزد
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/register" className="px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl font-bold hover:shadow-lg hover:shadow-blue-500/50 transition">
              ثبت‌نام رایگان
            </Link>
            <Link href="/plans" className="px-8 py-4 border-2 border-purple-500 rounded-xl font-bold hover:bg-purple-500/10 transition">
              مشاهده پلن‌ها
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">ویژگی‌های منحصر به فرد</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <div key={i} className="p-6 bg-gradient-to-br from-slate-700/50 to-slate-800/50 rounded-xl border border-slate-600 hover:border-blue-500 transition">
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                <p className="text-gray-400">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Supported Currencies */}
      <section className="py-20 px-6 bg-gradient-to-r from-blue-900/20 to-purple-900/20">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-12">ارزهای پشتیبانی شده</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {[
              { name: 'Bitcoin', symbol: 'BTC', color: 'from-orange-500 to-yellow-500' },
              { name: 'Ethereum', symbol: 'ETH', color: 'from-blue-500 to-purple-500' },
              { name: 'USDT', symbol: 'USDT', color: 'from-green-500 to-cyan-500' },
              { name: 'TON Coin', symbol: 'TON', color: 'from-blue-600 to-blue-700' },
              { name: 'Tron', symbol: 'TRX', color: 'from-red-500 to-pink-500' }
            ].map((curr, i) => (
              <div key={i} className={`p-6 bg-gradient-to-br ${curr.color} rounded-xl font-bold text-lg`}>
                {curr.symbol}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-blue-600/20 to-purple-600/20 p-10 rounded-2xl border border-purple-500/50 text-center">
          <h2 className="text-3xl font-bold mb-4">امروز شروع کنید</h2>
          <p className="text-gray-400 mb-6">به بیش از ۱۰۰۰۰ کاربر فعال بپیوندید</p>
          <Link href="/register" className="inline-block px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl font-bold hover:shadow-lg hover:shadow-purple-500/50 transition">
            ایجاد حساب کاربری
          </Link>
        </div>
      </section>
    </div>
  );
}

// 📄 File: pages/plans.js (Plans Page)
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

const plans = [
  {
    tier: 'bronze',
    name: 'پلن برنزی',
    priceUSD: 9.99,
    priceIRR: 420000,
    color: 'from-orange-500 to-yellow-600',
    features: [
      'معاملات روزانه: تا ۱۰',
      'استخرهای ماینینگ: تا ۲',
      'پشتیبانی: ایمیلی',
      'کارمزد: ۱.۵٪',
      'داشبورد پایه'
    ]
  },
  {
    tier: 'silver',
    name: 'پلن نقره‌ای',
    priceUSD: 29.99,
    priceIRR: 1260000,
    color: 'from-gray-400 to-gray-600',
    features: [
      'معاملات روزانه: تا ۵۰',
      'استخرهای ماینینگ: تا ۵',
      'پشتیبانی: اولویت',
      'کارمزد: ۱٪',
      'داشبورد پیشرفته',
      'تحلیل‌های بیش‌تر'
    ],
    popular: true
  },
  {
    tier: 'gold',
    name: 'پلن طلایی',
    priceUSD: 79.99,
    priceIRR: 3360000,
    color: 'from-yellow-400 to-yellow-600',
    features: [
      'معاملات روزانه: بی‌محدود',
      'استخرهای ماینینگ: بی‌محدود',
      'پشتیبانی: فوری (چت)',
      'کارمزد: ۰.۵٪',
      'داشبورد اختصاصی',
      'مشاوره متخصص',
      'API دسترسی'
    ]
  },
  {
    tier: 'diamond',
    name: 'پلن الماسی',
    priceUSD: 199.99,
    priceIRR: 8400000,
    color: 'from-blue-400 to-cyan-400',
    features: [
      'معاملات روزانه: بی‌محدود',
      'استخرهای ماینینگ: بی‌محدود',
      'پشتیبانی: ۲۴/۷ اختصاصی',
      'کارمزد: ۰%',
      'داشبورد VIP',
      'مشاور شخصی',
      'API بدون محدودیت',
      'جوایز ماهانه',
      'سفارشی‌سازی کامل'
    ]
  }
];

export default function Plans() {
  const router = useRouter();
  const [currency, setCurrency] = useState('usd');

  const handleSelectPlan = (tier) => {
    router.push(`/register?plan=${tier}`);
  };

  return (
    <div className="pt-20 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
            پلن‌های عضویت
          </h1>
          <p className="text-gray-400 mb-8">پلن مناسب خود را انتخاب کنید</p>
          
          {/* Currency Toggle */}
          <div className="flex gap-2 justify-center mb-6">
            <button
              onClick={() => setCurrency('usd')}
              className={`px-4 py-2 rounded-lg transition ${currency === 'usd' ? 'bg-blue-500' : 'bg-slate-700'}`}
            >
              💵 دلار
            </button>
            <button
              onClick={() => setCurrency('irr')}
              className={`px-4 py-2 rounded-lg transition ${currency === 'irr' ? 'bg-blue-500' : 'bg-slate-700'}`}
            >
              💱 تومان
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.tier}
              className={`relative p-8 rounded-2xl border transition transform hover:scale-105 ${
                plan.popular
                  ? `bg-gradient-to-br ${plan.color} border-white/30 ring-2 ring-yellow-400`
                  : 'bg-slate-800 border-slate-700'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-orange-400 text-black px-4 py-1 rounded-full text-sm font-bold">
                  محبوب‌ترین
                </div>
              )}

              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <div className="mb-6">
                <div className="text-4xl font-bold">
                  {currency === 'usd' ? `$${plan.priceUSD}` : `${plan.priceIRR.toLocaleString('fa-IR')} 🍱`}
                </div>
                <p className="text-sm text-gray-300 mt-2">
                  {currency === 'usd' ? 'بر ماه' : 'بر ماه'}
                </p>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm">
                    <span className="text-lg">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSelectPlan(plan.tier)}
                className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl font-bold hover:shadow-lg transition"
              >
                انتخاب این پلن
              </button>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-center mb-12">سوالات متداول</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-slate-800 rounded-xl border border-slate-700">
              <h4 className="font-bold mb-3">آیا می‌توانم پلن خود را تغییر دهم؟</h4>
              <p className="text-gray-400">بله، می‌توانید هر زمان پلن خود را ارتقا یا تنزل دهید.</p>
            </div>
            <div className="p-6 bg-slate-800 rounded-xl border border-slate-700">
              <h4 className="font-bold mb-3">آیا هزینه پنهانی وجود دارد؟</h4>
              <p className="text-gray-400">خیر، تمام هزینه‌ها در قیمت پلن شامل است.</p>
            </div>
            <div className="p-6 bg-slate-800 rounded-xl border border-slate-700">
              <h4 className="font-bold mb-3">چه مدت طول می‌کشد فعال شدن؟</h4>
              <p className="text-gray-400">فوری‌تر! در کمتر از ۱۰ دقیقه شروع کنید.</p>
            </div>
            <div className="p-6 bg-slate-800 rounded-xl border border-slate-700">
              <h4 className="font-bold mb-3">آیا تضمین بازپرداخت دارید؟</h4>
              <p className="text-gray-400">۳۰ روز تضمین بازپرداخت برای تمام پلن‌ها.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 📄 File: pages/register.js (Registration Page)
import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function Register() {
  const router = useRouter();
  const { plan } = router.query;
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError('رمز عبور مطابقت ندارد');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }

      const data = await res.json();
      localStorage.setItem('token', data.token);
      router.push('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 pt-20">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
            Atiem
          </h1>
          <p className="text-gray-400">حساب کاربری جدید</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-slate-800 border border-slate-700 rounded-2xl p-8 space-y-4">
          {error && (
            <div className="p-4 bg-red-900/30 border border-red-500 rounded-lg text-red-300">
              {error}
            </div>
          )}

          <input
            type="email"
            name="email"
            placeholder="ایمیل"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:border-blue-500 outline-none"
          />

          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              name="firstName"
              placeholder="نام"
              value={formData.firstName}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:border-blue-500 outline-none"
            />
            <input
              type="text"
              name="lastName"
              placeholder="نام خانوادگی"
              value={formData.lastName}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:border-blue-500 outline-none"
            />
          </div>

          <input
            type="tel"
            name="phone"
            placeholder="شماره تماس"
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:border-blue-500 outline-none"
          />

          <input
            type="password"
            name="password"
            placeholder="رمز عبور"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:border-blue-500 outline-none"
          />

          <input
            type="password"
            name="confirmPassword"
            placeholder="تکرار رمز عبور"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:border-blue-500 outline-none"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg font-bold hover:shadow-lg transition disabled:opacity-50"
          >
            {loading ? 'درحال پردازش...' : 'ایجاد حساب'}
          </button>

          <p className="text-center text-gray-400">
            حساب دارید؟{' '}
            <Link href="/login" className="text-blue-400 hover:text-blue-300">
              وارد شوید
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

// 📄 File: pages/login.js (Login Page)
import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function Login() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [twoFACode, setTwoFACode] = useState('');
  const [requiresTwoFA, setRequiresTwoFA] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }

      const data = await res.json();

      if (data.requiresTwoFA) {
        setRequiresTwoFA(true);
        sessionStorage.setItem('userId', data.userId);
        return;
      }

      localStorage.setItem('token', data.token);
      router.push('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 pt-20">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
            Atiem
          </h1>
          <p className="text-gray-400">ورود به حساب</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-slate-800 border border-slate-700 rounded-2xl p-8 space-y-4">
          {error && (
            <div className="p-4 bg-red-900/30 border border-red-500 rounded-lg text-red-300">
              {error}
            </div>
          )}

          {!requiresTwoFA ? (
            <>
              <input
                type="email"
                name="email"
                placeholder="ایمیل"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:border-blue-500 outline-none"
              />
              <input
                type="password"
                name="password"
                placeholder="رمز عبور"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:border-blue-500 outline-none"
              />
            </>
          ) : (
            <input
              type="text"
              placeholder="کد دو مرحله‌ای (6 رقم)"
              value={twoFACode}
              onChange={(e) => setTwoFACode(e.target.value)}
              maxLength="6"
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:border-blue-500 outline-none text-center text-2xl tracking-widest"
            />
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg font-bold hover:shadow-lg transition disabled:opacity-50"
          >
            {loading ? 'درحال پردازش...' : requiresTwoFA ? 'تأیید' : 'ورود'}
          </button>

          <p className="text-center text-gray-400">
            حساب ندارید؟{' '}
            <Link href="/register" className="text-blue-400 hover:text-blue-300">
              ثبت‌نام کنید
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

// 📄 File: pages/about.js (About Page)
export default function About() {
  return (
    <div className="pt-20 pb-20">
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="text-5xl font-bold mb-10 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
          درباره ما
        </h1>

        <div className="space-y-8 text-gray-300">
          <section>
            <h2 className="text-2xl font-bold mb-4 text-white">Atiem چیست؟</h2>
            <p>
              Atiem یک پلتفرم جامع تریدینگ و ماینینگ ارزهای دیجیتالی است که برای کاربران ایرانی و جهانی طراحی شده است.
              ما تلاش می‌کنیم خدمات بهترین کیفیت را با کمترین کارمزد فراهم کنیم.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-white">خدمات ما</h2>
            <ul className="space-y-3">
              <li>✓ خرید و فروش فوری ارزهای دیجیتالی</li>
              <li>✓ استخرهای ماینینگ روزانه، هفتگی، ماهانه و سالانه</li>
              <li>✓ پلن‌های عضویت مختلف برای تمام سطح‌ها</li>
              <li>✓ داشبورد پیشرفته با نمودارهای بی‌نهایت</li>
              <li>✓ پشتیبانی ۲۴/۷ برای تمام کاربران</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-white">چرا Atiem؟</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-slate-800 rounded-lg">
                <h4 className="font-bold mb-2">امنیت</h4>
                <p>تمام تراکنش‌ها با رمزنگاری 256-bit محافظت می‌شوند</p>
              </div>
              <div className="p-4 bg-slate-800 rounded-lg">
                <h4 className="font-bold mb-2">سرعت</h4>
                <p>معاملات فوری تر از بقیه پلتفرم‌ها</p>
              </div>
              <div className="p-4 bg-slate-800 rounded-lg">
                <h4 className="font-bold mb-2">کارمزد پایین</h4>
                <p>کمترین کارمزد در صنعت</p>
              </div>
              <div className="p-4 bg-slate-800 rounded-lg">
                <h4 className="font-bold mb-2">پشتیبانی</h4>
                <p>تیم متخصص برای کمک ۲۴/۷</p>
              </div>
            </div>
          </section>

          <section className="bg-slate-800 p-8 rounded-xl border border-slate-700">
            <h2 className="text-2xl font-bold mb-4">تماس با ما</h2>
            <div className="space-y-3">
              <p><strong>ایمیل:</strong> <a href="mailto:brav3mar1@gmail.com" className="text-blue-400">brav3mar1@gmail.com</a></p>
              <p><strong>تلفن:</strong> <a href="tel:+989150321820" className="text-blue-400">+۹۸۹۱۵۰۳۲۱۸۲۰</a></p>
              <p><strong>شرکت:</strong> Atiem Trading & Mining</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}