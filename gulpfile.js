var argv = require('yargs').argv;
var gulpif = require('gulp-if');
var rename = require('gulp-rename');
var gulp = require('gulp');
var gutil = require('gulp-util');
var plumber = require('gulp-plumber');
var pug = require('gulp-pug');
var sass = require('gulp-sass');
var coffee = require('gulp-coffee');
var rupture = require('rupture');
var autoprefixer = require('gulp-autoprefixer');
var htmlmin = require('gulp-htmlmin');
var replace = require('gulp-replace');
var htmlreplace = require('gulp-html-replace');

if(argv.prod) {
  var env = 'prod';
} else if(argv.dev) {
  var env = 'dev';
}

var paths = {
  pug: './**/*.pug',
  sass: './source/sass/*.scss',
  coffee: './source/coffee/*.coffee',
}

var dest = {
  dev: {
    html: './',
    css: './assets/css/',
    js: './assets/js/',
    imgs: './assets/imgs/'
  },
  prod: {
    html: './dist/',
    css: './dist/assets/css/',
    js: './dist/assets/js/',
    imgs: './dist/assets/imgs/'
  }
}

gulp.task('compile-pug', function() {
  return gulp.src('./index.pug')
    .pipe(plumber())
    .pipe(pug())
    .pipe(gulpif(argv.prod, htmlmin({ collapseWhitespace: true })))
    .pipe(gulpif(argv.prod, replace('style.css', 'style.min.css')))
    .pipe(gulpif(argv.prod, replace('scripts.js', 'scripts.min.js')))
    .pipe(replace('imgs/', dest[env].imgs))
    .pipe(gulp.dest(dest[env].html))
  .on('end', function() {
    log('HTML done');
    if (argv.prod) log('HTML minified');
  });
});

gulp.task('compile-sass', function() {
  var options = {
    use: [rupture(), autoprefixer()],
    compress: argv.prod ? true : false
  };
  return gulp.src('./source/sass/style.scss')
    .pipe(plumber())
    .pipe(sass(options))
    .pipe(gulpif(argv.prod, rename('style.min.css')))
    .pipe(replace('imgs/', dest[env].imgs))
    .pipe(gulp.dest(dest[env].css))
  .on('end', function() {
    log('Sass done');
    if (argv.prod) log('CSS minified');
  });
});

gulp.task('compile-coffee', function() {
  return gulp.src('./source/coffee/scripts.coffee')
    .pipe(coffee({bare: true}))
    .pipe(gulpif(argv.prod, rename('scripts.min.js')))
    .pipe(gulpif(argv.prod, replace('ENVIRONMENT', 'prod')))
    .pipe(gulpif(argv.dev, replace('ENVIRONMENT', 'dev')))
    .pipe(gulp.dest(dest[env].js))
  .on('end', function() {
    log('Coffee done');
    if (argv.prod) log('JS minified');
  });
});

gulp.task('watch', function() {
  gulp.watch(paths.pug, ['compile-pug']);
  gulp.watch(paths.sass, ['compile-sass']);
  gulp.watch(paths.coffee, ['compile-coffee']);
});


gulp.task('default', [
  'compile-pug',
  'compile-sass',
  'compile-coffee',
  'watch'
]);

gulp.task('prod', [
  'compile-pug',
  'compile-sass',
  'compile-coffee'
]);

function log(message) {
  gutil.log(gutil.colors.bold.green(message));
}