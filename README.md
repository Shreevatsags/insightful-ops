# Insightful Ops 📊

A modern operational intelligence platform designed to help teams monitor, analyze, and manage operational workflows through data-driven insights and interactive dashboards.

---

## Overview

Insightful Ops provides a centralized interface for tracking operational metrics, identifying trends, and improving decision-making through visual analytics.

The platform is built with modern web technologies and leverages Supabase for backend services including authentication, database management, and real-time capabilities.

---

## Features

* 📈 Interactive dashboards
* 📊 Operational analytics and reporting
* 🔍 Data visualization and insights
* 🔐 Secure authentication
* ⚡ Real-time data updates
* 📱 Responsive user interface
* ☁️ Supabase integration

---

## Tech Stack

### Frontend

* React
* TypeScript
* Vite
* Tailwind CSS
* Shadcn UI

### Backend

* Supabase

  * Authentication
  * PostgreSQL Database
  * Storage
  * Realtime Services

### Development Tools

* Bun
* ESLint
* Prettier

---

## Project Structure

```text
insightful-ops/
├── src/
│   ├── components/
│   ├── pages/
│   ├── hooks/
│   ├── services/
│   └── utils/
│
├── supabase/
│   ├── migrations/
│   └── functions/
│
├── public/
├── .env
├── package.json
└── README.md
```

---

## Getting Started

### Prerequisites

Install:

* Node.js (v18 or later)
* Bun
* Git

### Clone Repository

```bash
git clone https://github.com/Shreevatsags/insightful-ops.git
cd insightful-ops
```

### Install Dependencies

```bash
bun install
```

or

```bash
npm install
```

---

## Environment Variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## Run Locally

```bash
bun run dev
```

or

```bash
npm run dev
```

The application will be available at:

```text
http://localhost:5173
```

---

## Build for Production

```bash
bun run build
```

or

```bash
npm run build
```

---

## Deployment

Deployment is currently in progress.

Planned deployment platforms:

* Vercel
* Netlify
* Render

---

## Roadmap

* [ ] Production deployment
* [ ] Advanced analytics dashboard
* [ ] Export reports
* [ ] Role-based access control
* [ ] Notification system
* [ ] Performance monitoring

---

## Contributing

Contributions are welcome.

1. Fork the repository
2. Create a feature branch

```bash
git checkout -b feature/new-feature
```

3. Commit changes

```bash
git commit -m "Add new feature"
```

4. Push to GitHub

```bash
git push origin feature/new-feature
```

5. Open a Pull Request

---

## License

MIT License

---

## Author

**Shreevatsa S**

GitHub: https://github.com/Shreevatsags
