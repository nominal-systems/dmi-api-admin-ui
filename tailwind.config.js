module.exports = {
  content: [
    "./src/**/*.{html,js,ts,hbs,jsx,tsx}",
  ],
  // Built at runtime from the filter dropdown's `width` option, so the scanner cannot see it
  safelist: ['w-72'],
  theme: {
    extend: {},
  },
  plugins: [
    require('flowbite/plugin')({
      charts: true,
      datatables: true,
    })
  ],
  darkMode: 'class'
}

