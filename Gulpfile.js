var gulp = require('gulp');
var handlebars = require('gulp-compile-handlebars');
var rename = require('gulp-rename');
var html = require('./000_HTML.json');
var watch = require('gulp-watch');

var template = 'level000.hbs';

gulp.task('watch', function () {
  gulp.watch(template, ['template']);
});

gulp.task('template', function () {
  var options = {}
  
  return gulp.src('level000.hbs')
  .pipe(handlebars(html, options))
  .pipe(rename('000_HTML.html'))
  .pipe(gulp.dest('dist'));
});
