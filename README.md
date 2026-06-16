# Insightful Ops 🚀

A modern operations intelligence platform that helps teams monitor, analyze, and manage operational data through interactive dashboards and actionable insights.

## ✨ Features

- 📊 Real-time operational dashboards
- 📈 Analytics and reporting
- 🔐 Authentication and user management
- ☁️ Supabase backend integration
- ⚡ Fast frontend built with React + TypeScript
- 🎨 Modern responsive UI
- 📱 Mobile-friendly design

---

## 🛠 Tech Stack

### Frontend
- React
- TypeScript
- Vite
- Tailwind CSS
- Shadcn UI

### Backend
- Supabase
  - Authentication
  - Database
  - Storage
  - Edge Functions

### Development Tools
- Bun
- ESLint
- Prettier

---

## 📂 Project Structure

```bash
insightful-ops/
│
├── src/                 # Application source code
├── supabase/            # Supabase configuration and migrations
├── .lovable/            # Lovable project files
├── public/              # Static assets
├── .env                 # Environment variables
├── package.json
├── bun.lock
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have installed:

- Node.js 18+
- Bun
- Git

### Clone Repository

```bash
git clone https://github.com/your-username/insightful-ops.git
cd insightful-ops
```

### Install Dependencies

Using Bun:

```bash
bun install
```

Or using npm:

```bash
npm install
```

---

## ⚙️ Environment Setup

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## ▶️ Run Locally

```bash
bun run dev
```

or

```bash
npm run dev
```

Application will start at:

```bash
http://localhost:5173
```

---

## 🗄️ Supabase Setup

1. Create a Supabase project.
2. Copy the project URL and anon key.
3. Add them to the `.env` file.
4. Run migrations if available:

```bash
supabase db push
```

---

## 📦 Build for Production

```bash
bun run build
```

or

```bash
npm run build
```

---

## 🧪 Linting

```bash
bun run lint
```

---

## 🚀 Deployment

You can deploy the application on:

- Vercel
- Netlify
- AWS
- Render

For Vercel:

```bash
vercel deploy
```

---

## 🔒 Security

- Store secrets in environment variables.
- Never commit `.env` files.
- Enable Row Level Security (RLS) in Supabase.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch

```bash
git checkout -b feature/new-feature
```

3. Commit changes

```bash
git commit -m "Add new feature"
```

4. Push branch

```bash
git push origin feature/new-feature
```

5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

**Shreevatsags**

Built with ❤️ using React, TypeScript, Supabase, and Bun.
