/** @type {import('tailwindcss').Config} */
import typography from '@tailwindcss/typography';

export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Outfit', 'sans-serif'],
            },
            colors: {
                gpt: {
                    dark: '#212121', // Main bg
                    sidebar: '#171717', // Sidebar bg
                    input: '#2F2F2F', // Input bg
                    hover: '#424242', // Hover state
                    border: 'rgba(255,255,255,0.1)',
                }
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-out',
                'slide-up': 'slideUp 0.5s ease-out',
                'pulse-slow': 'pulse 3s infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                }
            }
        },
    },
    plugins: [
        typography,
    ],
}
