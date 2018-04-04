/**
 * Dependencys
 */
var gulp = require('gulp'),
    sass = require('gulp-sass'),
    concat = require('gulp-concat'),
    cleanCSS = require('gulp-clean-css'),
    copy = require('gulp-contrib-copy'),
    connect = require('gulp-connect'),
    jshint = require('gulp-jshint');
    stylish = require('jshint-stylish'),
    clean = require('gulp-clean'),
    uglify = require('gulp-uglify'),
    pump = require('pump'),
    runSequence = require('run-sequence'),
    color = require('gulp-color'),
    imagemin = require('gulp-imagemin'),
		pug = require('gulp-pug'),
		autoprefixer = require('gulp-autoprefixer'),
		browserSync = require('browser-sync').create(),
    path = {
      src: './src',
    	dist: './dist'
    };

/**
 * Tasks
 */

// Generates and merges CSS files from SASS
gulp.task('sass', function () {
    return gulp.src(path.src + '/components/**/*.scss')
    .pipe(sass({outputStyle: 'expanded'}).on('error', sass.logError))
    .pipe(concat('styles.css'))
		.pipe(autoprefixer({
        browsers: ['> 0.1%']
    }))
    .pipe(cleanCSS())
    .pipe(gulp.dest(path.dist + '/assets/css'))
		.pipe(browserSync.stream());
});

// Copy JS Files
gulp.task('copyJs', function() {
  gulp.src(path.src + '/components/**/*.js')
    .pipe(concat('app.js'))
    .pipe(gulp.dest(path.dist + '/assets/js'));
});

// Copy assets Files
gulp.task('copyAssets', function() {
  gulp.src([path.src + '/assets/**/*', !path.src + '/assets/images/*'])
    .pipe(copy())
    .pipe(gulp.dest(path.dist + '/assets'));
});

gulp.task('imagemin', function() {
    gulp.src(path.src + '/assets/images/*')
        .pipe(imagemin())
        .pipe(gulp.dest(path.dist + '/assets/images'))
});

// Watches for SCSS, HTML, JS Files
gulp.task('watch', function () {
    gulp.watch(path.src + '/components/**/*.scss', ['sass']);
    gulp.watch(path.src + '/components/**/*.js', ['js-watch']);
		gulp.watch([path.src + '/pages/*.pug', path.src + '/templates/*.pug', path.src + '/components/**/*.pug'], ['pug-watch']);
});


// JS HINT
gulp.task('hintJs', function() {
  return gulp.src(path.src + '/components/**/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter(stylish));
});

// Concat JS
gulp.task('concatJs', function (cb) {
  pump([
        gulp.src(path.src + '/components/**/*.js'),
        concat('app.js'),
        gulp.dest(path.dist + '/assets/js')
    ],
    cb);
});

gulp.task('js-watch', ['hintJs', 'concatJs'], function (done) {
    browserSync.reload();
    done();
});

// Uglify JS
gulp.task('uglifyJs', function (cb) {
  pump([
        gulp.src(path.src + '/components/**/*.js'),
        uglify(),
        gulp.dest(path.dist + '/assets/js')
    ],
    cb);
});

// Process PUG files
gulp.task('pug', function () {
  return gulp.src([path.src + '/pages/*.pug'])
  .pipe(pug({
    pretty: true
  }))
  .on('error', function (error) {
    console.log('An error occurred while compiling jade.\nLook in the console for details.\n' + error);
    this.emit('end');
  })
  .pipe(gulp.dest(path.dist));
});

gulp.task('pug-watch', ['pug'], function (done) {
    browserSync.reload();
    done();
});

// Remove files
gulp.task('clean', function () {
  return gulp.src(path.dist + '/*', {read: false})
    .pipe(clean());
});

//Browser Sync & Server
gulp.task('browser-sync', function() {
    browserSync.init({
        server: {
            baseDir: "./dist"
        }
    });

    gulp.watch(path.scss + '/**/*.scss', ['sass']);
});

gulp.task('dist', function() {
  runSequence('clean', 'sass', 'hintJs', 'pug', 'imagemin', function() {
    console.log(color('SUCCESSFULLY DIST!', 'YELLOW'));
  });
});

gulp.task('dev', function(callback) {
  runSequence('clean', 'sass', 'hintJs', 'pug', 'imagemin', 'copyJs', 'copyAssets', 'watch', 'browser-sync', function() {
    console.log(color('HAPPY DEV!', 'BLUE'));
  });
});

gulp.task('build', function(callback) {
  runSequence('clean', 'sass', 'hintJs', 'pug', 'concatJs', 'uglifyJs', 'imagemin', function() {
    console.log(color('SUCCESSFULLY BUILD!', 'YELLOW'));
  });
});