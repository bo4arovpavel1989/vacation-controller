const gulp = require('gulp'),
      sass = require('gulp-sass'),
      browserSync = require('browser-sync'),
      concat = require('gulp-concat'),
      uglify = require('gulp-uglifyjs'),
      cssnano = require('gulp-cssnano'),
      rename = require('gulp-rename'),
      del = require('del'),
      imagemin = require('gulp-imagemin'),
      pngquant = require('imagemin-pngquant'),
      cache = require('gulp-cache'),
      autoprefixer = require('gulp-autoprefixer'),
      htmlmin = require('gulp-htmlmin'),
      babel = require('gulp-babel'),
      browserify = require('browserify'),
      source = require('vinyl-source-stream'),
      livereload = require('gulp-livereload');

gulp.task('sass', function(){
  return gulp.src('src/sass/**/*.sass')
        .pipe(sass())
        .pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true }))
        .pipe(gulp.dest('src/css'))
        .pipe(browserSync.reload({stream: true}))
});

gulp.task('browser-sync', function() {
  browserSync({
    server: {
      baseDir: 'src'
    },
    notify: false
  });
});

gulp.task('scripts', function(){
  return browserify('./src/js/index.js')
    .bundle()
    .pipe(source('bundle.js'))
    .pipe(gulp.dest('./src/app'))
    .pipe(browserSync.reload({stream: true}))
});

gulp.task('watch', ['browser-sync', 'scripts'], function(){
  gulp.watch('src/sass/**/*.sass', ['sass']);
  gulp.watch('src/*.html', browserSync.reload);
  gulp.watch('src/js/**/*.js', ['scripts']);
});

gulp.task('clean', function() {
  return del.sync('dist');
});

gulp.task('img', function() {
  return gulp.src('src/img/**/*')
  .pipe(cache(imagemin({
    interlaced: true,
    progressive: true,
    svgoPlugins: [{removeViewBox: false}],
    use: [pngquant()]
  })))
  .pipe(gulp.dest('dist/img'));
});

gulp.task('build', ['clean', 'img', 'sass'], function() {

  const buildCss = gulp.src([
    'src/css/main.css',
    'src/css/libs.min.css'
  ])
  .pipe(gulp.dest('dist/css'))

  const buildFonts = gulp.src('src/fonts/**/*')
  .pipe(gulp.dest('dist/fonts'))

  const buildJs = gulp.src('src/app/**/*')
  .pipe(babel())
  .pipe(uglify())
  .pipe(gulp.dest('dist/app'))

  const buildHtml = gulp.src('src/*.html')
  .pipe(htmlmin({ collapseWhitespace: true }))
  .pipe(gulp.dest('dist'));

});

gulp.task('clear', function () {
  return cache.clearAll();
})

gulp.task('default', ['watch']);
