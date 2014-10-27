var gulp = require('gulp');
var handlebars = require('gulp-compile-handlebars');
var rename = require('gulp-rename');
var html = require('./000_HTML.json');

gulp.task('default', function () {
  var options = {}
  
  return gulp.src('000_HTML.hbs')
  .pipe(handlebars(html, options))
  .pipe(rename('000_HTML.html'))
  .pipe(gulp.dest('dist'));
});
