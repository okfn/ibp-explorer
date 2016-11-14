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
var gls = require('gulp-live-server')
var spawn = require('child_process').spawn
var runSequence = require('run-sequence')

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
    .pipe(imagemin({ optimizationLevel: 5 }))
    .pipe(gulp.dest('tracker/build/images'));
});

gulp.task('images-travis', ['clean'], function () {
  return gulp.src(paths.images)
    .pipe(gulp.dest('tracker/build/images'));
});

gulp.task('vendor_fonts', ['clean'], function () {
  return gulp.src(paths.vendor_fonts)
    .pipe(gulp.dest('tracker/build/fonts'));
});

gulp.task('manifest', function (callback) {
  return gulp.src(paths.manifest)
    .pipe(clean({ force: true }))
    .pipe(extend('manifest.json'))
    .pipe(gulp.dest('tracker/build'));
});

gulp.task('dev_vendor_styles', function () {
  return gulp.src(paths.vendor_styles)
    .pipe(concat('vendor.css'))
    .pipe(rev())
    .pipe(gulp.dest('tracker/build/styles/'))
    .pipe(rev.manifest())
    .pipe(gulp.dest('tracker/build/styles/1'))
});

gulp.task('dev_vendor_scripts', function () {
  return gulp.src(paths.vendor_scripts)
    .pipe(concat('vendor.js'))
    .pipe(rev())
    .pipe(gulp.dest('tracker/build/scripts/'))
    .pipe(rev.manifest())
    .pipe(gulp.dest('tracker/build/scripts/1'))
});

gulp.task('dev_scripts', ['clean'], function () {
  return gulp.src(paths.scripts)
    .pipe(concat('app.js'))
    .pipe(rev())
    .pipe(gulp.dest('tracker/build/scripts/'))
    .pipe(rev.manifest())
    .pipe(gulp.dest('tracker/build/scripts/2'))
});

gulp.task('dev_styles', function () {
  return gulp.src(paths.styles)
    .pipe(less())
    .pipe(concat('app.css'))
    .pipe(rev())
    .pipe(gulp.dest('tracker/build/styles/'))
    .pipe(rev.manifest())
    .pipe(gulp.dest('tracker/build/styles/2'))
});

gulp.task('tracker-watch', function (cb) {
  gulp.start(['build:dev:tracker'])

  gulp.watch(paths.vendor_styles, function () {
    runSequence('dev_vendor_styles', 'manifest')
  })
  gulp.watch(paths.vendor_scripts, function () {
    runSequence('dev_vendor_scripts', 'manifest')
  });
  gulp.watch(paths.styles, function () {
    runSequence('dev_styles', 'manifest')
  });
  gulp.watch(paths.scripts, function () {
    runSequence('dev_scripts', 'manifest')
  });

  cb()
});


gulp.task('live-server', function () {
  var server = gls(__dirname + '/bin/www', undefined, false)
  server.start()
  gulp.watch('tracker/build/manifest.json', function (file) {
    //we need a server restart so the new tracker bundles are picked up
    server.start()
  })

})

gulp.task('webpack-watch', (cb) => {
  const webpack_watch = spawn('./node_modules/.bin/webpack',
                              ['--watch',
                               '--config',
                               __dirname + '/webpack.config.development.js']);

  webpack_watch.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
    //hacky: inform that webpack finished once it writes on stdout
    cb()
  });

  webpack_watch.stderr.on('data', (data) => {
    console.log(`stderr: ${data}`);
  });

  webpack_watch.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
  });


});

gulp.task('build:prod:tracker', function (cb) {
  runSequence('clean',
              [
                'vendor_styles',
                'vendor_scripts',
                'styles',
                'scripts',
                'vendor_fonts',
                'images'
              ], 'manifest', cb)
})

//Build on travis-ci fails because of imagemin
//This task is intended for building on travis-ci only
gulp.task('build:prod:tracker:travis', function (cb) {
  runSequence('clean',
              [
                'vendor_styles',
                'vendor_scripts',
                'styles',
                'scripts',
                'vendor_fonts',
                'images-travis'
              ], 'manifest', cb)
})

gulp.task('build:dev:tracker', function (cb) {
  runSequence('clean',
              [
                'dev_vendor_styles',
                'dev_vendor_scripts',
                'dev_styles',
                'dev_scripts',
                'vendor_fonts',
                'images'
              ], 'manifest', cb)
})

gulp.task('dev:watch', function () {
  runSequence(['webpack-watch', 'tracker-watch'], 'live-server')
})


