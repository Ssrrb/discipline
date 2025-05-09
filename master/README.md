# Discipline - Your Personal Productivity Assistant

A modern web admin dashboard application built with Next.js that helps you manage your tasks, stores, and productivity.

## 🚀 Tech Stack

- **Frontend**: Next.js 15.3.1 with TypeScript
- **UI**: Tailwind CSS, Shadcn UI
- **Authentication**: Clerk
- **State Management**: Zustand
- **Database**: Drizzle ORM with NeonDB
- **Form Handling**: React Hook Form
- **Toast Notifications**: React Hot Toast
- **WebSocket**: ws
- **Validation**: Zod
- **Query Management**: TanStack Query
- **API**: Axios
- **Payment Integration**: Bancard API

## 🛠️ Project Structure

```
master/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication routes
│   ├── (dashboard)/       # Dashboard routes
│   └── (root)/            # Root layout and pages
├── components/            # Reusable UI components
│   └── ui/               # Shadcn UI components
├── db/                    # Database schema and migrations
├── drizzle/               # Drizzle ORM configuration
├── hooks/                 # Custom React hooks
├── lib/                   # Utility functions and shared logic
├── middleware.ts          # Next.js middleware
├── providers/             # Context providers
└── public/               # Static assets
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- PostgreSQL (for local development)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env` and fill in your environment variables:
   ```bash
   cp .env.example .env
   ```
4. Set up your database:
   ```bash
   npx drizzle-kit push:pg
   ```
5. Start the development server:
   ```bash
   npm run dev
   ```


## 📦 Features

- User authentication with Clerk
- Store management system
- Task tracking and management
- Modern UI with Tailwind CSS and Shadcn UI
- Responsive design
- Real-time updates with Zustand
- Form validation with Zod
- Toast notifications
- API integration with Axios
- TypeScript support throughout

## 🛠️ Development Tools

- **Code Linting**: ESLint
- **Type Checking**: TypeScript
- **Testing**: Jest with React Testing Library
- **Database Management**: Drizzle ORM
- **Build Tool**: Next.js

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

Made with ❤️ by Sebastian R.
