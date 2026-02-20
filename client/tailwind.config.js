/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'healix-navy': '#0F172A', // Deeper Dark Blue
                'healix-blue': '#2563EB', // Vibrant Blue
                'healix-teal': '#0D9488', // Professional Teal
                'medical-teal': '#14B8A6', // Light Teal accent
                'urgent-red': '#E11D48',
                'white-pure': '#FFFFFF',
                'white-soft': '#F8FAFC',
            },
            fontFamily: {
                'sans': ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
                'display': ['Outfit', 'sans-serif'],
            },
            boxShadow: {
                'healix-sm': '0 10px 40px -10px rgba(15, 23, 42, 0.05)',
                'healix-md': '0 20px 50px -12px rgba(13, 148, 136, 0.1)', // Teal-tinted shadow
                'glass-premium': '0 8px 32px 0 rgba(15, 23, 42, 0.04)',
            },
            borderRadius: {
                'healix': '32px',
            },
            backgroundImage: {
                'gradient-healix': 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
                'gradient-soft': 'linear-gradient(180deg, #F8FAFC 0%, #F1F5F9 100%)',
            }
        },
    },
    plugins: [],
}
