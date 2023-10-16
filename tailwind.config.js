const withMT = require("@material-tailwind/react/utils/withMT");

module.exports = withMT({
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        kojiki: {
          red: "#fe9595",
          blue: "#80beff",
          gray: "#7e7e7e",
          white: "#f0f0f0",
        },
      },
      spacing: {
        kojiki: {
          sm: "12px",
        },
      },
    },
  },
  plugins: [],
});
