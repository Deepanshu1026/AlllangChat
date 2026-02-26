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
- **💳 Subscription Model**:
  - **Free Plan**: 10 queries per day to explore capabilities.
  - **Pro Plan**: Unlimited queries, priority access, and premium support via **Razorpay** integration.
- **🎙️ Vernacular Voice-to-Voice**:
  - **"Call Mode"**: Converse naturally with Sensiq AI using high-accuracy Indian accents.
  - **Audio Notes**: Record complex queries; Sensiq transcribes and translates them using Sarvam AI's **Saaras v3** and **Bulbul v3** models.
- **⚡ High Performance**: Built with **Vite** for instant loading and hot module replacement.

---

## 🗄️ Database Setup (Supabase)

To enable authentication, conversation history, and subscription tracking, run the following SQL in your Supabase SQL Editor:

```sql
-- 1. Extend users table for subscription info
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'free',
ADD COLUMN IF NOT EXISTS usage_limit INTEGER DEFAULT 10,
ADD COLUMN IF NOT EXISTS usage_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive',
ADD COLUMN IF NOT EXISTS current_period_end TIMESTAMP WITH TIME ZONE;

-- 2. Create payments table to track transactions
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
    razorpay_order_id TEXT UNIQUE NOT NULL,
    razorpay_payment_id TEXT UNIQUE,
    amount DECIMAL NOT NULL,
    currency TEXT DEFAULT 'INR',
    status TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

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
    Create a `.env` file in the root directory and add your credentials:
    ```env
    VITE_SARVAM_API_KEY=your_sarvam_key
    VITE_SUPABASE_URL=your_supabase_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    VITE_RAZORPAY_KEY_ID=rzp_test_aE1ssMlQXiF6eD
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
