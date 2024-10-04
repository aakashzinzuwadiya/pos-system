// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      backgroundImage: {
        'admin-page': "url('https://images.unsplash.com/photo-1531497865147-6826b9986505')",
        'pos-page': "url('https://images.unsplash.com/photo-1582418732319-36330bc6a0ae')",
      },
      colors: {
        primary: '#1E3A8A', // Dark Blue
        secondary: '#10B981', // Teal Green
        accent: '#F97316', // Orange
        light: '#F3F4F6', // Light Gray
        dark: '#111827', // Dark Gray
      },
      fontFamily: {
        sans: ['Poppins', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
  "compilerOptions": {
    "moduleResolution": "node",
    "esModuleInterop": true,
    "jsx": "react"
  }
};
