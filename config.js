module.exports = {
  config: {
    tailwindjs: "./tailwind.config.js",
    html: ["./index.html"],
    port: 1234,
  },
  paths: {
    root: "./",
    src: {
      base: "./src",
      css: "./src/assets/css",
      js: "./src/assets/js",
      img: "./src/assets/img",
    },
    dist: {
      base: "./dist",
      css: "./dist/assets/css",
      js: "./dist/assets/js",
      img: "./dist/assets/img",
    },
  },
};