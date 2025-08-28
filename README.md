# 🎵 Music Booking Platform

A cutting-edge MERN stack platform connecting clients, artists, and recording studios for seamless musical collaboration and booking experiences.

## ✨ Features

### 🎯 Core Functionality
- **Multi-Role System**: Clients, Artists, Studios, Admins with tailored dashboards
- **Real-time Booking**: Live availability updates with Socket.IO
- **Secure Payments**: Stripe integration with webhook handling and refunds
- **Media Management**: Cloudinary integration for images, audio, and video
- **Advanced Search**: AI-powered filters by location, genre, availability, price
- **Reviews & Ratings**: Community-driven quality assurance system
- **Admin Dashboard**: Complete platform management and analytics

### 🎨 Modern UI/UX
- **🌓 Dark/Light Theme**: Seamless theme switching with system preference detection
- **🎵 Music Animations**: Continuous music-themed animations and visualizers
- **✨ Interactive Elements**: Vibrating effects, floating notes, and pulsing visualizers
- **🌟 Glassmorphism Design**: Beautiful frosted glass effects with backdrop blur
- **🚀 Smooth Animations**: Framer Motion powered interactions and page transitions
- **📱 Mobile Responsive**: Optimized for all device sizes with touch-friendly interactions
- **🎭 Particle Effects**: Dynamic background animations with music notes
- **🎨 Modern Color Palette**: Magenta neon (#E91E63), Electric blue (#00C9FF), Purple glow (#9C27B0)

### 🚀 Advanced Features
- **Real-time Chat**: Socket.IO powered messaging system
- **File Sharing**: Upload and share project files
- **Calendar Integration**: Smart availability management
- **Notification System**: In-app and email notifications
- **Multi-language Support**: Internationalization ready
- **PWA Ready**: Progressive Web App capabilities
- **SEO Optimized**: Meta tags and structured data
- **Accessibility**: WCAG compliant with focus management

## 🛠 Tech Stack

### Backend
- **Node.js** + **Express.js** - Server framework
- **MongoDB** + **Mongoose** - Database and ODM
- **Socket.IO** - Real-time communication
- **Stripe** - Payment processing
- **Cloudinary** - Media storage and optimization
- **JWT** - Authentication and authorization
- **Zod** - Schema validation
- **Nodemailer** - Email service
- **Helmet** - Security middleware
- **Rate Limiting** - API protection

### Frontend
- **React 18** + **Vite** - Modern React with fast build
- **Redux Toolkit** + **RTK Query** - State management and API calls
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations and gestures
- **React Router v6** - Client-side routing
- **React Hook Form** - Form management
- **Socket.IO Client** - Real-time features
- **Recharts** - Data visualization
- **React Hot Toast** - Beautiful notifications

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- MongoDB (local or Atlas)
- Stripe account (for payments)
- Cloudinary account (optional, for media)

### Installation

1. **Clone and install dependencies:**
```bash
git clone https://github.com/your-username/music-booking-platform.git
cd music-booking-platform
npm install
cd server && npm install
cd ../client && npm install
```

2. **Environment setup:**
```bash
cp .env.example .env
```

Edit `.env` with your credentials:
```env
# Database
MONGO_URI=mongodb://localhost:27017/music-booking

# JWT Secrets (generate strong secrets)
JWT_ACCESS_SECRET=your-super-secret-access-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key

# Stripe (get from https://stripe.com)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Cloudinary (optional, get from https://cloudinary.com)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

3. **Start development servers:**
```bash
# From root directory - runs both client and server
npm run dev
```

4. **Seed database (optional):**
```bash
npm run seed
```

5. **Setup Stripe webhooks:**
```bash
# Install Stripe CLI: https://stripe.com/docs/stripe-cli
stripe listen --forward-to localhost:5000/api/webhooks/stripe
```

### 🌐 Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/health

### 🔐 Demo Accounts (after seeding)

```
Admin: admin@musicbooking.com / admin123
Artist: artist1@example.com / password123
Studio: studio1@example.com / password123
Client: client1@example.com / password123
```

## 📱 Screenshots

### 🏠 Modern Homepage
- Hero section with particle animations
- Interactive search with AI suggestions
- Trending genres and statistics
- Testimonials carousel

### 🔍 Advanced Search
- Smart filters and sorting
- Real-time availability
- Map integration
- Infinite scroll results

### 👤 Profile Pages
- Rich media galleries
- Interactive calendars
- Review systems
- Social integrations

### 📊 Dashboards
- Role-specific interfaces
- Analytics and charts
- Booking management
- Revenue tracking

## 🔧 API Documentation

### 🔐 Authentication
```
POST /api/auth/register - Register new user
POST /api/auth/login - Login user
POST /api/auth/logout - Logout user
POST /api/auth/refresh - Refresh token
GET /api/auth/me - Get current user
```

### 🎵 Artists
```
GET /api/artists - Search artists
GET /api/artists/:id - Get artist profile
PATCH /api/artists/:id - Update artist (protected)
POST /api/artists/:id/availability - Add availability (protected)
```

### 🏢 Studios
```
GET /api/studios - Search studios
GET /api/studios/:id - Get studio profile
PATCH /api/studios/:id - Update studio (protected)
POST /api/studios/:id/availability - Add availability (protected)
```

### 📅 Bookings
```
GET /api/bookings/my - Get user's bookings (protected)
POST /api/bookings - Create new booking (protected)
PATCH /api/bookings/:id/cancel - Cancel booking (protected)
PATCH /api/bookings/:id/complete - Complete booking (protected)
```

### ⭐ Reviews
```
GET /api/reviews - Get reviews
POST /api/reviews - Create review (protected)
PATCH /api/reviews/:id - Update review (protected)
```

### 💳 Payments
```
POST /api/payments/create-checkout-session - Create Stripe session (protected)
POST /api/payments/refund/:bookingId - Process refund (admin)
```

### 🛡 Admin
```
GET /api/admin/analytics - Platform analytics (admin)
GET /api/admin/users - Manage users (admin)
GET /api/admin/bookings - Oversee bookings (admin)
GET /api/admin/reviews - Moderate reviews (admin)
```

## 🧪 Testing

```bash
# Run server tests
cd server && npm test

# Run client tests (when implemented)
cd client && npm test
```

## 📦 Deployment

### 🐳 Docker (Recommended)
```bash
# Build and run with docker-compose
docker-compose up --build
```

### ☁️ Manual Deployment
1. Build frontend: `cd client && npm run build`
2. Deploy backend to your preferred platform (Heroku, Railway, etc.)
3. Deploy frontend to Netlify/Vercel
4. Configure environment variables on hosting platforms

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **React Team** for the amazing framework
- **Stripe** for secure payment processing
- **Cloudinary** for media management
- **MongoDB** for flexible data storage
- **Tailwind CSS** for utility-first styling
- **Framer Motion** for beautiful animations

## 📞 Support

For support, email support@musicbooking.io or join our Discord community.

## 🎯 Roadmap

- [ ] Mobile app (React Native)
- [ ] AI-powered music matching
- [ ] Blockchain integration for royalties
- [ ] Live streaming capabilities
- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] Integration with major DAWs
- [ ] NFT marketplace for music

---

**Made with ❤️ by the Music Booking Platform Team**
