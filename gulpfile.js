const { src, dest, parallel, series, watch } = require("gulp");
//plugins
const options = require("./config");
const bsync = require("browser-sync").create();
const postCss = require("gulp-postcss");
const plumber = require("gulp-plumber");
const notify = require("gulp-notify");
const pug = require("gulp-pug");
const concat = require("gulp-concat");
const cleanCSS = require("gulp-clean-css");
const uglify = require("gulp-uglify");
const purgecss = require("gulp-purgecss");
const del = require("del");

// Error Handling
function onError(err) {
  let errorLine = err.line ? "Line " + err.line : "",
    errorTitle = err.plugin ? "Error: [ " + err.plugin + " ]" : "Error";
  notify.logLevel(0);
  notify({
    title: errorTitle,
    message: errorLine,
  }).write(err);
  this.emit("end");
}

// browser Sync
function browserSync(done) {
  browsersync.init({
    server: {
      baseDir: dests.site,
    },
    port: 3000,
  });
  done();
}

// css
function css() {
  let plugins = [require("postcss-import"), require("autoprefixer")];
  return src(`${options.paths.src.css}/**.scss`)
    .pipe(postCss(plugins))
    .pipe(plumber({ errorHandler: onError }))
    .pipe(
      purgecss({
        content: ["src/**/*.{html,pug}"],
        defaultExtractor: (content) => {
          const broadMatches = content.match(/[^<>"'`\s]*[^<>"'`\s:]/g) || [];
          const innerMatches =
            content.match(/[^<>"'`\s.()]*[^<>"'`\s.():]/g) || [];
          return broadMatches.concat(innerMatches);
        },
      })
    )
    .pipe(cleanCSS())
    .pipe(concat({ path: "styles.css" }))
    .pipe(dest(options.paths.dist.css))
    .pipe(bsync.stream());
}

// javascript
function js() {
  return src(
    `${options.paths.src.js}/libs/**/*.js`,
    `${options.paths.src}/*.js`
  )
    .pipe(uglify())
    .pipe(concat({ path: "script.js" }))
    .pipe(dest(options.paths.dist.js))
    .pipe(bsync.stream());
}

// HTML
function html() {
  return src(`${options.paths.src.base}/**.pug`)
    .pipe(
      pug({
        doctype: "html",
        pretty: true,
      })
    )
    .pipe(plumber({ errorHandler: onError }))
    .pipe(dest(options.paths.dist.base))
    .pipe(bsync.stream());
}

// Clean dist folder
function clean() {
  return del(options.paths.dist.base);
}

// Watch files
function watchFiles() {
  watch(`${options.paths.src.base}/*.{html,pug}`, html);
  watch(`${options.paths.src.css}/*.scss`, css);
  watch(`${options.paths.src.js}/*.js`, js);
}

// Gulp default
exports.default = series(
  clean, // Clean Dist Folder
  parallel(js, css, html), //Run All tasks in parallel
  browserSync, // Live Preview Build
  watchFiles // Watch for Live Changes
);
