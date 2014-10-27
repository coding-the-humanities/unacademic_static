var gulp = require('gulp');
var handlebars = require('gulp-compile-handlebars');
var rename = require('gulp-rename');
var watch = require('gulp-watch');
var yaml = require('gulp-yaml');

var data = 'test.yaml'
var template = 'level000.hbs';

gulp.task('watch', function () {
  gulp.watch(template, ['yaml2json']);
});

gulp.task('to_json', function(){
	var options = {};
	gulp.src("yaml/**.*")
  .pipe(yaml())  
  .pipe(gulp.dest('json'))
})

gulp.task('default', ['to_json'])

