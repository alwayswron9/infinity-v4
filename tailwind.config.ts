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
        background: "var(--chakra-colors-gray-900)",
        foreground: "var(--chakra-colors-gray-100)",
        card: {
          DEFAULT: "var(--chakra-colors-gray-800)",
          foreground: "var(--chakra-colors-gray-100)",
          hover: "var(--chakra-colors-gray-700)",
        },
        popover: {
          DEFAULT: "var(--chakra-colors-gray-800)",
          foreground: "var(--chakra-colors-gray-100)",
        },
        muted: {
          DEFAULT: "var(--chakra-colors-gray-800)",
          foreground: "var(--chakra-colors-gray-300)",
        },
        accent: {
          DEFAULT: "var(--chakra-colors-gray-700)",
          foreground: "var(--chakra-colors-gray-100)",
        },
        destructive: {
          DEFAULT: "var(--chakra-colors-red-500)",
          foreground: "var(--chakra-colors-white)",
        },
        primary: {
          DEFAULT: "var(--chakra-colors-purple-500)",
          foreground: "var(--chakra-colors-white)",
          hover: "var(--chakra-colors-purple-600)",
        },
        secondary: {
          DEFAULT: "var(--chakra-colors-gray-700)",
          foreground: "var(--chakra-colors-gray-100)",
          hover: "var(--chakra-colors-gray-600)",
        },
        border: {
          DEFAULT: "var(--chakra-colors-gray-700)",
          focus: "var(--chakra-colors-purple-500)",
        },
        brand: {
          primary: "var(--chakra-colors-purple-500)",
          secondary: "var(--chakra-colors-purple-400)",
          tertiary: "var(--chakra-colors-purple-600)",
        },
        surface: {
          0: "var(--chakra-colors-gray-900)",
          1: "var(--chakra-colors-gray-800)",
          2: "var(--chakra-colors-gray-700)",
          3: "var(--chakra-colors-gray-600)",
        },
        state: {
          hover: "rgba(124, 58, 237, 0.1)",
          focus: "rgba(124, 58, 237, 0.2)",
          active: "rgba(124, 58, 237, 0.3)",
          selected: "rgba(124, 58, 237, 0.15)",
        },
        status: {
          success: "var(--chakra-colors-green-500)",
          "success-subtle": "var(--chakra-colors-green-100)",
          warning: "var(--chakra-colors-orange-500)",
          "warning-subtle": "var(--chakra-colors-orange-100)",
          error: "var(--chakra-colors-red-500)",
          "error-subtle": "var(--chakra-colors-red-100)",
          info: "var(--chakra-colors-blue-500)",
          "info-subtle": "var(--chakra-colors-blue-100)",
        },
        text: {
          primary: "var(--chakra-colors-gray-100)",
          secondary: "var(--chakra-colors-gray-300)",
          tertiary: "var(--chakra-colors-gray-400)",
          disabled: "var(--chakra-colors-gray-500)",
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
        display: ["Inter", "system-ui", "sans-serif"],
        body: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
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
