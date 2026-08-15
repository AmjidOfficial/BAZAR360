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
        sans: ["var(--font-sans)", "Inter", "ui-sans-serif", "system-ui"],
        mono: ["var(--font-mono)", "JetBrains Mono", "monospace"],
        display: ["var(--font-display)", "Plus Jakarta Sans", "sans-serif"]
      },
      letterSpacing: {
        luxury: "0.15em",
        extreme: "0.25em",
      },
      boxShadow: {
        'bento': 'var(--shadow-bento)',
        'elevated': 'var(--shadow-elevated)',
        'luxury-glow': '0 0 40px rgba(56, 189, 248, 0.08)',
      }
    },
  },
  plugins: [],
};
