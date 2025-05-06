# Discipline - Your Personal Productivity Assistant

A modern web application built with Next.js that helps you manage your tasks, stores, and productivity.

## 🚀 Tech Stack

- **Frontend**: Next.js 15.3.1 with TypeScript
- **UI**: Tailwind CSS, Shadcn UI
- **Authentication**: Clerk
- **State Management**: Zustand
- **Database**: Drizzle ORM with NeonDB
- **Testing**: Jest, React Testing Library
- **Form Handling**: React Hook Form
- **Payment Integration**: Bancard API

## 🛠️ Project Structure

```
master/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication routes
│   │   ├── login/
│   │   └── signup/
│   ├── (dashboard)/       # Dashboard routes
│   │   └── [storeId]/
│   └── (root)/            # Root layout and pages
├── components/
│   ├── ui/               # Reusable UI components
├── api/                  # API routes
├── db/                   # Database schema and migrations
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions and shared logic
├── providers/            # Context providers
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


## 📦 Features

- User authentication with Clerk
- Store management system
- Task tracking and management
- Modern UI with Tailwind CSS and Shadcn UI
- Responsive design
- Real-time updates with Zustand
- Secure payment processing with Bancard

## 🛠️ Development Tools

- **Code Linting**: ESLint
- **Code Formatting**: Prettier
- **Type Checking**: TypeScript
- **Testing**: Jest with React Testing Library
- **Database Management**: Drizzle ORM

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

Made with ❤️ by Sebastian R.
