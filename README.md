# 🌱 Community Sustainability Logistics Management Platform

A **Next.js 14+ MVP** for organizing environmental actions, coordinating volunteers, and measuring the impact of community sustainability initiatives.

## 🎯 Features

- **Authentication**: User registration and login with NextAuth
- **Event Management**: Create, view, and manage sustainability events
- **Interactive Maps**: Visualize events on Leaflet maps  
- **Role-Based Access**: Users can join events as Organizer, Partner, or Volunteer
- **Resource Management**: Track tools and materials for each event
- **Survey System**: Collect pre/post-intervention feedback
- **Impact Metrics**: Measure environmental outcomes (waste collected, trees planted, area recovered)
- **Dashboard**: Personalized view of participated and created events

## 🛠️ Tech Stack

- **Frontend**: Next.js 14+ (App Router), React, TypeScript
- **Styling**: Tailwind CSS
- **Maps**: Leaflet, React-Leaflet
- **Backend**: Next.js Server Components & Server Actions
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with Credentials Provider
- **Validation**: Zod

## 📋 Prerequisites

- Node.js 18+
- PostgreSQL database (or Docker Desktop)
- npm or yarn

## 🚀 Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

Create a `.env` file (use `.env.example` as template):

```env
DATABASE_URL="postgresql://user:password@localhost:5432/sustainability_db?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here-change-in-production"
```

Generate a secure `NEXTAUTH_SECRET`:

```bash
openssl rand -base64 32
```

### 3. Set up the database

**Option A: Using Docker (Recommended)**
```bash
# Start PostgreSQL with Docker
docker-compose up -d

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init
```

**Option B: Using Local PostgreSQL**
```bash
# Ensure PostgreSQL is running, then:
npx prisma generate
npx prisma migrate dev --name init
```

See `DOCKER.md` for detailed Docker setup instructions.

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
app/
├── actions/              # Server Actions
├── auth/                 # Authentication pages
├── dashboard/            # User dashboard
├── events/               # Event pages & management
└── api/auth/             # NextAuth routes

components/               # Reusable React components
lib/                      # Utilities & configurations
prisma/                   # Database schema
```

## 🗃️ Database Schema

- **User**: Authentication & profile
- **ActionEvent**: Sustainability events
- **UserEventRole**: User participation with roles
- **Resource**: Event resources
- **SurveyResponse**: Pre/post surveys

## 🚀 Deployment

Deploy to Vercel:

1. Push code to GitHub
2. Connect to Vercel
3. Add environment variables
4. Deploy

## 📝 License

MIT
