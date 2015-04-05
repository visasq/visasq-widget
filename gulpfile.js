var gulp = require('gulp'),
  babel = require('gulp-babel'),
  sourcemaps = require('gulp-sourcemaps'),
  uglify = require('gulp-uglify'),
  sass = require('gulp-ruby-sass') ,
  notify = require('gulp-notify') ,
  bower = require('gulp-bower'),
  concat = require('gulp-concat'),
  srcDir = './src/js/script.js',
  distDir = './dist/js',
  distCssDir = './dist/css',
   bowerDir = './src/lib/components' ,
   bootstrapDir = '/bootstrap-sass-official/assets' ,
  sassDir = './src/scss';

gulp.task('bower', function() { 
    return bower()
       .pipe(gulp.dest(bowerDir)) 
});

gulp.task('default', function () {
  return gulp.src([
      bowerDir + '/jquery/jquery.min.js',
      bowerDir + bootstrapDir + '/javascripts/bootstrap.min.js',
      srcDir
    ])
    .pipe(babel())
    .pipe(concat('script.js'))
    .pipe(sourcemaps.init())
    .pipe(uglify().on('error', notify.onError(function (error) {
        return 'Error: ' + error.message;
    })))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(distDir));
});

gulp.task('watch', function(){
    gulp.watch(srcDir, ['default']);
    gulp.watch(sassDir + '/**/*.scss', ['css']);
});

gulp.task('css', function() { 
  return sass(sassDir + '/styles.scss', {
             style: 'compressed',
            compass: true,
             loadPath: [
                 sassDir,
                 bowerDir + bootstrapDir + '/stylesheets'
             ]
        })
    .on('error', notify.onError(function (error) {
        return 'Error: ' + error.message;
    }))
     .pipe(gulp.dest(distCssDir)); 
});

gulp.task('init', ['bower']);
gulp.task('release', ['css', 'default']);
