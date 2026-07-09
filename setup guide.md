/* ==========================================
   DEPLOYMENT & SETUP GUIDE
   ========================================== */

// 📄 File: SETUP_GUIDE.md (راهنمای نصب)

# 📚 راهنمای راه‌اندازی Atiem

## 🛠️ قدم 1: آماده‌سازی محیط

### الزامات:
- Node.js 18+ 
- npm یا yarn
- PostgreSQL
- Git

### نصب:
\`\`\`bash
# Clone پروژه
git clone https://github.com/yourusername/atiem.git
cd atiem

# نصب dependencies
npm install

# یا با yarn
yarn install
\`\`\`

---

## 🗄️ قدم 2: تنظیم Database

### ۱. ایجاد Database:
\`\`\`bash
# وارد PostgreSQL شوید
psql -U postgres

# دستور ایجاد Database:
CREATE DATABASE atiem;
CREATE USER atiem_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE atiem TO atiem_user;
\exit
\`\`\`

### ۲. تنظیم .env.local:
\`\`\`bash
cp .env.example .env.local
\`\`\`

سپس اطلاعات زیر را وارد کنید:

\`\`\`env
# Database
DATABASE_URL="postgresql://atiem_user:your_secure_password@localhost:5432/atiem"

# JWT
JWT_SECRET="your_super_secret_jwt_key_minimum_32_characters"
JWT_EXPIRES_IN="7d"

# Blockchain APIs
BLOCKCHAIN_API_KEY="your_etherscan_api_key"
BLOCKCHAIR_API_KEY="your_blockchair_api_key"

# URLs
NEXT_PUBLIC_API_URL="http://localhost:3000"
NEXT_PUBLIC_COMPANY_NAME="Atiem"
NEXT_PUBLIC_CONTACT_EMAIL="brav3mar1@gmail.com"
NEXT_PUBLIC_CONTACT_PHONE="+۹۸۹۱۵۰۳۲۱۸۲۰"

# Mode
NODE_ENV="development"
\`\`\`

### ۳. اجرای Migrations:
\`\`\`bash
node scripts/migrate.js
\`\`\`

---

## 💻 قدم 3: اجرای Local

\`\`\`bash
# development mode
npm run dev

# برای دسترسی:
# http://localhost:3000
\`\`\`

---

## 🚀 قدم 4: Deploy به Railway

### ۱. ایجاد حساب Railway:
- رفتید به [Railway.app](https://railway.app)
- ورود با GitHub

### ۲. ایجاد New Project:
```
- تمام فایل‌ها را push کنید به GitHub
- در Railway، کلیک کنید "New Project"
- انتخاب کنید "GitHub Repo"
- انتخاب repository Atiem
```

### ۳. اضافه کردن Variables:

**PostgreSQL Database:**
- کلیک "Add Service" 
- انتخاب "PostgreSQL"
- تمام environment variables خود را اضافه کنید

**Environment Variables:**
```
DATABASE_URL = (خودکار از PostgreSQL)
JWT_SECRET = your_secret_key
JWT_EXPIRES_IN = 7d
BLOCKCHAIN_API_KEY = your_key
NEXT_PUBLIC_API_URL = your_railway_domain
NODE_ENV = production
```

### ۴. Deploy:
```
- Push کنید کوده را به GitHub
- Railway خودکار deploy می‌کند
- دسترسی توسط: https://your-project.up.railway.app
```

---

## 📁 ساختار پروژه:

\`\`\`
atiem/
├── pages/
│   ├── _app.js
│   ├── index.js (Home)
│   ├── plans.js
│   ├── login.js
│   ├── register.js
│   ├── about.js
│   ├── api/
│   │   ├── auth/
│   │   │   ├── register.js
│   │   │   ├── login.js
│   │   │   ├── setup-2fa.js
│   │   │   └── verify-2fa.js
│   │   ├── dashboard/
│   │   │   └── user.js
│   │   ├── plans/
│   │   │   └── list.js
│   │   ├── transactions/
│   │   │   ├── create.js
│   │   │   └── history.js
│   │   ├── mining/
│   │   │   └── create-pool.js
│   │   └── webhook/
│   │       └── blockchain-update.js
│   └── dashboard/
│       ├── index.js
│       ├── wallet.js
│       ├── transactions.js
│       ├── deposit.js
│       ├── mining.js
│       └── settings.js
├── components/
│   ├── Navbar.js
│   └── Footer.js
├── lib/
│   ├── db.js
│   ├── auth.js
│   └── blockchain.js
├── scripts/
│   └── migrate.js
├── styles/
│   └── globals.css
├── public/
│   └── fonts/
│       └── IRANSansWeb.ttf
├── tailwind.config.js
├── next.config.js
├── package.json
├── .env.local
└── .gitignore
\`\`\`

---

## 🔐 Features موجود:

✅ **User Authentication:**
- ثبت‌نام و ورود
- JWT Token Based
- دو‌مرحله‌ای (2FA) with Google Authenticator
- Password Hashing (bcryptjs)

✅ **4 Membership Tiers:**
- پلن برنزی ($9.99/ماه)
- پلن نقره‌ای ($29.99/ماه)
- پلن طلایی ($79.99/ماه)
- پلن الماسی ($199.99/ماه)

✅ **Wallet Management:**
- 5 Cryptocurrency Support (BTC, ETH, USDT, TON, TRX)
- Real Wallet Addresses
- Balance Tracking

✅ **Transactions:**
- Deposit/Withdrawal
- Plan Purchase
- Transaction History
- Blockchain Verification

✅ **Mining Pools:**
- Daily/Weekly/Monthly/Yearly Plans
- Automatic Return Calculation
- Pool Management

✅ **Dashboard:**
- User Statistics
- Real-time Charts
- Quick Actions
- Settings Management

---

## 🔧 API Endpoints:

### Authentication:
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/setup-2fa
- POST /api/auth/verify-2fa

### Dashboard:
- GET /api/dashboard/user

### Plans:
- GET /api/plans/list

### Transactions:
- POST /api/transactions/create
- GET /api/transactions/history

### Mining:
- POST /api/mining/create-pool

### Webhooks:
- POST /api/webhook/blockchain-update

---

## 🌐 Blockchain Monitoring:

پروژه از APIs زیر استفاده می‌کند:

1. **Bitcoin**: blockchain.info API
2. **Ethereum**: Etherscan API
3. **Tron**: TronGrid API
4. **TON**: TONApi
5. **USDT**: از Tron استفاده می‌شود

برای فعال‌سازی blockchain monitoring:

\`\`\`javascript
// lib/blockchain-monitor.js
const monitorAddresses = async () => {
  const addresses = await pool.query(
    'SELECT * FROM blockchain_monitoring WHERE status = $1',
    ['active']
  );

  for (const addr of addresses.rows) {
    const balance = await getBlockchainBalance(addr.currency, addr.address);
    
    // Update wallet balance
    await pool.query(
      'UPDATE wallets SET balance = $1 WHERE address = $2',
      [balance, addr.address]
    );
  }
};

// اجرای هر 30 دقیقه
setInterval(monitorAddresses, 30 * 60 * 1000);
\`\`\`

---

## 📱 Responsive Design:

- Mobile-first design ✅
- Tailwind CSS ✅
- RTL Support (فارسی) ✅
- Dark Mode ✅
- Glass Morphism UI ✅

---

## 🎨 رنگ‌ها و طراحی:

- **Primary**: آبی آسمانی (#00D4FF)
- **Secondary**: بنفش (#7C3AED)
- **Background**: مشکی gradient
- **Typography**: IRANSans Font

---

## 🔒 Security Best Practices:

✅ HTTPS Only (Production)
✅ JWT Token Authentication
✅ Password Hashing (bcryptjs)
✅ SQL Injection Prevention
✅ CORS Configuration
✅ Rate Limiting (Recommended)
✅ 2FA Support

---

## 📊 Performance:

- Next.js Optimization
- Image Optimization
- Code Splitting
- Fast API Responses
- PostgreSQL Indexing

---

## 🐛 Troubleshooting:

### Database Connection Error:
\`\`\`bash
# بررسی PostgreSQL در حال اجراء است
psql -U postgres

# اگر مشکل بود:
brew services restart postgresql
\`\`\`

### Port Already in Use:
\`\`\`bash
# تغییر port
npm run dev -- -p 3001
\`\`\`

### Build Error:
\`\`\`bash
rm -rf .next
npm run build
\`\`\`

---

## 📞 Contact & Support:

- **Email**: brav3mar1@gmail.com
- **Phone**: +۹۸۹۱۵۰۳۲۱۸۲۰
- **Company**: Atiem Trading & Mining

---

## 📄 لایسنس:

Private Project - All Rights Reserved

---

## ✨ نکات مهم:

1. **Change JWT_SECRET** در production
2. **Use HTTPS** همیشه
3. **Enable 2FA** برای تمام کاربران
4. **Regular Backups** از Database
5. **Monitor Blockchain** هر 30 دقیقه
6. **Update Dependencies** منظم
7. **Test کامل** پیش از deployment

---

## 🎯 بعدی برای بهبود:

- [ ] Admin Panel
- [ ] Advanced Analytics
- [ ] Payment Gateway Integration
- [ ] Email Notifications
- [ ] SMS Alerts
- [ ] Referral Program
- [ ] Affiliate System
- [ ] Mobile App (React Native)
- [ ] WebSocket for Real-time Updates
- [ ] AI Trading Bot

---

**Happy Coding! 🚀**

// 📄 File: Procfile (برای Railway)
web: npm run build && npm run start

// 📄 File: .env.example
DATABASE_URL="postgresql://user:password@localhost:5432/atiem"
JWT_SECRET="your_super_secret_jwt_key_change_in_production"
JWT_EXPIRES_IN="7d"
BLOCKCHAIN_API_KEY="your_etherscan_api_key"
BLOCKCHAIR_API_KEY="your_blockchair_api_key"
NEXT_PUBLIC_API_URL="http://localhost:3000"
NEXT_PUBLIC_COMPANY_NAME="Atiem"
NEXT_PUBLIC_CONTACT_EMAIL="brav3mar1@gmail.com"
NEXT_PUBLIC_CONTACT_PHONE="+۹۸۹۱۵۰۳۲۱۸۲۰"
NODE_ENV="development"

// 📄 File: docker-compose.yml (Optional - برای local PostgreSQL)
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: atiem
      POSTGRES_USER: atiem_user
      POSTGRES_PASSWORD: atiem_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
