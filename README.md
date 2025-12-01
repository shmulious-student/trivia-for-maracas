# Trivia for Maracas - Technical Documentation

## 🏗 Architecture Overview
This project is a **Monorepo** managed by NPM Workspaces, designed for modularity, clean code, and strict separation of concerns.

### Workspaces
| Workspace | Path | Tech Stack | Purpose |
|-----------|------|------------|---------|
| **Client** | `@trivia/client` | React, Vite, TypeScript | The player-facing Trivia Game application. Optimized for mobile. |
| **Backoffice** | `@trivia/backoffice` | React, Vite, TypeScript | The admin dashboard for managing questions, subjects, and configs. |
| **Server** | `server` | Node.js, Express, TypeScript | The REST API backend. Implements **Provider Pattern** for database and analytics. |
| **Shared** | `shared` | TypeScript | Shared types, interfaces, and utility functions used by all packages. |

## 🛠 Technology Stack Decisions
### Why React + Vite? (vs. Next.js)
We chose **React + Vite** over Next.js for this specific project for the following reasons:
1.  **Gameplay Focus**: A Trivia app is highly interactive (timers, rapid state changes). It behaves more like a native app than a content website. Client-side rendering (CSR) is ideal here.
2.  **Architecture Clarity**: We require a strict separation between the Backend API (Express) and the Frontend. Next.js blurs this line with API routes. Our **Provider Pattern** implementation in a dedicated Express server ensures the backend is agnostic of the frontend framework.
3.  **Performance**: Vite offers superior local development speed and a lighter production bundle for this use case.

### Why MongoDB?
-   **Persistence**: Essential for storing user-generated content (Questions, Subjects) on free-tier hosting where filesystems are ephemeral.
-   **Flexibility**: JSON-like document structure maps perfectly to our dynamic Question/Answer data models.

## 🚀 Getting Started

### Prerequisites
-   Node.js (v18+)
-   NPM (v9+)

### Installation
```bash
# Install dependencies for all workspaces
npm install
```

### Development
```bash
# Run Client (Player App)
npm run dev:client

# Run Backoffice (Admin App)
npm run dev:backoffice

# Run Server
npm run dev:server
```

### Building for Production
```bash
npm run build
```

## 📂 Directory Structure
```
.
├── client/         # Player Application
├── backoffice/     # Admin Application
├── server/         # Backend API
├── shared/         # Shared Types
├── package.json    # Root Config
└── README.md       # This file
```
