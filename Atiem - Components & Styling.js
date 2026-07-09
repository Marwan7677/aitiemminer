/* ==========================================
   COMPONENTS & STYLING
   ========================================== */

// 📄 File: components/Navbar.js
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Navbar() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('token'));
  }, []);

  return (
    <nav className="fixed top-0 w-full bg-gradient-to-r from-slate-900/95 to-slate-800/95 backdrop-blur-md border-b border-slate-700 z-50">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
          Atiem
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-gray-300 hover:text-white transition">
            خانه
          </Link>
          <Link href="/plans" className="text-gray-300 hover:text-white transition">
            پلن‌ها
          </Link>
          <Link href="/about" className="text-gray-300 hover:text-white transition">
            درباره ما
          </Link>
        </div>

        {/* Right Side */}
        <div className="hidden md:flex items-center gap-4">
          {isLoggedIn ? (
            <>
              <Link href="/dashboard" className="px-6 py-2 rounded-lg hover:bg-slate-700 transition">
                داشبورد
              </Link>
              <button
                onClick={() => {
                  localStorage.removeItem('token');
                  setIsLoggedIn(false);
                  router.push('/');
                }}
                className="px-6 py-2 bg-red-600 rounded-lg hover:bg-red-700 transition"
              >
                خروج
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="px-6 py-2 rounded-lg hover:bg-slate-700 transition">
                ورود
              </Link>
              <Link href="/register" className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg hover:shadow-lg transition">
                ثبت‌نام
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden text-2xl"
        >
          ☰
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-800 border-t border-slate-700 p-4 space-y-3">
          <Link href="/" className="block py-2 text-gray-300 hover:text-white">خانه</Link>
          <Link href="/plans" className="block py-2 text-gray-300 hover:text-white">پلن‌ها</Link>
          <Link href="/about" className="block py-2 text-gray-300 hover:text-white">درباره ما</Link>
          {isLoggedIn ? (
            <>
              <Link href="/dashboard" className="block py-2 text-gray-300 hover:text-white">داشبورد</Link>
              <button
                onClick={() => {
                  localStorage.removeItem('token');
                  setIsLoggedIn(false);
                  router.push('/');
                }}
                className="w-full py-2 bg-red-600 rounded-lg hover:bg-red-700"
              >
                خروج
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="block py-2 text-gray-300 hover:text-white">ورود</Link>
              <Link href="/register" className="block py-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg text-center">
                ثبت‌نام
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}

// 📄 File: components/Footer.js
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-slate-900 border-t border-slate-700 py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
              Atiem
            </h3>
            <p className="text-gray-400 text-sm">
              پلتفرم تریدینگ و ماینینگ ارزهای دیجیتالی
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold mb-4">لینک‌های سریع</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/" className="hover:text-white transition">خانه</Link></li>
              <li><Link href="/plans" className="hover:text-white transition">پلن‌ها</Link></li>
              <li><Link href="/about" className="hover:text-white transition">درباره ما</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-bold mb-4">پشتیبانی</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="mailto:brav3mar1@gmail.com" className="hover:text-white transition">ایمیل</a></li>
              <li><a href="tel:+989150321820" className="hover:text-white transition">تماس</a></li>
              <li><a href="#" className="hover:text-white transition">سوالات متداول</a></li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-bold mb-4">شبکه‌های اجتماعی</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-white transition">تلگرام</a></li>
              <li><a href="#" className="hover:text-white transition">توئیتر</a></li>
              <li><a href="#" className="hover:text-white transition">اینستاگرام</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-700 pt-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-400 text-center md:text-left">
            <p>&copy; ۱۴۰۳ Atiem. تمام حقوق محفوظ است.</p>
            <div className="flex gap-4 justify-center md:justify-start">
              <a href="#" className="hover:text-white transition">قوانین</a>
              <a href="#" className="hover:text-white transition">حریم‌خصوصی</a>
            </div>
            <p className="text-right md:text-left">طراحی و توسعه با ❤️ توسط Atiem</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

// 📄 File: styles/globals.css
@import 'tailwindcss/base';
@import 'tailwindcss/components';
@import 'tailwindcss/utilities';

@font-face {
  font-family: 'IRANSans';
  src: url('/fonts/IRANSansWeb.ttf') format('truetype');
}

* {
  font-family: 'IRANSans', sans-serif;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  direction: rtl;
  scroll-behavior: smooth;
}

body {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
  color: white;
  overflow-x: hidden;
}

/* Scrollbar Styling */
::-webkit-scrollbar {
  width: 10px;
}

::-webkit-scrollbar-track {
  background: #1e293b;
}

::-webkit-scrollbar-thumb {
  background: #475569;
  border-radius: 5px;
}

::-webkit-scrollbar-thumb:hover {
  background: #64748b;
}

/* Custom Animations */
@keyframes gradient {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

.animate-gradient {
  background-size: 200% 200%;
  animation: gradient 3s ease infinite;
}

/* Input Focus Effects */
input:focus, textarea:focus, select:focus {
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
}

/* Button Hover Effects */
button:not(:disabled):hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Card Hover Effects */
.card {
  transition: all 0.3s ease;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 40px rgba(59, 130, 246, 0.2);
}

/* Gradient Text */
.gradient-text {
  background: linear-gradient(135deg, #3b82f6, #8b5cf6, #ec4899);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Loading Animation */
.loading {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid rgba(59, 130, 246, 0.3);
  border-radius: 50%;
  border-top-color: #3b82f6;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Utility Classes */
.glass {
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(148, 163, 184, 0.2);
}

.neon {
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.5);
}

.glow {
  text-shadow: 0 0 20px rgba(59, 130, 246, 0.5);
}

// 📄 File: tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#00D4FF',
        'secondary': '#7C3AED',
        'dark': '#0f172a',
      },
      fontFamily: {
        'sans': ['IRANSans', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

// 📄 File: next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  i18n: {
    locales: ['fa', 'en'],
    defaultLocale: 'fa',
  },
  reactStrictMode: true,
  swcMinify: true,
  productionBrowserSourceMaps: false,
}

module.exports = nextConfig

// 📄 File: .gitignore
# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/

# Next.js
.next/
out/
*.pem

# Environment
.env
.env.local
.env.*.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# System
.DS_Store
Thumbs.db