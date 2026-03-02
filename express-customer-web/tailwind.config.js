/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#3b82f6', // bright blue
                    dark: '#1d4ed8',
                },
                secondary: '#64748b',
                success: '#22c55e',
                danger: '#ef4444',
            },
        },
    },
    plugins: [],
}
