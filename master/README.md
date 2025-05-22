# Discipline - Your Personal Productivity Assistant

<!-- Optional: Add badges here (e.g., Build Status, License, Version) -->
<!--
[![Build Status](https://img.shields.io/travis/your_username/discipline.svg?style=flat-square)](https://travis-ci.org/your_username/discipline)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/npm/v/your-package-name.svg?style=flat-square)](https://www.npmjs.com/package/your-package-name)
-->

A modern, full-stack web admin dashboard application designed to load your products, for management, store administration, and make actions through Whatsapp. Built with a robust and scalable tech stack.

## ✨ Features

- **Secure User Authentication**: Powered by Clerk for seamless and secure sign-up, sign-in, and user management.
- **Comprehensive Store Management**: Efficiently manage multiple stores, products, and orders.
- **Effective Task Tracking**: Organize and monitor your tasks with an intuitive interface.
- **Modern & Responsive UI**: Crafted with Tailwind CSS and Shadcn UI for a sleek, user-friendly experience across all devices.
- **Real-time Data Sync**: Leveraging Zustand for client-side state and potentially WebSockets (`ws`) for real-time updates.
- **Robust Form Handling & Validation**: Utilizing React Hook Form and Zod for reliable data input and validation.
- **User-Friendly Notifications**: Integrated React Hot Toast for clear and timely feedback.
- **Efficient API Communication**: Axios for streamlined HTTP requests to backend services.
- **Payment Gateway Integration**: Support for Bancard API for payment processing.
- **End-to-End Type Safety**: TypeScript used throughout the stack for improved reliability and maintainability.

## 🚀 Tech Stack

- **Core Framework**: Next.js (v15.3.1), TypeScript
- **UI/UX**: Tailwind CSS, Shadcn UI, React Hot Toast
- **State Management**: Zustand
- **Data Management & Database**: Drizzle ORM, NeonDB (Serverless Postgres)
- **Authentication**: Clerk
- **Forms & Validation**: React Hook Form, Zod
- **API Client**: Axios
- **Real-time Communication**: `ws` (WebSocket library)
- **Payment Integration**: Bancard API
- **Query Management**: TanStack Query (React Query)

## 🛠️ Project Structure

```
master/
├── app/                    # Next.js App Router (pages, layouts, route handlers)
│   ├── (auth)/             # Authentication-related routes and UI
│   ├── (dashboard)/        # Protected dashboard routes and UI
│   └── (root)/             # Root layout and public-facing pages
├── components/             # Shared/reusable UI components
│   └── ui/                 # Shadcn UI components (often customized)
├── db/                     # Database schema definitions (e.g., for Drizzle)
├── drizzle/                # Drizzle ORM configuration files and generated artifacts
├── hooks/                  # Custom React hooks for shared logic
├── lib/                    # Utility functions, helpers, and shared business logic
├── middleware.ts           # Next.js middleware for request processing
├── providers/              # React Context providers (e.g., Theme, Auth)
└── public/                 # Static assets (images, fonts, etc.)
```

## 🏁 Getting Started

Follow these instructions to set up and run the project locally.

### Prerequisites

- Node.js (v18 or higher recommended)
- npm (v8+) or yarn (v1.22+)
- PostgreSQL (required for local development if not using a cloud-based NeonDB instance directly for dev)
- Git

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url> # Replace <your-repository-url> with the actual URL
    cd discipline # Or your repository's directory name
    ```

2.  **Install dependencies:**
    Choose one of the following based on your preferred package manager:
    ```bash
    npm install
    ```
    or
    ```bash
    yarn install
    ```

3.  **Set up environment variables:**
    Copy the example environment file and populate it with your specific keys and configurations.
    ```bash
    cp .env.example .env
    ```
    Then, open `.env` and fill in the required values (e.g., database connection strings, API keys for Clerk, Bancard, etc.). Refer to `.env.example` for a full list of variables.

4.  **Database setup (using Drizzle ORM):**
    Apply schema migrations to your database. Ensure your database connection string in `.env` is correctly configured.
    ```bash
    npx drizzle-kit push:pg
    ```
    *Note: If you have seed scripts, run them after this step (e.g., `npm run seed` if available).* 

5.  **Start the development server:**
    ```bash
    npm run dev
    ```
    or
    ```bash
    yarn dev
    ```
    The application should now be running at [http://localhost:3000](http://localhost:3000) (or the port configured in your environment).

## 🧪 Running Tests

To execute the test suite (e.g., Jest with React Testing Library):

```bash
npm test
```
or
```bash
yarn test
```
Ensure all tests pass before pushing changes or creating pull requests.

## 🏗️ Building for Production

To create an optimized production build:

```bash
npm run build
```
or
```bash
yarn build
```
This command compiles the application and outputs the production-ready files typically to a `.next` directory.

## 🔧 Development Tools

- **Linting & Formatting**: ESLint, Prettier (if configured)
- **Type Checking**: TypeScript
- **Testing Framework**: Jest, React Testing Library
- **Database ORM & Migration**: Drizzle ORM, Drizzle Kit
- **Build System**: Next.js CLI

## 🤝 Contributing

Contributions are welcome! If you'd like to contribute, please follow these steps:

1.  **Fork the repository.**
2.  **Create a new branch** for your feature or bug fix: `git checkout -b feature/your-feature-name` or `bugfix/issue-ticket`.
3.  **Make your changes** and commit them with clear, descriptive messages.
4.  **Ensure your code adheres to the project's coding standards** (run linters and formatters if applicable).
5.  **Write tests** for new functionality or bug fixes.
6.  **Push your changes** to your forked repository.
7.  **Create a Pull Request (PR)** to the `main` (or `develop`) branch of the original repository.

Please provide a detailed description of your changes in the PR.

## 📝 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.

---

Made with ❤️ by Sebastian R. 
[GitHub](https://github.com/Ssrrb) | [Portfolio](https://sebastianrojas.lat)
