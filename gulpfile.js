const
    {
        src, 
        dest, 
        parallel, 
        series, 
        watch
}                  = require('gulp');
    //plugins
const browsersync  = require('browser-sync').create();
const sass         = require('gulp-dart-sass');
const cssnano      = require('gulp-cssnano');
const pug          = require('gulp-pug');
const prefix       = require('gulp-autoprefixer');
const imagemin     = require('gulp-imagemin')
const plumber      = require('gulp-plumber');
const uglify       = require('gulp-uglify');
const rename       = require('gulp-rename');
const clean        = require('gulp-clean');
const changed      = require('gulp-changed');
const notify       = require('gulp-notify');
    //paths
const srcs         =    {
    html    : './**.pug',
    cssDir  : './assets/sass/**',
    css     : './assets/sass/main.scss',
    js      : './assets/js/**',
    img     : './assets/img/**'
};
 const dests = {
     site   : './_site',
     css    : './_site/assets/css',
     js     : './_site/assets/js',
     img    : './_site/assets/img'
};
    // Error Handling

function onError (err) {
    let errorLine   = (err.line) ? 'Line ' + err.line : '',
    errorTitle  = (err.plugin) ? 'Error: [ ' + err.plugin + ' ]' : 'Error';
    notify.logLevel(0);
    notify({
        title: errorTitle,
        message: errorLine
    }).write(err);
    this.emit('end');
};
    //browser Sync
function browserSync () {
    browsersync.init ({
        server : {
            baseDir : dests.site
        },
        port : 3000
    })
};
    //css
function css () {
    return src(srcs.css)
    .pipe(plumber({ errorHandler: onError }))
    .pipe(changed(dests.css))
    .pipe(sass())
    .pipe(prefix({
        overrideBrowserslist: ['last 2 versions'],
        cascade: false
    }))
    .pipe(rename({
        extname: '.min.css'
    }))
    .pipe(cssnano())
    .pipe(dest(dests.css))
    .pipe(browsersync.stream());
};
    //javascript
function js () {
    return src(srcs.js)
    .pipe(plumber({ errorHandler: onError }))
    .pipe(changed(dests.js))
    .pipe(uglify())
    .pipe(rename({
        extname : '.min.js'
    }))
    .pipe(dest(dests.js))
    .pipe(browsersync.stream());
};
    //images
function img () {
    return src(srcs.img)
    .pipe(plumber({ errorHandler: onError }))
    .pipe(imagemin([
        imagemin.svgo({
            plugins : [{removeViewBox: true}]
        })
    ]))
    .pipe(dest(dests.img))
};
    //clear destination
function clear () {
    return src(dests.site, {
        read : false,
        allowEmpty : true
    })
    .pipe(clean());
};
    //HTML
function html () {
    return src(srcs.html)
    .pipe(plumber({ errorHandler: onError }))
    .pipe(pug({
        doctype : 'html',
        pretty : true
    }))
    .pipe(dest(dests.site))
    .pipe(browsersync.stream());
};

    //watch
function watchFiles () {
    watch(srcs.cssDir, css);
    watch(srcs.html, html);
    watch(srcs.js, js);
    watch(srcs.img, img);
};
    //build function
function build () {
    return series(clear, css, js, img, html);
};

// main gulp functions
exports.watch = parallel(build, watchFiles, browserSync);
exports.default = series(clear, parallel(js, css, img, html));
