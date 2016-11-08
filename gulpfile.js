var gulp = require('gulp');
var del = require('del');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var imagemin = require('gulp-imagemin');
var less = require('gulp-less');
var minify_css = require('gulp-minify-css');
var rev = require('gulp-rev');
var clean = require('gulp-clean');
var extend = require('gulp-extend');
var gutil = require('gulp-util')
var webpack = require('webpack')
var WebpackDevServer = require('webpack-dev-server')
var webpackConfig = require('./webpack.config.development')

var paths = {
  vendor_scripts: [
    'bower_components/jquery/dist/jquery.js',
    'bower_components/bootstrap/dist/js/bootstrap.js',
    'bower_components/table-fixed-header/table-fixed-header.js',
    'bower_components/ScrollToFixed/jquery-scrolltofixed.js'
  ],
  scripts: 'tracker/scripts/**/*.js',
  vendor_styles: [
    'bower_components/bootstrap/dist/css/bootstrap.css'
  ],
  styles: 'tracker/styles/*.less',
  images: 'tracker/images/**/*',
  vendor_fonts: [
    'bower_components/bootstrap/dist/fonts/glyphicons-halflings-regular.*'
  ],
  rev: [
    'tracker/build/scripts/*.js',
    'tracker/build/styles/*.css'
  ],
  manifest: [
    'tracker/build/scripts/*/rev-manifest.json',
    'tracker/build/styles/*/rev-manifest.json'
  ]
};

gulp.task('clean', function (callback) {
  del(['tracker/build'], callback);
});

gulp.task('vendor_scripts', ['clean'], function () {
  return gulp.src(paths.vendor_scripts)
    .pipe(uglify())
    .pipe(concat('vendor.js'))
    .pipe(rev())
    .pipe(gulp.dest('tracker/build/scripts/'))
    .pipe(rev.manifest())
    .pipe(gulp.dest('tracker/build/scripts/1'));
});

gulp.task('scripts', ['clean'], function () {
  return gulp.src(paths.scripts)
    .pipe(uglify())
    .pipe(concat('app.js'))
    .pipe(rev())
    .pipe(gulp.dest('tracker/build/scripts/'))
    .pipe(rev.manifest())
    .pipe(gulp.dest('tracker/build/scripts/2'));
});

gulp.task('vendor_styles', ['clean'], function () {
  return gulp.src(paths.vendor_styles)
    .pipe(minify_css())
    .pipe(concat('vendor.css'))
    .pipe(rev())
    .pipe(gulp.dest('tracker/build/styles'))
    .pipe(rev.manifest())
    .pipe(gulp.dest('tracker/build/styles/1'));
});

gulp.task('styles', ['clean'], function () {
  return gulp.src(paths.styles)
    .pipe(less())
    .pipe(minify_css())
    .pipe(concat('app.css'))
    .pipe(rev())
    .pipe(gulp.dest('tracker/build/styles'))
    .pipe(rev.manifest())
    .pipe(gulp.dest('tracker/build/styles/2'));
});

gulp.task('images', ['clean'], function () {
  return gulp.src(paths.images)
    .pipe(imagemin({optimizationLevel: 5}))
    .pipe(gulp.dest('tracker/build/images'));
});

gulp.task('vendor_fonts', ['clean'], function () {
  return gulp.src(paths.vendor_fonts)
    .pipe(gulp.dest('tracker/build/fonts'));
});

gulp.task('manifest', function (callback) {
  gulp.src(paths.manifest)
    .pipe(clean({ force: true }))
    .pipe(extend('manifest.json'))
    .pipe(gulp.dest('tracker/build'));
});

gulp.task('dev_vendor_styles', function () {
  return gulp.src(paths.vendor_styles)
    .pipe(concat('vendor.css'))
    .pipe(gulp.dest('tracker/styles/'));
});

gulp.task('dev_vendor_scripts', function () {
  return gulp.src(paths.vendor_scripts)
    .pipe(concat('vendor.js'))
    .pipe(gulp.dest('tracker/scripts/'));
});

gulp.task('dev_styles', function () {
  return gulp.src(paths.styles)
    .pipe(less())
    .pipe(concat('app.css'))
    .pipe(gulp.dest('tracker/styles/'));
});

gulp.task('watch', function () {
  gulp.start(['dev_vendor_styles']);
  gulp.start(['dev_vendor_scripts']);
  gulp.start(['dev_styles']);
  gulp.watch(paths.vendor_styles, ['dev_vendor_styles']);
  gulp.watch(paths.vendor_scripts, ['dev_vendor_scripts']);
  gulp.watch(paths.styles, ['dev_styles']);
});

gulp.task("webpack-dev-server", function(callback) {
  // modify some webpack config options
  var myConfig = Object.create(webpackConfig);
  myConfig.devtool = "eval";
  myConfig.debug = true;

  // Start a webpack-dev-server
  new WebpackDevServer(webpack(myConfig), {
    stats: {
      colors: true
    }
  }).listen(8080, "localhost", function(err) {
    if(err) throw new gutil.PluginError("webpack-dev-server", err);
    gutil.log("[webpack-dev-server]", "http://localhost:8080/");
  });
});

gulp.task('build', ['vendor_scripts', 'scripts', 'vendor_styles', 'styles', 'vendor_fonts', 'images']);
gulp.task('deploy', ['manifest'])
gulp.task('webserver', ['webpack-dev-server'])
