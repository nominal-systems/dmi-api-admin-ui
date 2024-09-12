module.exports = {
  content: [
    "./src/**/*.{html,js,ts,hbs,jsx,tsx}",
  ],
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

