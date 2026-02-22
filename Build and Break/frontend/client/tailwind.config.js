/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'medical-green': '#14B8A6', // Vibrant Teal
                'medical-blue': '#3B82F6',
                'medical-dark': '#0f172a', // Dark text color (slate-900)
                'medical-gray': '#f8fafc', // Very light gray for subtle backgrounds
                'medical-light': '#ffffff', // Pure white
                'medical-teal': '#0f766e',
                'urgent-red': '#ef4444',
                'healix-blue': '#3B82F6',
                'healix-navy': '#1e293b',
                'healix-teal': '#14B8A6',
                'dark-surface': '#ffffff',
                'dark-card': '#ffffff',
                'dark-border': '#e2e8f0',
            },
            fontFamily: {
                'sans': ['Poppins', 'Inter', 'sans-serif'],
                'display': ['Poppins', 'sans-serif'],
            },
            boxShadow: {
                'soft': '0 4px 20px 0 rgba(0, 0, 0, 0.3)',
                'medical': '0 10px 30px -5px rgba(20, 184, 166, 0.15)',
                'glow-teal': '0 0 25px rgba(20, 184, 166, 0.2)',
            },
            borderRadius: {
                'medical': '12px',
            },
            backgroundImage: {
                'dark-gradient': 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                'light-gradient': 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
            },
        },
    },
    plugins: [],
}
