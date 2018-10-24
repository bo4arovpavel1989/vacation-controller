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
      babel = require('gulp-babel');

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

gulp.task('jslibs', function() {
  return gulp.src([  ])
  .pipe(concat('libs.min.js'))
  .pipe(uglify())
  .pipe(gulp.dest('src/js'));
});

gulp.task('css-libs', ['sass'], function() {
  return gulp.src('src/css/libs.css')
  .pipe(cssnano()) // Сжимаем
  .pipe(rename({suffix: '.min'}))
  .pipe(gulp.dest('src/css'));
});

gulp.task('cleanjs', () => {
  return del('src/app');
});

gulp.task('scripts', ['cleanjs'], function(){
  return gulp.src('src/js/**/*.js')
  .pipe(babel())
  .pipe(gulp.dest('src/app'))
});

gulp.task('watch', ['browser-sync', 'css-libs', 'jslibs', 'scripts'], function(){
  gulp.watch('src/sass/**/*.sass', ['sass']);
  gulp.watch('src/*.html', browserSync.reload);
  gulp.watch('src/js/**/*.js', browserSync.reload);
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

gulp.task('build', ['clean', 'img', 'sass', 'jslibs'], function() {

  const buildCss = gulp.src([
    'src/css/main.css',
    'src/css/libs.min.css'
  ])
  .pipe(gulp.dest('dist/css'))

  const buildFonts = gulp.src('src/fonts/**/*')
  .pipe(gulp.dest('dist/fonts'))

  const buildJs = gulp.src('src/js/**/*')
  .pipe(uglify())
  .pipe(gulp.dest('dist/js'))

  const buildHtml = gulp.src('src/*.html')
  .pipe(htmlmin({ collapseWhitespace: true }))
  .pipe(gulp.dest('dist'));

});

gulp.task('clear', function () {
  return cache.clearAll();
})

gulp.task('default', ['watch']);
