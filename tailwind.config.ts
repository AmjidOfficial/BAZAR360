// Bazar360 Enterprise Theme Engine - Tailwind Configuration
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: {
          primary: "var(--color-bg-primary)",
          secondary: "var(--color-bg-secondary)",
          tertiary: "var(--color-bg-tertiary)",
        },
        text: {
          main: "var(--color-text-main)",
          header: "var(--color-text-header)",
          muted: "var(--color-text-muted)",
        },
        border: {
          main: "var(--color-border-main)",
          subtle: "var(--color-border-subtle)",
        },
        accent: {
          main: "var(--color-accent-main)",
          hover: "var(--color-accent-hover)",
        },
        brand: {
          blue: 'var(--color-brand-blue)',
          orange: 'var(--color-brand-orange)',
          darkBg: '#080C14',
          lightBg: '#F8FAFC',
        },
      },
      borderRadius: {
        'neomorphic': '24px',
        'premium': '20px'
      },
      fontFamily: {
        sans: ["Outfit", "Plus Jakarta Sans", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
        display: ["Plus Jakarta Sans", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      letterSpacing: {
        luxury: "0.12em",
        extreme: "0.2em",
      },
      boxShadow: {
        'luxury': '0 16px 40px -12px rgba(0, 0, 0, 0.6)',
        'luxury-glow': '0 0 40px rgba(197, 168, 128, 0.12)',
      }
    },
  },
  plugins: [],
};
