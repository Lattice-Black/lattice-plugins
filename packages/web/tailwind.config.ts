import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        black: '#000000',
        white: '#FFFFFF',
        gray: {
          100: '#F5F5F5',
          200: '#E5E5E5',
          300: '#dfe6e9',
          400: '#dfe6e9',
          500: '#dfe6e9',
          600: '#dfe6e9',
          700: '#404040',
          800: '#262626',
          900: '#171717',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Courier New', 'monospace'],
      },
      backgroundImage: {
        'dot-pattern': 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)',
      },
      backgroundSize: {
        'dot-size': '20px 20px',
      },
    },
  },
  plugins: [],
}
export default config
