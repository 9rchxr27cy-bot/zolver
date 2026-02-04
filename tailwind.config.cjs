/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: 'class',
    content: [
        "./index.html",
        "./*.{js,ts,jsx,tsx}",
        "./src/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
        "./screens/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                orange: {
                    50: '#fff1ec',
                    100: '#ffe4d9',
                    200: '#ffc6b0',
                    300: '#ffa788',
                    400: '#ff7d50',
                    500: '#FF5A1F',
                    600: '#e5430b',
                    700: '#b93108',
                    800: '#94270d',
                    900: '#77220e',
                },
                slate: {
                    800: '#262626',
                    850: '#202020',
                    900: '#1A1A1A',
                    950: '#0F0F0F',
                }
            }
        },
    },
    plugins: [],
}
