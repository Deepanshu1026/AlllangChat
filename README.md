# 🇮🇳 AlllangChat - Indian Multilingual AI Assistant

AlllangChat is a modern, high-performance AI chat application designed specifically for Indian users. Powered by **Sarvam AI's 2B model**, it allows seamless communication in **10 major Indian languages**, delivering accurate and culturally context-aware responses.

![Project Status](https://img.shields.io/badge/Status-Active-success)
![React](https://img.shields.io/badge/React-18-blue)
![Vite](https://img.shields.io/badge/Vite-5-purple)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-cyan)

---

## ✨ Key Features

- **🗣️ Multilingual Support**: Chat naturally in **Hindi, Tamil, Bengali, Telugu, Marathi, Gujarati, Kannada, Malayalam, Punjabi, and English**.
- **🎨 Premium UI/UX**:
  - Dark-themed interface inspired by top-tier AI assistants (ChatGPT/Gemini).
  - Smooth **micro-animations** (fade-ins, slide-ups, scale effects) for a fluid experience.
  - Responsive sidebar with conversation history management.
- **📝 Markdown & Code Support**:
  - Full Markdown rendering (bold, italics, lists).
  - Syntax-highlighted code blocks with **one-click copy** functionality.
- **💾 Local Persistence**: All conversations are automatically saved to your browser's local storage.
- **⚡ High Performance**: Built with **Vite** for instant loading and hot module replacement.

---

## 🛠️ Tech Stack

- **Frontend Framework**: [React](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + Custom Animations
- **Icons**: [Lucide React](https://lucide.dev/)
- **Internationalization**: [i18next](https://www.i18next.com/)
- **AI Model**: [Sarvam AI](https://sarvam.ai/) (Sarvam-2B)

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/yourusername/AlllangChat.git
    cd AlllangChat
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Environment Setup**:
    Create a `.env` file in the root directory and add your Sarvam AI API key:
    ```env
    VITE_SARVAM_API_KEY=your_api_key_here
    ```

4.  **Run the development server**:
    ```bash
    npm run dev
    ```

5.  Open your browser and navigate to `http://localhost:5173`.

---

## 📂 Project Structure

```
AlllangChat/
├── src/
│   ├── components/      # React components (ChatWindow, Sidebar, LanguageSelector)
│   ├── locales/         # Translation files for 10 languages
│   ├── App.jsx          # Main application component
│   ├── main.jsx         # Entry point
│   ├── i18n.js          # Internationalization configuration
│   └── index.css        # Global styles & Tailwind directives
├── public/              # Static assets
├── .env                 # Environment variables
├── index.html           # HTML entry point
├── package.json         # Dependencies and scripts
├── postcss.config.js    # PostCSS configuration
├── tailwind.config.js   # Tailwind CSS configuration
└── vite.config.js       # Vite configuration
```

---

## 📸 Screenshots

*(Add screenshots of your application here to showcase the UI)*

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1.  Fork the project
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Made with ❤️ in India 🇮🇳
