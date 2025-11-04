/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'graph-bg': '#18181B',      // Dark background
        'graph-bar': '#4B5563',     // Bar color
        'graph-bar-hover': '#6B7280', // Bar hover color
        'graph-text': '#9CA3AF',    // Text color
        'graph-active': '#60A5FA',  // Active day color
        'live-dot': '#EF4444',      // Live status dot color
      },
      height: {
        'graph': '12rem',           // Graph height
        'bar': '100%',              // Bar height
      },
      spacing: {
        'graph-spacing': '0.25rem', // Space between bars
      },
      transitionProperty: {
        'height': 'height',
      },
    },
    variants: {
      extend: {
        opacity: ['group-hover'],
        visibility: ['group-hover'],
      },
    },
  },
  plugins: [],
}