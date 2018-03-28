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

var paths = {
  pug: './*.pug',
  sass: './assets/sass/*.scss',
  coffee: './assets/coffee/*.coffee',
}

var dest = {
  html: './',
  css: './assets/css',
  js: './assets/js',
  imgs: './assets/imgs'
}

var mapboxVars = {
  accessToken: 'pk.eyJ1IjoieWdkcCIsImEiOiJjamY5bXU1YzgyOHdtMnhwNDljdTkzZjluIn0.YS8NHwrTLvUlZmE8WEEJPg',
  styleUri: 'mapbox://styles/ygdp/cjf9phmuh0t582rmoqk7dp2b3',
  surveyUri: 'mapbox://ygdp.cjfaf000j0nxs2qp8gs7qpy75-2syg1',
  surveyId: 'Survey_8',
  coldspotsUri: 'mapbox://ygdp.cjf9zc8rv1evr2wqwbsym7s86-8iw7q',
  coldspotsId: 'Coldspots_8',
  hotspotsUri: 'mapbox://ygdp.cjf9zw1ys0j8o2wp8qs9iqo81-00bge',
  hotspotsId: 'Hotspots_8'
}

gulp.task('compile-pug', function() {
  return gulp.src(paths.pug)
    .pipe(plumber())
    .pipe(pug())
    .pipe(gulpif(argv.prod, htmlmin({ collapseWhitespace: true })))
    .pipe(gulpif(argv.prod, htmlreplace({ css: 'style.min.css' })))
    .pipe(replace('MAPBOX_VARS', encodeURI(JSON.stringify(mapboxVars))))
    .pipe(replace('imgs/', dest.imgs))
    .pipe(gulp.dest(dest.html))
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

  return gulp.src('./assets/sass/style.scss')
    .pipe(plumber())
    .pipe(sass(options))
    .pipe(gulpif(argv.prod, rename('style.min.css')))
    .pipe(replace('imgs/', dest.imgs))
    .pipe(gulp.dest(dest.css))
  .on('end', function() {
    log('Sass done');
    if (argv.prod) log('CSS minified');
  });
});

gulp.task('compile-coffee', function() {
  return gulp.src('./assets/coffee/scripts.coffee')
    .pipe(coffee({bare: true}))
    .pipe(gulpif(argv.prod, rename('scripts.min.js')))
    .pipe(gulp.dest(dest.js))
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