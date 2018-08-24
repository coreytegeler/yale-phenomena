var autoprefixer = require('gulp-autoprefixer');
var argv = require('yargs').argv;
var coffee = require('gulp-coffee');
var gulp = require('gulp');
var gulpif = require('gulp-if');
var gutil = require('gulp-util');
var htmlmin = require('gulp-htmlmin');
var htmlreplace = require('gulp-html-replace');
var minify = require('gulp-minify');
var plumber = require('gulp-plumber');
var pug = require('gulp-pug');
var rename = require('gulp-rename');
var replace = require('gulp-replace');
var rupture = require('rupture');
var sass = require('gulp-sass');

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
		css: './assets/',
		js: './assets/',
	},
	prod: {
		html: './dist/',
		css: './dist/assets/',
		js: './dist/assets/',
	}
}

gulp.task('compile-pug', function() {
	return gulp.src('./index.pug')
		.pipe(plumber())
		.pipe(pug())
		.pipe(gulpif(argv.prod, htmlmin({ collapseWhitespace: true })))
		.pipe(gulpif(argv.prod, replace('style.css', 'style.min.css')))
		.pipe(gulpif(argv.prod, replace('scripts.js', 'scripts.min.js')))
		.pipe(gulp.dest(dest[env].html))
	.on('end', function() {
		log('HTML done');
		if (argv.prod) log('HTML minified');
	});
});

gulp.task('compile-sass', function() {
	var options = {
		use: [rupture(), autoprefixer()],
		outputStyle: argv.prod ? 'compressed' : ''
	};
	return gulp.src('./source/sass/style.scss')
		.pipe(plumber())
		.pipe(sass(options))
		.pipe(gulpif(argv.prod, rename('style.min.css')))
		.pipe(gulp.dest(dest[env].css))
	.on('end', function() {
		log('Sass done');
		if (argv.prod) log('CSS minified');
	});
});

gulp.task('compile-coffee', function() {
	return gulp.src('./source/coffee/scripts.coffee')
		.pipe(coffee({bare: true}))
		.pipe(replace('ENVIRONMENT', env))
		.pipe(gulpif(argv.prod, minify({ext:{min: '.min.js'}})))
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