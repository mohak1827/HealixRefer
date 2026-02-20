/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'medical-green': '#16A34A',
                'medical-blue': '#2563EB',
                'medical-dark': '#111827',
                'medical-gray': '#F3F4F6',
                'medical-light': '#FFFFFF',
                'medical-teal': '#0D9488',
                'urgent-red': '#DC2626',
                'healix-blue': '#3B82F6',
                'healix-navy': '#1E3A5F',
                'healix-teal': '#14B8A6',
            },
            fontFamily: {
                'sans': ['Poppins', 'Inter', 'sans-serif'],
                'display': ['Poppins', 'sans-serif'],
            },
            boxShadow: {
                'soft': '0 4px 20px 0 rgba(0, 0, 0, 0.05)',
                'medical': '0 10px 30px -5px rgba(22, 163, 74, 0.1)',
            },
            borderRadius: {
                'medical': '12px',
            },
            backgroundImage: {
                'light-gradient': 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 30%, #f0fdfa 70%, #f8fafc 100%)',
            },
        },
    },
    plugins: [],
}


