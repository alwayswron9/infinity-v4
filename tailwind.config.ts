import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--surface-0)",
        foreground: "var(--text-primary)",
        card: {
          DEFAULT: "var(--surface-2)",
          foreground: "var(--text-primary)",
          hover: "var(--surface-3)",
        },
        popover: {
          DEFAULT: "var(--surface-2)",
          foreground: "var(--text-primary)",
        },
        muted: {
          DEFAULT: "var(--surface-1)",
          foreground: "var(--text-secondary)",
        },
        accent: {
          DEFAULT: "var(--surface-2)",
          foreground: "var(--text-primary)",
        },
        destructive: {
          DEFAULT: "var(--status-error)",
          foreground: "#FFFFFF",
        },
        primary: {
          DEFAULT: "var(--brand-primary)",
          foreground: "var(--primary-foreground)",
          hover: "var(--brand-secondary)",
        },
        secondary: {
          DEFAULT: "var(--surface-2)",
          foreground: "var(--text-primary)",
          hover: "var(--surface-3)",
        },
        border: {
          DEFAULT: "var(--border-primary)",
          focus: "var(--border-focus)",
        },
        brand: {
          primary: "var(--brand-primary)",
          secondary: "var(--brand-secondary)",
          tertiary: "var(--brand-tertiary)",
        },
        surface: {
          0: "var(--surface-0)",
          1: "var(--surface-1)",
          2: "var(--surface-2)",
          3: "var(--surface-3)",
        },
        state: {
          hover: "var(--state-hover)",
          focus: "var(--state-focus)",
          active: "var(--state-active)",
          selected: "var(--state-selected)",
        },
        status: {
          success: "var(--status-success)",
          "success-subtle": "var(--status-success-subtle)",
          warning: "var(--status-warning)",
          "warning-subtle": "var(--status-warning-subtle)",
          error: "var(--status-error)",
          "error-subtle": "var(--status-error-subtle)",
          info: "var(--status-info)",
          "info-subtle": "var(--status-info-subtle)",
        },
        text: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          tertiary: "var(--text-tertiary)",
          disabled: "var(--text-disabled)",
        },
        bg: {
          input: "var(--bg-input)",
          error: "var(--bg-error)",
          success: "var(--bg-success)",
        },
        overlay: "var(--overlay)",
        ring: "var(--ring)",
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      fontSize: {
        xs: "var(--text-xs)",
        sm: "var(--text-sm)",
        base: "var(--text-base)",
        lg: "var(--text-lg)",
        xl: "var(--text-xl)",
        "2xl": "var(--text-2xl)",
        "3xl": "var(--text-3xl)",
        "4xl": "var(--text-4xl)",
      },
      spacing: {
        1: "var(--space-1)",
        2: "var(--space-2)",
        3: "var(--space-3)",
        4: "var(--space-4)",
        6: "var(--space-6)",
        8: "var(--space-8)",
        12: "var(--space-12)",
        16: "var(--space-16)",
      },
      borderRadius: {
        lg: "0.5rem",
        md: "0.375rem",
        sm: "0.25rem",
        full: "9999px",
      },
      boxShadow: {
        'subtle': '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
        'none': 'none'
      },
    },
  },
  plugins: [],
} satisfies Config;
