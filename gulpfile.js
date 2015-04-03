var gulp = require('gulp'),
  babel = require('gulp-babel'),
  sourcemaps = require('gulp-sourcemaps'),
  uglify = require('gulp-uglify'),
  src_dir = './src/**/*.js';

gulp.task('default', function () {
  return gulp.src(src_dir)
    .pipe(babel())
    .pipe(sourcemaps.init())
    .pipe(uglify())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('dest/js'));
});
gulp.task('watch', function(){
    gulp.watch(src_dir, ['default']);
});
