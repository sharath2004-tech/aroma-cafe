# Brew & Bites - Premium Cafe Management System

A modern, full-featured cafe management web application built with Next.js 16, React 19, and TypeScript. Features seamless ordering, table reservations, real-time order tracking, and role-based dashboards for customers, chefs, and administrators.

## Features

### Customer Experience
- **Browse Menu**: Beautiful, categorized menu with item details and preparation times
- **Smart Cart**: Add/remove items with quantity adjustments and special notes
- **Pre-Ordering**: Order 15+ minutes in advance to skip lines
- **Order Tracking**: Real-time status updates (pending → preparing → ready → completed)
- **Table Reservations**: Book tables with flexible time slots and guest counts
- **Order History**: View past orders and booking confirmations

### Chef Dashboard
- **Order Queue**: Prioritized view of pending orders with guest counts and table numbers
- **Status Management**: Update orders through preparation workflow
- **Special Notes**: Access customer special requests and preparation notes
- **Completion Tracking**: Mark orders as ready for efficient pickup

### Admin Dashboard
- **Analytics**: Real-time statistics on orders, revenue, and customer activity
- **Menu Management**: Add, edit, disable, or delete menu items with categories
- **Performance Tracking**: Visual charts for weekly orders and revenue trends
- **User Management**: Control chef and customer accounts
- **Booking Management**: Oversee table reservations and availability
- **Activity Log**: Track system events and transactions

## Tech Stack

### Frontend
- **Framework**: Next.js 16 with App Router
- **UI Library**: React 19 with TypeScript
- **Styling**: Tailwind CSS v4
- **Animations**: Framer Motion & GSAP
- **3D Graphics**: Three.js & React Three Fiber
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts

### UI Components
- shadcn/ui components with Radix UI
- Custom glass morphism effects
- Responsive grid layouts
- Smooth page transitions

### Backend
- Express.js (`server.js`, `routes/`, `controllers/`, `models/`, `middleware/`)
- MongoDB with Mongoose
- Socket.io for real-time updates
- JWT authentication with bcrypt, role-based access control
- Cloudinary image uploads
- API client with Axios interceptors

## Project Structure

```
├── app/
│   ├── page.tsx                 # Landing page with 3D animations
│   ├── layout.tsx              # Root layout with theme
│   ├── globals.css             # Theme colors and animations
│   ├── auth/
│   │   ├── login/page.tsx      # Login page
│   │   └── register/page.tsx   # Registration page
│   └── dashboard/
│       ├── customer/
│       │   ├── page.tsx        # Customer home
│       │   ├── menu/page.tsx   # Menu browser
│       │   ├── cart/page.tsx   # Shopping cart
│       │   ├── orders/page.tsx # Order tracking
│       │   └── bookings/page.tsx # Table reservations
│       ├── admin/
│       │   ├── page.tsx        # Admin dashboard
│       │   └── menu/page.tsx   # Menu management
│       └── chef/
│           ├── page.tsx        # Order queue
│           ├── active/page.tsx # Active orders
│           └── completed/page.tsx # Completed orders
├── components/
│   ├── 3d/
│   │   └── RotatingCoffeeCup.tsx # 3D coffee cup component
│   ├── dashboard/
│   │   └── Sidebar.tsx          # Navigation sidebar
│   └── ui/                      # shadcn components
├── lib/
│   ├── types/index.ts          # TypeScript interfaces
│   ├── store/index.ts          # Zustand stores
│   ├── auth/client.ts          # API client & auth
│   └── utils.ts                # Utility functions
└── public/                      # Static assets
```

## Getting Started

### Installation

```bash
# Install dependencies
npm install

# Start the Next.js frontend and Express backend together
npm run dev:all

# ...or run them separately in two terminals
npm run dev      # Next.js frontend on :3000
npm run server-dev  # Express backend on :5000
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

Copy `.env.example` to `.env` and fill in real values:

```bash
cp .env.example .env
```

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/aroma-cafe
JWT_SECRET=your_jwt_secret_key_here
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## Usage

### Landing Page
- View cafe features and menu preview
- Access login/registration
- See 3D animated coffee cup

### Customer Dashboard
1. **Browse Menu** - Filter by category (Coffee, Pastries, Sandwiches)
2. **Add to Cart** - Select quantity and add items
3. **Checkout** - Set ready time (15+ min), add special notes
4. **Track Orders** - Monitor status in real-time
5. **Book Table** - Reserve tables with guest count and duration

### Chef Dashboard
1. **View Queue** - See pending orders prioritized by time
2. **Start Preparing** - Move orders to "preparing" status
3. **Mark Ready** - Notify customers order is ready
4. **Complete** - Mark as picked up

### Admin Dashboard
1. **View Analytics** - Check revenue and order trends
2. **Manage Menu** - Add/edit/disable items
3. **Monitor Users** - Manage chefs and customers
4. **View Bookings** - Oversee table reservations

## Color Theme

- **Primary**: #8b4513 (Coffee Brown)
- **Secondary**: #d4a574 (Light Tan)
- **Accent**: #c17a4a (Warm Brown)
- **Background**: #faf9f7 (Cream)
- **Card**: #ffffff (White)
- **Muted**: #e8e4df (Light Gray)

## Features Highlights

### 3D Graphics
- Rotating coffee cup with accurate materials
- Steam particle effects
- Three.js + React Three Fiber integration

### Animations
- Page transitions with Framer Motion
- Smooth scroll reveals
- Hover effects and interactions
- Status progress indicators

### Real-time Capabilities (Ready for Socket.io)
- Order status updates
- Chef notifications
- Live queue updates
- Customer notifications

### Responsive Design
- Mobile-first approach
- Tablet optimization
- Desktop enhancements
- Touch-friendly interactions

## API Reference

```typescript
// Authentication
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me       (auth required)
POST /api/auth/logout   (auth required)

// Menu
GET    /api/menu
GET    /api/menu/:id
POST   /api/menu        (admin only)
PUT    /api/menu/:id    (admin only)
DELETE /api/menu/:id    (admin only)

// Orders
GET  /api/orders                  (auth required — own orders)
GET  /api/orders/:id              (auth required — owner, chef or admin)
POST /api/orders                  (auth required)
POST /api/orders/:id/cancel       (auth required — owner, chef or admin)
PUT  /api/orders/:id/status       (chef or admin only)
GET  /api/orders/admin/all-orders (chef or admin only)

// Table Bookings
GET  /api/bookings                (auth required — own bookings, or all for chef/admin)
POST /api/bookings                (auth required)
PUT  /api/bookings/:id            (auth required — owner, chef or admin)
POST /api/bookings/:id/cancel     (auth required — owner, chef or admin)

// Images
POST   /api/images/upload  (auth required)
GET    /api/images
DELETE /api/images/:id     (auth required — uploader, chef or admin)
```

## Performance Optimizations

- Code splitting with dynamic imports
- Image optimization
- CSS-in-JS with Tailwind
- React Server Components ready
- Efficient state management with Zustand

## Future Enhancements

- Wire the Socket.io client into the dashboards for live order/booking updates (server already emits events)
- Payment gateway integration
- Email notifications
- SMS order alerts
- Kitchen display system (KDS)
- Loyalty program
- Rating and reviews
- Staff management
- Inventory tracking

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers

## Deployment

The frontend (Next.js) deploys to **Vercel**; the backend (Express/Socket.io/MongoDB) deploys to **Render**. They're two separate services from the same repo.

### Backend on Render

1. Push this repo to GitHub/GitLab.
2. In Render: **New → Blueprint**, point it at the repo — it will pick up `render.yaml` and create the `aroma-cafe-api` web service automatically. (Or **New → Web Service** manually with Build Command `npm install`, Start Command `npm run server`.)
3. In the service's Environment tab, set the secrets Render didn't auto-generate:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
   - `CORS_ORIGIN` — your Vercel domain(s), comma-separated (e.g. `https://aroma-cafe.vercel.app,https://your-custom-domain.com`)
4. Render assigns `PORT` automatically; leave `PORT` unset in the dashboard.
5. Deploy, then confirm `https://<your-service>.onrender.com/health` returns `{"status":"Backend is running!"}`.

Note: Render's free tier spins the service down when idle, so the first request after inactivity will be slow.

### Frontend on Vercel

1. Import the same repo in Vercel — it auto-detects Next.js, no config needed.
2. Set the project's environment variable:
   - `NEXT_PUBLIC_API_URL` = `https://<your-render-service>.onrender.com/api`
3. Deploy. Vercel builds and hosts the frontend only — `server.js` and everything under `routes/`, `controllers/`, `models/`, `middleware/` are unused at runtime on Vercel (they're only needed by Render) but harmless to ship.
4. Once both are live, update `CORS_ORIGIN` on Render to match the final Vercel URL (and redeploy the backend) so the browser isn't blocked by CORS.

## License

MIT

## Contact

For questions or support, please contact the development team.

---

Built with ❤️ using Next.js, React, and modern web technologies.
