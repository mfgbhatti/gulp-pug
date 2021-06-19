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
const concat       = require('gulp-concat');
const clean        = require('gulp-clean');
const changed      = require('gulp-changed');
    //paths
const srcs         =    {
    html    : ['./**.pug'],
    css     : ['./assets/sass/main.scss'],
    js      : ['./assets/js/*.js'],
    img     : ['./assets/img/**']
};
 const dests = {
     site   : ['./_site'],
     css    : ['./_site/assets/css'],
     js     : ['./_site/assets/js'],
     img    : ['./_site/assets/img']
 };
    //browser Sync
function browserSync () {
    browsersync.init ({
        server : {
            baseDir = dests.site
        },
        port : 3000
    })
};
function browserSyncReload (done) {
    browsersync.reload();
    done();
};
    //css
function css () {
    return src(srcs.css)
    .pipe(plumber())
    .pipe(changed(srcs.css))
    .pipe(sass())
    .pipe(prefix({
        overrideBrowserslist: ['last 2 versions'],
        cascade: false
    }))
    .pipe(rename({
        extname: 'min.css'
    }))
    .pipe(cssnano())
    .pipe(dest(dests.css))
    .pipe(browsersync.stream());
};
    //javascript
function js () {
    return src(srcs.js)
    .pipe(plumber())
    .pipe(changed(srcs.js))
    .pipe(concat('bundle.js'))
    .pipe(uglify())
    .pipe(rename({
        extname : 'min.js'
    }))
    .pipe(dest(dests.js))
    .pipe(browsersync.stream());
};
    //images
function img () {
    return src(srcs.img)
    .pipe(plumber())
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
        read : false
    })
    .pipe(clean());
};
    //HTML
function html () {
    return src(srcs.html)
    .pipe(plumber())
    .pipe(pug({
        doctype : 'html',
        pretty : true
    }))
    .pipe(dest(dests.site))
    .pipe(browsersync.stream());
};

    //watch
function watchFiles () {
    watch(srcs.html, html);
    watch(srcs.img, img);
    watch(srcs.js, js);
    watch(srcs.css, css);
};

// main gulp functions
exports.watch = parallel(watchFiles, browserSync);
exports.default = series(clear, parallel(js, css, img, html));
