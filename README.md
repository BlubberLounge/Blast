<div align="center">

# 🎉 BLAST

### Party Games Collection

[![Angular](https://img.shields.io/badge/Angular-19-dd0031?style=for-the-badge&logo=angular&logoColor=white)](https://angular.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178c6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![PWA](https://img.shields.io/badge/PWA-Ready-5a0fc8?style=for-the-badge&logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)

**The ultimate party games collection for friends and family**

[Play Now](https://blast.blubber-lounge.de) · [Report Bug](https://github.com/BlubberLounge/Blast/issues) · [Request Feature](https://github.com/BlubberLounge/Blast/issues)

</div>

---

## ✨ Features

- 🎮 **Multiple Party Games** — Undercover, Wörterkette, Lippenlesen, and more
- 📱 **Mobile First** — Optimized for phones and tablets
- 🌐 **PWA Support** — Install as an app on any device
- 🎨 **Beautiful UI** — Glassmorphism design with smooth animations
- ⚡ **Fast & Offline** — Works without internet after first load
- 🔒 **No Account Required** — Jump right in and play

---

## 🎮 Games

### 🕵️ Undercover
A social deduction game where players receive secret words. Most players get the same word, but the Undercover agents get a similar but different word. Find the impostors through clever discussion!

### 🔗 Wörterkette (Word Chain)
A fast-paced word game where each player must say a word starting with the last letter of the previous word. Think fast or get a strike!

### 👄 Lippenlesen (Lip Reading)
One player silently mouths a word while others try to guess what they're saying. Perfect for hilarious misunderstandings!

### 🎨 Montagsmaler (Coming Soon)
Classic drawing and guessing game. One draws, others guess!

### 🧠 Kopfkino (Coming Soon)
Imagination game with creative prompts and storytelling.

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Angular 19 with Signals |
| Styling | Tailwind CSS 4 |
| Language | TypeScript 5.8 |
| Build | Vite + esbuild |
| PWA | Angular Service Worker |
| Icons | Custom SVG |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- npm 10+

### Installation

```bash
# Clone the repository
git clone https://github.com/BlubberLounge/Blast.git
cd Blast

# Install dependencies
npm install

# Start development server
npm start
```

Open [http://localhost:4200](http://localhost:4200) in your browser.

---

## 📦 Build

```bash
# Development build
npm run build

# Production build with obfuscation
npm run build:prod
```

The production build includes:
- Code minification and tree-shaking
- JavaScript obfuscation for source protection
- Service worker for offline support
- Optimized assets

---

## 📁 Project Structure

```
src/
├── app/
│   ├── pages/           # Game components
│   │   ├── home/        # Game selection
│   │   ├── undercover/  # Undercover game
│   │   ├── woerterkette/# Word chain game
│   │   └── lippenlesen/ # Lip reading game
│   ├── services/        # Game state & logic
│   ├── models/          # TypeScript interfaces
│   └── data/            # Word lists & content
├── assets/              # Images & static files
└── styles.css           # Global styles
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

All rights reserved © 2026 [Blubber Lounge](https://blubber-lounge.de)

---

<div align="center">

Made with ❤️ by **Blubber Lounge**

[Website](https://blubber-lounge.de) · [GitHub](https://github.com/BlubberLounge)

</div>
