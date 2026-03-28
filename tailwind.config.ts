import type { Config } from 'tailwindcss';

export default {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        panel: '#111827',
        accent: '#38bdf8'
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(56,189,248,0.25), 0 0 16px rgba(56,189,248,0.25)'
      }
    }
  },
  plugins: []
} satisfies Config;
